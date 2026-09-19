import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, 'data', '5-sinif-content-state.json');
const AGENTS = path.join(ROOT, 'AGENTS.md');
const LEGACY_WEEKLY_PLAN_NAME = 'keskinlab-5-sinif-hafta-plani-2026-2027.json';
const errors = [];

function fail(message) {
  errors.push(message);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function countFiles(directory, extension) {
  if (!(await exists(directory))) return 0;
  return (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && (!extension || path.extname(entry.name).toLowerCase() === extension))
    .length;
}

async function validateMaterialPackage(weekNumber, materialPackage) {
  const root = path.join(ROOT, materialPackage.root);
  const countedFolders = [
    ['presentationSlides', 'sunum', '.png'],
    ['infographics', 'infografik', '.png'],
    ['weekSummaries', 'hafta-ozeti', '.png'],
    ['lessonNoteImages', 'ders-notu', '.png']
  ];
  for (const [field, folder, extension] of countedFolders) {
    if (materialPackage[field] === undefined) continue;
    const actual = await countFiles(path.join(root, folder), extension);
    if (actual !== materialPackage[field]) fail(`week ${weekNumber}: ${field} is ${actual}, ledger says ${materialPackage[field]}`);
  }

  const listedFiles = [
    'lessonNotes',
    'studentActivities',
    'teacherMaterials',
    'studentDocuments',
    'teacherDocuments'
  ];
  for (const field of listedFiles) {
    for (const relative of materialPackage[field] || []) {
      if (!(await exists(path.join(root, relative)))) fail(`week ${weekNumber}: missing material ${relative}`);
    }
  }
  if (materialPackage.documentsManifest && !(await exists(path.join(root, materialPackage.documentsManifest)))) {
    fail(`week ${weekNumber}: documents manifest is missing`);
  }
}

async function validateLedger() {
  if (!(await exists(LEDGER))) {
    fail('data/5-sinif-content-state.json is missing');
    return;
  }

  let ledger;
  try {
    ledger = JSON.parse(await fs.readFile(LEDGER, 'utf8'));
  } catch (error) {
    fail(`continuity ledger is not valid JSON: ${error.message}`);
    return;
  }

  if (ledger.schemaVersion !== 1) fail('continuity ledger schemaVersion must be 1');
  if (ledger.course !== '5-sinif') fail('continuity ledger course must be 5-sinif');
  if (ledger.status !== 'active') fail('continuity ledger status must be active');
  if (!Array.isArray(ledger.weeks) || ledger.weeks.length === 0) {
    fail('continuity ledger must contain at least one completed week');
    return;
  }

  for (let index = 0; index < ledger.weeks.length; index += 1) {
    const week = ledger.weeks[index];
    const expected = index + 1;
    if (week.week !== expected) fail(`continuity weeks must be sequential: expected ${expected}, got ${week.week}`);
    if (!week.packageStatus) fail(`week ${expected}: packageStatus is required`);
    if (!week.pedagogicalEndpoint) fail(`week ${expected}: pedagogicalEndpoint is required`);
    if (!week.nextWeekStart) fail(`week ${expected}: nextWeekStart is required`);
    if (!Array.isArray(week.learningOutcomes) || week.learningOutcomes.length === 0) fail(`week ${expected}: learningOutcomes are required`);
    if (!week.materialPackage?.root) fail(`week ${expected}: materialPackage.root is required`);
    else if (!(await exists(path.join(ROOT, week.materialPackage.root)))) fail(`week ${expected}: material root does not exist`);
    else await validateMaterialPackage(expected, week.materialPackage);
  }

  const lastWeek = ledger.weeks.at(-1)?.week;
  if (ledger.nextProduction?.week !== lastWeek + 1) fail('nextProduction.week must immediately follow the last recorded week');
  if (!ledger.nextProduction?.requiredStart) fail('nextProduction.requiredStart is required');
  if (!ledger.nextProduction?.existingArtifactsDisposition) fail('nextProduction.existingArtifactsDisposition is required');
  if (!ledger.nextProduction?.entryEvidence || !(await exists(path.join(ROOT, ledger.nextProduction.entryEvidence)))) {
    fail('nextProduction.entryEvidence must point to an existing file');
  }
  validateQuarantine(ledger);

  const forbidden = ledger.authority?.forbiddenAsNewContentSource || [];
  if (!forbidden.includes('keskinlab-5-sinif-hafta-plani-2026-2027.json')) {
    fail('legacy weekly plan must be explicitly forbidden as a new-content source');
  }
}

async function validateAgentsInstructions() {
  const text = await fs.readFile(AGENTS, 'utf8');
  const hierarchy = [
    'TYMM Bilişim Teknolojileri ve Yazılım Öğretim Programı',
    'İlgili sınıfın Öğretmen Kılavuz Kitabı',
    'Yıllık/haftalık plan, yalnız zamanlama için',
    'KeskinLab pedagojik yorumu'
  ];
  const hierarchyPositions = hierarchy.map((phrase) => text.indexOf(phrase));
  if (hierarchyPositions.some((position) => position === -1) || hierarchyPositions.some((position, index) => index > 0 && position <= hierarchyPositions[index - 1])) {
    fail('AGENTS.md source hierarchy is missing or out of order');
  }
  const required = [
    '`data/5-sinif.json` bağımsız bir pedagojik veya resmî kaynak değildir.',
    '`data/5-sinif-content-state.json`',
    'Haftanın numarası tek başına içerik başlangıcını belirlemez.',
    'Eski haftalık JSON, eski slayt sayısı veya legacy materyal yeni üretime kaynak olamaz.',
    'Süreklilik kaydında tamamlanmış hafta olarak yer almayan mevcut bir materyal klasörü, slayt paketi veya günlük plan kendiliğinden güncel ya da onaylı kabul edilemez;',
    'Resmî kaynaklar yukarıdaki sırayla sentezlenmeden ve önceki haftanın bitiş noktası süreklilik kaydından belirlenmeden yeni hafta üretilemez.'
  ];
  for (const phrase of required) if (!text.includes(phrase)) fail(`AGENTS.md continuity rule missing: ${phrase}`);
}

async function validateApplicationScope() {
  const canonical = JSON.parse(await fs.readFile(path.join(ROOT, 'data', '5-sinif.json'), 'utf8'));
  const week03 = canonical.weeks.find((week) => week.hafta_no === 3);
  const week04 = canonical.weeks.find((week) => week.hafta_no === 4);
  const week03Expected = [
    'a) Farklı bilişim teknolojilerinin olumlu ve olumsuz yönleri ile ilgili çözümleme yapar.',
    'b) Farklı bilişim teknolojilerinin kullanımına göre fiziksel güvenlik önlemleri ile ilgili sınıflandırma yapar.',
    'c) Bilişim teknolojilerini kullanmanın beden ve ruh sağlığı üzerindeki etkilerini kendi cümleleriyle ifade eder.',
    'a) Dijital kimlik kavramını belirler.'
  ];
  const week04Expected = [
    'b) Dijital ayak izinin etkilerini bilişim teknolojilerinin kullanım alanları ile ilişkilendirir.',
    'c) Dijital vatandaşlık uygulamalarını kullanım alanlarına göre gruplandırır.'
  ];
  if (JSON.stringify(week03?.surec_bilesenleri) !== JSON.stringify(week03Expected)) {
    fail('data/5-sinif.json week 03 must contain BTY.5.1.2 closure plus only BTY.5.1.3.a');
  }
  if (JSON.stringify(week04?.surec_bilesenleri) !== JSON.stringify(week04Expected)) {
    fail('data/5-sinif.json week 04 must start with BTY.5.1.3.b and continue with c');
  }

  let derived;
  try {
    const text = await fs.readFile(path.join(ROOT, 'course-data-5-sinif.js'), 'utf8');
    derived = JSON.parse(text.replace(/^window\.KL5_DATA\s*=\s*/, '').replace(/;\s*$/, ''));
  } catch (error) {
    fail(`course-data-5-sinif.js cannot be read: ${error.message}`);
    return;
  }
  const derived03 = derived.weeks?.find((week) => week.n === 3);
  const derived04 = derived.weeks?.find((week) => week.n === 4);
  if (JSON.stringify(derived03?.surec) !== JSON.stringify(week03Expected)) fail('course-data-5-sinif.js week 03 is stale');
  if (JSON.stringify(derived04?.surec) !== JSON.stringify(week04Expected)) fail('course-data-5-sinif.js week 04 is stale');
}

function validateQuarantine(ledger) {
  const required = [
    'materyaller/5-sinif/hafta04',
    'gunluk-planlar-5sinif/hafta04-5sinif-bty.docx'
  ];
  const quarantined = ledger.nextProduction?.quarantinedArtifacts || [];
  for (const target of required) {
    const entry = quarantined.find((item) => item.path === target);
    if (!entry || entry.status !== 'not-approved-for-reuse' || entry.allowedAsSource !== false) {
      fail(`nextProduction must quarantine ${target}`);
    }
  }
}

async function findLegacyWeeklyPlan(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await findLegacyWeeklyPlan(full);
      if (found) return found;
    } else if (entry.name === LEGACY_WEEKLY_PLAN_NAME) {
      return full;
    }
  }
  return null;
}

async function validateLegacyPlanIsNotCanonical() {
  const legacyPlan = await findLegacyWeeklyPlan(ROOT);
  if (legacyPlan) fail(`legacy weekly plan file must not exist in the repository: ${path.relative(ROOT, legacyPlan)}`);

  const generationFiles = [
    'scripts/generate-site-data.mjs',
    'scripts/generate-legacy-course-data.mjs',
    'scripts/validate-course-data.mjs'
  ];
  for (const relative of generationFiles) {
    const text = await fs.readFile(path.join(ROOT, relative), 'utf8');
    if (text.includes('keskinlab-5-sinif-hafta-plani-2026-2027.json')) {
      fail(`${relative} must not reference the legacy weekly plan`);
    }
  }
}

await validateLedger();
await validateAgentsInstructions();
await validateApplicationScope();
await validateLegacyPlanIsNotCanonical();

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`5. sınıf continuity validation: ${errors.length} error(s)`);
if (errors.length) process.exit(1);
