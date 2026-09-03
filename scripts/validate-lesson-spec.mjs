import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_ROOT = path.join(ROOT, 'lesson-specs');
const LESSON_PLAYER_FILE = path.join(ROOT, 'lesson-player-data.json');
const MATERIAL_ROOT = path.join(ROOT, 'materyaller');
const STRICT = process.argv.includes('--strict');

const COURSE_DATA = new Map([
  ['5-sinif', 'data/5-sinif.json'],
  ['6-sinif', 'data/6-sinif.json']
]);

const ALLOWED_PHASES = new Set([
  'giris',
  'kesfetme',
  'dogrudan-ogretim',
  'uygulama',
  'tartisma',
  'pekistirme',
  'degerlendirme',
  'kapanis'
]);

const ALLOWED_EVIDENCE_MODES = new Set([
  'oral',
  'observation',
  'worksheet',
  'quiz',
  'product',
  'peer-review'
]);

const ALLOWED_MATERIAL_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf',
  '.docx'
]);

const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'course',
  'week',
  'learningOutcomes',
  'resources',
  'periods'
]);

const PERIOD_KEYS = new Set(['periodNo', 'title', 'plannedMinutes', 'steps']);
const STEP_KEYS = new Set([
  'id',
  'phase',
  'minutes',
  'curriculumRefs',
  'teacherAction',
  'studentAction',
  'teacherPrompt',
  'resourceRefs',
  'evidence',
  'support',
  'enrichment'
]);
const EVIDENCE_KEYS = new Set(['observable', 'criterion', 'mode']);
const MATERIAL_RESOURCE_KEYS = new Set([
  'kind',
  'type',
  'indexes',
  'requiresTechnology',
  'fallbackResourceRef'
]);
const PLAYER_RESOURCE_KEYS = new Set([
  'kind',
  'activityId',
  'requiresTechnology',
  'fallbackResourceRef'
]);
const TEACHER_LED_RESOURCE_KEYS = new Set([
  'kind',
  'description',
  'requiresTechnology',
  'fallbackResourceRef'
]);

const errors = [];
const warnings = [];

function fail(file, message) {
  errors.push(`${relative(file)}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${relative(file)}: ${message}`);
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function checkUnknownKeys(file, object, allowed, label) {
  if (!isObject(object)) return;
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) fail(file, `${label}: desteklenmeyen alan "${key}".`);
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    fail(file, `JSON okunamadı: ${error.message}`);
    return null;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function findSpecFiles() {
  const files = [];
  if (!(await exists(SPEC_ROOT))) return files;

  const courseEntries = await readdir(SPEC_ROOT, { withFileTypes: true });
  for (const courseEntry of courseEntries) {
    if (!courseEntry.isDirectory()) continue;
    const courseDir = path.join(SPEC_ROOT, courseEntry.name);
    const entries = await readdir(courseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /^hafta\d+\.json$/i.test(entry.name)) {
        files.push(path.join(courseDir, entry.name));
      }
    }
  }
  return files.sort();
}

function extractOutcomeIds(text) {
  if (!isNonEmptyString(text)) return [];
  return [...text.matchAll(/BTY\.\d+\.\d+\.\d+/g)].map((match) => match[0]);
}

function extractComponentLabel(text) {
  if (!isNonEmptyString(text)) return null;
  const match = text.trim().match(/^([a-zçğıöşü]+)\)/iu);
  return match ? match[1].toLocaleLowerCase('tr-TR') : null;
}

function expectedCurriculumRefs(weekData, file) {
  const outcomes = extractOutcomeIds(weekData.ogrenme_ciktisi);
  const components = Array.isArray(weekData.surec_bilesenleri)
    ? weekData.surec_bilesenleri
    : [];

  if (outcomes.length === 0 || components.length === 0) return [];

  const groups = [];
  let current = [];
  for (const component of components) {
    const label = extractComponentLabel(component);
    if (!label) {
      fail(file, `Canonical süreç bileşeni etiketi çözülemedi: "${component}".`);
      continue;
    }
    if (label === 'a' && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(label);
  }
  if (current.length > 0) groups.push(current);

  if (groups.length !== outcomes.length) {
    fail(
      file,
      `Canonical süreç bileşenleri öğrenme çıktılarına güvenle eşlenemedi: ${outcomes.length} çıktı, ${groups.length} bileşen grubu.`
    );
    return [];
  }

  return outcomes.flatMap((outcome, index) =>
    groups[index].map((label) => `${outcome}.${label}`)
  );
}

function parseExpectedPeriods(dersSaati) {
  if (!isNonEmptyString(dersSaati)) return null;
  const compact = dersSaati.replaceAll(' ', '');
  if (/^\d+$/.test(compact)) return Number(compact);
  if (/^\d+(\+\d+)+$/.test(compact)) {
    return compact.split('+').reduce((sum, part) => sum + Number(part), 0);
  }
  return null;
}

function checkStructure(spec, file) {
  if (!isObject(spec)) {
    fail(file, 'Spec kök değeri object olmalı.');
    return;
  }

  checkUnknownKeys(file, spec, TOP_LEVEL_KEYS, 'spec');

  if (spec.schemaVersion !== 1) fail(file, 'schemaVersion yalnızca 1 olabilir.');
  if (!isNonEmptyString(spec.course)) fail(file, 'course boş olmayan string olmalı.');
  if (!isPositiveInteger(spec.week)) fail(file, 'week pozitif integer olmalı.');

  if (!Array.isArray(spec.learningOutcomes) || spec.learningOutcomes.length === 0) {
    fail(file, 'learningOutcomes en az bir öğe içeren dizi olmalı.');
  } else {
    const unique = new Set();
    for (const outcome of spec.learningOutcomes) {
      if (!isNonEmptyString(outcome)) fail(file, 'learningOutcomes yalnızca boş olmayan string içermeli.');
      if (unique.has(outcome)) fail(file, `learningOutcomes tekrar ediyor: ${outcome}`);
      unique.add(outcome);
    }
  }

  if (!isObject(spec.resources)) fail(file, 'resources object olmalı.');
  if (!Array.isArray(spec.periods) || spec.periods.length === 0) {
    fail(file, 'periods en az bir period içermeli.');
    return;
  }

  const periodNos = new Set();
  const stepIds = new Set();

  for (const [periodIndex, period] of spec.periods.entries()) {
    const label = `periods[${periodIndex}]`;
    if (!isObject(period)) {
      fail(file, `${label} object olmalı.`);
      continue;
    }
    checkUnknownKeys(file, period, PERIOD_KEYS, label);

    if (!isPositiveInteger(period.periodNo)) fail(file, `${label}.periodNo pozitif integer olmalı.`);
    if (periodNos.has(period.periodNo)) fail(file, `Tekrarlanan periodNo: ${period.periodNo}`);
    periodNos.add(period.periodNo);

    if (!isNonEmptyString(period.title)) fail(file, `${label}.title boş olmayan string olmalı.`);
    if (!isPositiveInteger(period.plannedMinutes)) fail(file, `${label}.plannedMinutes pozitif integer olmalı.`);
    if (!Array.isArray(period.steps) || period.steps.length === 0) {
      fail(file, `${label}.steps en az bir adım içermeli.`);
      continue;
    }

    for (const [stepIndex, step] of period.steps.entries()) {
      const stepLabel = `${label}.steps[${stepIndex}]`;
      if (!isObject(step)) {
        fail(file, `${stepLabel} object olmalı.`);
        continue;
      }
      checkUnknownKeys(file, step, STEP_KEYS, stepLabel);

      if (!isNonEmptyString(step.id) || !/^[a-z0-9-]+$/.test(step.id)) {
        fail(file, `${stepLabel}.id yalnız küçük harf, rakam ve tire içermeli.`);
      } else if (stepIds.has(step.id)) {
        fail(file, `Tekrarlanan step id: ${step.id}`);
      } else {
        stepIds.add(step.id);
      }

      if (!ALLOWED_PHASES.has(step.phase)) fail(file, `${stepLabel}.phase geçersiz: ${step.phase}`);
      if (!isPositiveInteger(step.minutes)) fail(file, `${stepLabel}.minutes pozitif integer olmalı.`);
      if (!Array.isArray(step.curriculumRefs)) fail(file, `${stepLabel}.curriculumRefs dizi olmalı.`);
      if (!isNonEmptyString(step.teacherAction)) fail(file, `${stepLabel}.teacherAction boş olmayan string olmalı.`);
      if (!isNonEmptyString(step.studentAction)) fail(file, `${stepLabel}.studentAction boş olmayan string olmalı.`);
      if (!Array.isArray(step.resourceRefs)) fail(file, `${stepLabel}.resourceRefs dizi olmalı.`);

      if (step.evidence !== undefined) {
        if (!isObject(step.evidence)) {
          fail(file, `${stepLabel}.evidence object olmalı.`);
        } else {
          checkUnknownKeys(file, step.evidence, EVIDENCE_KEYS, `${stepLabel}.evidence`);
          if (!isNonEmptyString(step.evidence.observable)) {
            fail(file, `${stepLabel}.evidence.observable boş olmayan string olmalı.`);
          }
          if (!ALLOWED_EVIDENCE_MODES.has(step.evidence.mode)) {
            fail(file, `${stepLabel}.evidence.mode geçersiz: ${step.evidence.mode}`);
          }
          if (step.evidence.criterion !== undefined && typeof step.evidence.criterion !== 'string') {
            fail(file, `${stepLabel}.evidence.criterion string olmalı.`);
          }
        }
      }
    }
  }

  if (isObject(spec.resources)) {
    for (const [resourceId, resource] of Object.entries(spec.resources)) {
      if (!/^[a-z0-9-]+$/.test(resourceId)) {
        fail(file, `Resource id yalnız küçük harf, rakam ve tire içermeli: ${resourceId}`);
      }
      if (!isObject(resource)) {
        fail(file, `Resource ${resourceId} object olmalı.`);
        continue;
      }

      if (resource.kind === 'material') {
        checkUnknownKeys(file, resource, MATERIAL_RESOURCE_KEYS, `resources.${resourceId}`);
        if (!isNonEmptyString(resource.type)) fail(file, `resources.${resourceId}.type gerekli.`);
        const validIndexes = resource.indexes === 'all' || (
          Array.isArray(resource.indexes) &&
          resource.indexes.length > 0 &&
          resource.indexes.every((index) => typeof index === 'string' && /^\d{2}$/.test(index)) &&
          new Set(resource.indexes).size === resource.indexes.length
        );
        if (!validIndexes) fail(file, `resources.${resourceId}.indexes "all" veya benzersiz iki haneli indeks dizisi olmalı.`);
      } else if (resource.kind === 'lessonPlayer') {
        checkUnknownKeys(file, resource, PLAYER_RESOURCE_KEYS, `resources.${resourceId}`);
        if (!isNonEmptyString(resource.activityId)) fail(file, `resources.${resourceId}.activityId gerekli.`);
      } else if (resource.kind === 'teacherLed') {
        checkUnknownKeys(file, resource, TEACHER_LED_RESOURCE_KEYS, `resources.${resourceId}`);
        if (!isNonEmptyString(resource.description)) fail(file, `resources.${resourceId}.description gerekli.`);
      } else {
        fail(file, `resources.${resourceId}.kind desteklenmiyor: ${resource.kind}`);
      }

      if (resource.requiresTechnology !== undefined && typeof resource.requiresTechnology !== 'boolean') {
        fail(file, `resources.${resourceId}.requiresTechnology boolean olmalı.`);
      }
      if (resource.fallbackResourceRef !== undefined && !isNonEmptyString(resource.fallbackResourceRef)) {
        fail(file, `resources.${resourceId}.fallbackResourceRef boş olmayan string olmalı.`);
      }
    }
  }
}

function checkCanonical(spec, weekData, file) {
  const canonicalOutcomes = extractOutcomeIds(weekData.ogrenme_ciktisi);
  const actualOutcomes = Array.isArray(spec.learningOutcomes) ? spec.learningOutcomes : [];

  const canonicalSet = new Set(canonicalOutcomes);
  const actualSet = new Set(actualOutcomes);

  for (const outcome of canonicalSet) {
    if (!actualSet.has(outcome)) fail(file, `Canonical öğrenme çıktısı spec'te eksik: ${outcome}`);
  }
  for (const outcome of actualSet) {
    if (!canonicalSet.has(outcome)) fail(file, `Canonical haftada bulunmayan öğrenme çıktısı kullanılmış: ${outcome}`);
  }

  const expectedRefs = new Set(expectedCurriculumRefs(weekData, file));
  const usedRefs = new Set();
  for (const period of spec.periods ?? []) {
    for (const step of period.steps ?? []) {
      for (const ref of step.curriculumRefs ?? []) {
        if (!isNonEmptyString(ref)) {
          fail(file, `Boş/geçersiz curriculumRef kullanılmış.`);
          continue;
        }
        usedRefs.add(ref);
      }
    }
  }

  for (const ref of expectedRefs) {
    if (!usedRefs.has(ref)) fail(file, `Süreç bileşeni hiçbir step tarafından kapsanmıyor: ${ref}`);
  }
  for (const ref of usedRefs) {
    if (!expectedRefs.has(ref)) fail(file, `Canonical haftada bulunmayan curriculumRef kullanılmış: ${ref}`);
  }
}

function checkPeriods(spec, weekData, file) {
  const expectedPeriodCount = parseExpectedPeriods(weekData.ders_saati);
  if (expectedPeriodCount === null) {
    if (!weekData.ozel_hafta) {
      fail(file, `Canonical ders_saati çözülemedi: "${weekData.ders_saati}".`);
    }
    return;
  }

  if (spec.periods.length !== expectedPeriodCount) {
    fail(file, `Period sayısı ${spec.periods.length}; canonical ders_saati ${weekData.ders_saati} için ${expectedPeriodCount} period bekleniyor.`);
  }

  const expectedNos = new Set(Array.from({ length: expectedPeriodCount }, (_, index) => index + 1));
  const actualNos = new Set(spec.periods.map((period) => period.periodNo));
  for (const no of expectedNos) {
    if (!actualNos.has(no)) fail(file, `Beklenen periodNo eksik: ${no}`);
  }
  for (const no of actualNos) {
    if (!expectedNos.has(no)) fail(file, `Beklenmeyen periodNo: ${no}`);
  }

  let weekMinutes = 0;
  for (const period of spec.periods) {
    const stepMinutes = (period.steps ?? []).reduce(
      (sum, step) => sum + (isPositiveInteger(step.minutes) ? step.minutes : 0),
      0
    );
    if (stepMinutes !== period.plannedMinutes) {
      fail(file, `Period ${period.periodNo}: step süreleri ${stepMinutes} dk, plannedMinutes ${period.plannedMinutes} dk.`);
    }
    if (period.plannedMinutes !== 40) {
      fail(file, `Period ${period.periodNo}: canonical ders birimi 40 dk; plannedMinutes ${period.plannedMinutes}.`);
    }
    weekMinutes += period.plannedMinutes;

    const firstPhase = period.steps?.[0]?.phase;
    const lastPhase = period.steps?.at(-1)?.phase;
    if (firstPhase !== 'giris') warn(file, `Period ${period.periodNo}: ilk phase "giris" değil (${firstPhase ?? 'yok'}).`);
    if (lastPhase !== 'kapanis') warn(file, `Period ${period.periodNo}: son phase "kapanis" değil (${lastPhase ?? 'yok'}).`);

    const hasEvidence = (period.steps ?? []).some(
      (step) => isObject(step.evidence) && isNonEmptyString(step.evidence.observable) && ALLOWED_EVIDENCE_MODES.has(step.evidence.mode)
    );
    if (!hasEvidence) fail(file, `Period ${period.periodNo}: anlamlı evidence tanımlı değil.`);
  }

  const expectedWeekMinutes = expectedPeriodCount * 40;
  if (weekMinutes !== expectedWeekMinutes) {
    fail(file, `Haftalık süre ${weekMinutes} dk; canonical ders_saati ${weekData.ders_saati} için ${expectedWeekMinutes} dk bekleniyor.`);
  }
}

async function materialIndexExists(course, week, resource, index) {
  const weekDir = `hafta${String(week).padStart(2, '0')}`;
  const dir = path.join(MATERIAL_ROOT, course, weekDir, ...resource.type.split('/'));
  if (!(await exists(dir))) return false;

  const entries = await readdir(dir, { withFileTypes: true });
  return entries.some((entry) => {
    if (!entry.isFile()) return false;
    const parsed = path.parse(entry.name);
    return parsed.name === index && ALLOWED_MATERIAL_EXTENSIONS.has(parsed.ext.toLowerCase());
  });
}

async function materialFolderHasAny(course, week, resource) {
  const weekDir = `hafta${String(week).padStart(2, '0')}`;
  const dir = path.join(MATERIAL_ROOT, course, weekDir, ...resource.type.split('/'));
  if (!(await exists(dir))) return false;
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.some((entry) => entry.isFile() && ALLOWED_MATERIAL_EXTENSIONS.has(path.extname(entry.name).toLowerCase()));
}

function lessonPlayerActivityIds(lessonPlayerData, course, week) {
  const weekKey = String(week).padStart(2, '0');
  const activities = lessonPlayerData?.courses?.[course]?.weeks?.[weekKey]?.lessonPlayer?.activities;
  if (!Array.isArray(activities)) return new Set();
  return new Set(activities.map((activity) => activity?.id).filter(isNonEmptyString));
}

function checkFallbackCycles(resources, file) {
  const visitState = new Map();

  function visit(id, trail = []) {
    const state = visitState.get(id);
    if (state === 'done') return;
    if (state === 'visiting') {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(Math.max(cycleStart, 0)), id].join(' -> ');
      fail(file, `Fallback döngüsü bulundu: ${cycle}`);
      return;
    }

    visitState.set(id, 'visiting');
    const next = resources[id]?.fallbackResourceRef;
    if (next && resources[next]) visit(next, [...trail, id]);
    visitState.set(id, 'done');
  }

  for (const id of Object.keys(resources)) visit(id);
}

async function checkResources(spec, lessonPlayerData, file) {
  const resources = isObject(spec.resources) ? spec.resources : {};

  for (const period of spec.periods ?? []) {
    for (const step of period.steps ?? []) {
      const refs = Array.isArray(step.resourceRefs) ? step.resourceRefs : [];
      for (const ref of refs) {
        if (!isNonEmptyString(ref)) {
          fail(file, `Step ${step.id ?? '(idsiz)'}: geçersiz resourceRef.`);
          continue;
        }
        if (!resources[ref]) fail(file, `Step ${step.id ?? '(idsiz)'}: resourceRef tanımsız: ${ref}`);
      }
    }
  }

  const activityIds = lessonPlayerActivityIds(lessonPlayerData, spec.course, spec.week);

  for (const [resourceId, resource] of Object.entries(resources)) {
    if (!isObject(resource)) continue;

    if (resource.requiresTechnology === true && !isNonEmptyString(resource.fallbackResourceRef)) {
      fail(file, `Resource ${resourceId}: requiresTechnology=true fakat fallbackResourceRef yok.`);
    }

    if (isNonEmptyString(resource.fallbackResourceRef) && !resources[resource.fallbackResourceRef]) {
      fail(file, `Resource ${resourceId}: fallbackResourceRef tanımsız: ${resource.fallbackResourceRef}`);
    }

    if (resource.kind === 'material' && isNonEmptyString(resource.type)) {
      if (resource.indexes === 'all') {
        if (!(await materialFolderHasAny(spec.course, spec.week, resource))) {
          fail(file, `Resource ${resourceId}: materyal klasörü yok veya desteklenen dosya içermiyor (${resource.type}).`);
        }
      } else if (Array.isArray(resource.indexes)) {
        for (const index of resource.indexes) {
          if (!(await materialIndexExists(spec.course, spec.week, resource, index))) {
            fail(file, `Resource ${resourceId}: materyal bulunamadı ${resource.type}/${index}.*`);
          }
        }
      }
    }

    if (resource.kind === 'lessonPlayer' && isNonEmptyString(resource.activityId)) {
      if (!activityIds.has(resource.activityId)) {
        fail(file, `Resource ${resourceId}: Lesson Player activityId bulunamadı: ${resource.activityId}`);
      }
    }
  }

  checkFallbackCycles(resources, file);
}

async function loadCanonicalCourse(course, file) {
  const relativeDataFile = COURSE_DATA.get(course);
  if (!relativeDataFile) {
    fail(file, `course için canonical veri eşlemesi tanımlı değil: ${course}`);
    return null;
  }
  return readJson(path.join(ROOT, relativeDataFile));
}

function findWeek(courseData, week) {
  return Array.isArray(courseData?.weeks)
    ? courseData.weeks.find((item) => item?.hafta_no === week)
    : null;
}

async function checkStrictCoverage(specFiles) {
  if (!STRICT) return;
  const existing = new Set(
    specFiles.map((file) => relative(file).replace(/^lesson-specs\//, ''))
  );

  for (const [course, dataPath] of COURSE_DATA.entries()) {
    const file = path.join(ROOT, dataPath);
    const data = await readJson(file);
    if (!data) continue;
    for (const week of data.weeks ?? []) {
      if (week?.ozel_hafta || extractOutcomeIds(week?.ogrenme_ciktisi).length === 0) continue;
      const expected = `${course}/hafta${String(week.hafta_no).padStart(2, '0')}.json`;
      if (!existing.has(expected)) fail(file, `--strict: lesson spec eksik: lesson-specs/${expected}`);
    }
  }
}

async function main() {
  const specFiles = await findSpecFiles();
  const lessonPlayerData = await readJson(LESSON_PLAYER_FILE);

  if (specFiles.length === 0) {
    const message = 'Doğrulanacak lesson spec bulunamadı.';
    if (STRICT) errors.push(message);
    else warnings.push(message);
  }

  for (const file of specFiles) {
    const spec = await readJson(file);
    if (!spec) continue;

    checkStructure(spec, file);

    const courseData = await loadCanonicalCourse(spec.course, file);
    if (!courseData) continue;
    const weekData = findWeek(courseData, spec.week);
    if (!weekData) {
      fail(file, `Canonical course verisinde hafta bulunamadı: ${spec.week}`);
      continue;
    }
    if (weekData.ozel_hafta) {
      warn(file, `Canonical hafta özel hafta olarak işaretli; lesson spec gerekliliğini manuel kontrol et.`);
    }

    checkCanonical(spec, weekData, file);
    checkPeriods(spec, weekData, file);
    await checkResources(spec, lessonPlayerData, file);
  }

  await checkStrictCoverage(specFiles);

  if (warnings.length > 0) {
    console.log(`\nLesson spec warnings (${warnings.length}):`);
    for (const item of warnings) console.log(`  - ${item}`);
  }

  if (errors.length > 0) {
    console.error(`\nLesson spec validation failed (${errors.length} error):`);
    for (const item of errors) console.error(`  - ${item}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Lesson spec validation passed: ${specFiles.length} spec checked${STRICT ? ' (strict)' : ''}.`);
}

await main();
