import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATERIAL_ROOT = path.join(ROOT, 'materyaller');
const OUT_DIR = path.join(ROOT, 'generated');
const MATERIAL_OUT = path.join(OUT_DIR, 'materials.json');
const COURSE_OUT = path.join(OUT_DIR, 'courses.json');

const COURSES = [
  ['5-sinif', '5. Sınıf'],
  ['6-sinif', '6. Sınıf'],
  ['robotik', 'Robotik Kodlama-I'],
  ['yapay-zeka', 'Yapay Zekâ Uygulamaları-I']
];

const COURSE_SOURCES = {
  '5-sinif': {
    title: '5. Sınıf BTY',
    kind: 'bty',
    files: ['5-sinif-bty.html'],
    expectedWeeks: 37
  },
  '6-sinif': {
    title: '6. Sınıf BTY',
    kind: 'bty',
    files: ['6-sinif-bty.html'],
    expectedWeeks: 37
  },
  robotik: {
    title: 'Robotik Kodlama-I',
    kind: 'elective',
    files: ['robotik-data-1.js', 'robotik-data-2.js'],
    expectedWeeks: 36
  },
  'yapay-zeka': {
    title: 'Yapay Zekâ Uygulamaları-I',
    kind: 'elective',
    files: ['yapay-zeka-data-1.js', 'yapay-zeka-data-2.js'],
    expectedWeeks: 36
  }
};

const LEAVES = [
  ['sunum', 'Sunum'],
  ['ders-notu', 'Ders Notu'],
  ['ogrenci-etkinligi', 'Öğrenci Etkinliği'],
  ['infografik', 'İnfografik'],
  ['hafta-ozeti', 'Hafta Özeti'],
  ['olcme-degerlendirme/kisa-cevap', 'Kısa Cevaplı Kontrol'],
  ['olcme-degerlendirme/rubrik', 'Dereceli Puanlama'],
  ['olcme-degerlendirme/kontrol-listesi', 'Kontrol Listesi'],
  ['ogretmen/gozlem-formu', 'Öğretmen Gözlem Formu']
];

const DISPLAYABLE = new Set(['.pdf', '.png', '.jpg', '.jpeg']);
const EDITABLE = new Set(['.docx']);
const IMAGE_TYPES = new Set(['sunum', 'infografik', 'hafta-ozeti']);

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function filesIn(dir) {
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter(e => e.isFile()).map(e => e.name).sort((a,b)=>a.localeCompare(b,'tr',{numeric:true}));
}

function publicPath(...parts) {
  return parts.join('/').replaceAll(path.sep, '/');
}

function asciiSlug(value) {
  return value
    .replaceAll('ı','i').replaceAll('İ','I')
    .replaceAll('ş','s').replaceAll('Ş','S')
    .replaceAll('ğ','g').replaceAll('Ğ','G')
    .replaceAll('ç','c').replaceAll('Ç','C')
    .replaceAll('ö','o').replaceAll('Ö','O')
    .replaceAll('ü','u').replaceAll('Ü','U')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function downloadName(course, week, label, ext, index) {
  const courseLabel = course
    .replace('5-sinif','5-Sinif')
    .replace('6-sinif','6-Sinif')
    .replace('robotik','Robotik')
    .replace('yapay-zeka','Yapay-Zeka');
  const safeLabel = asciiSlug(label);
  const suffix = index === '01' ? '' : `-${index}`;
  return `KeskinLab-${courseLabel}-Hafta-${week}-${safeLabel}${suffix}${ext}`;
}

function groupFormats(names) {
  const map = new Map();
  for (const name of names) {
    const ext = path.extname(name).toLowerCase();
    const stem = path.basename(name, ext);
    if (!map.has(stem)) map.set(stem, {});
    map.get(stem)[ext.slice(1)] = name;
  }
  return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr',{numeric:true}));
}

async function collectLeaf(course, week, rel, label) {
  const dir = path.join(MATERIAL_ROOT, course, `hafta${week}`, ...rel.split('/'));
  const names = await filesIn(dir);
  if (!names.length) return [];

  if (IMAGE_TYPES.has(rel)) {
    return names.map(name => {
      const ext = path.extname(name).toLowerCase();
      const index = path.basename(name, ext);
      return {
        type: rel,
        label,
        index,
        preview: DISPLAYABLE.has(ext) ? publicPath('materyaller', course, `hafta${week}`, rel, name) : null,
        editable: EDITABLE.has(ext) ? publicPath('materyaller', course, `hafta${week}`, rel, name) : null,
        downloads: [{
          href: publicPath('materyaller', course, `hafta${week}`, rel, name),
          format: ext.slice(1),
          filename: downloadName(course, week, label, ext, index)
        }]
      };
    });
  }

  return groupFormats(names).map(([index, formats]) => {
    const pdf = formats.pdf ? publicPath('materyaller', course, `hafta${week}`, rel, formats.pdf) : null;
    const docx = formats.docx ? publicPath('materyaller', course, `hafta${week}`, rel, formats.docx) : null;
    const downloads = [];
    if (formats.pdf) downloads.push({href:pdf,format:'pdf',filename:downloadName(course,week,label,'.pdf',index)});
    if (formats.docx) downloads.push({href:docx,format:'docx',filename:downloadName(course,week,`${label} Düzenlenebilir`,'.docx',index)});
    return { type: rel, label, index, preview: pdf, editable: docx, downloads };
  }).filter(x => x.preview || x.editable || x.downloads.length);
}

function parseBtyWeeks(text, file) {
  const p = text.indexOf('const WEEKS');
  const a = text.indexOf('[', p);
  const z = text.indexOf('];', a);
  if (p < 0 || a < 0 || z < a) throw new Error(`${file}: const WEEKS block not found`);
  return JSON.parse(text.slice(a, z + 1));
}

function parseElectiveWeeks(text, file) {
  const p = text.indexOf('COURSE_WEEKS.push(...');
  const a = text.indexOf('[', p);
  const z = text.lastIndexOf(']);');
  if (p < 0 || a < 0 || z < a) throw new Error(`${file}: COURSE_WEEKS.push block not found`);
  return JSON.parse(text.slice(a, z + 1));
}

async function readSourceWeeks(config) {
  const chunks = [];
  for (const file of config.files) {
    const text = await fs.readFile(path.join(ROOT, file), 'utf8');
    chunks.push(config.kind === 'bty' ? parseBtyWeeks(text, file) : parseElectiveWeeks(text, file));
  }
  const weeks = chunks.flat().sort((a,b)=>Number(a.hafta_no)-Number(b.hafta_no));
  if (weeks.length !== config.expectedWeeks) {
    throw new Error(`${config.title}: expected ${config.expectedWeeks} source weeks, got ${weeks.length}`);
  }
  return weeks;
}

function normalizeWeek(source, sourceKind) {
  const kazanimlar = Array.isArray(source.kazanimlar) ? [...source.kazanimlar] : [];
  const surec = Array.isArray(source.surec_bilesenleri) ? [...source.surec_bilesenleri] : [];
  return {
    hafta_no: Number(source.hafta_no),
    baslangic: source.baslangic ?? '',
    bitis: source.bitis ?? '',
    tarih_araligi: source.tarih_araligi ?? source.tarih ?? '',
    ders_saati: source.ders_saati ?? null,
    tema: source.tema ?? source.unite ?? '',
    unite: source.unite ?? '',
    konu: source.konu ?? '',
    ogrenme_ciktisi: source.ogrenme_ciktisi ?? kazanimlar.join(' • '),
    kazanimlar,
    surec_bilesenleri: surec.length ? surec : kazanimlar,
    etkinlik: source.etkinlik ?? '',
    ozel_hafta: Boolean(source.ozel_hafta),
    kurban_bayrami_cakisiyor: Boolean(source.kurban_bayrami_cakisiyor),
    belirli_gun: source.belirli_gun ?? '',
    sourceKind,
    source
  };
}

async function generateMaterials() {
  const result = { schemaVersion: 1, generatedAt: new Date().toISOString(), courses: {} };
  for (const [course, title] of COURSES) {
    const courseDir = path.join(MATERIAL_ROOT, course);
    const weeks = {};
    if (await exists(courseDir)) {
      const entries = await fs.readdir(courseDir, { withFileTypes: true });
      const weekDirs = entries.filter(e=>e.isDirectory() && /^hafta\d{2}$/.test(e.name)).sort((a,b)=>a.name.localeCompare(b.name));
      for (const w of weekDirs) {
        const week = w.name.slice(5);
        const materials = [];
        for (const [rel,label] of LEAVES) materials.push(...await collectLeaf(course, week, rel, label));
        weeks[week] = { week: Number(week), materials };
      }
    }
    result.courses[course] = { title, weeks };
  }
  await fs.writeFile(MATERIAL_OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(ROOT, MATERIAL_OUT)}`);
}

async function generateCourses() {
  const result = { schemaVersion: 1, generatedAt: new Date().toISOString(), courses: {} };
  for (const [course, config] of Object.entries(COURSE_SOURCES)) {
    const sourceWeeks = await readSourceWeeks(config);
    result.courses[course] = {
      title: config.title,
      sourceKind: config.kind,
      sourceFiles: config.files,
      weekCount: config.expectedWeeks,
      weeks: sourceWeeks.map(w => normalizeWeek(w, config.kind))
    };
  }
  await fs.writeFile(COURSE_OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(ROOT, COURSE_OUT)}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await generateMaterials();
  await generateCourses();
}

main().catch(err => { console.error(err); process.exit(1); });
