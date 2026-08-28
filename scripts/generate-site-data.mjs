import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATERIAL_ROOT = path.join(ROOT, 'materyaller');
const OUT_DIR = path.join(ROOT, 'generated');
const OUT_FILE = path.join(OUT_DIR, 'materials.json');

const COURSES = [
  ['5-sinif', '5. Sınıf'],
  ['6-sinif', '6. Sınıf'],
  ['robotik', 'Robotik Kodlama-I'],
  ['yapay-zeka', 'Yapay Zekâ Uygulamaları-I']
];

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

function downloadName(course, week, label, ext, index) {
  const courseLabel = course
    .replace('5-sinif','5-Sinif')
    .replace('6-sinif','6-Sinif')
    .replace('robotik','Robotik')
    .replace('yapay-zeka','Yapay-Zeka');
  const safeLabel = label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'');
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
    if (formats.docx) downloads.push({href:docx,format:'docx',filename:downloadName(course,week,`${label}-Duzenlenebilir`,'.docx',index)});
    return { type: rel, label, index, preview: pdf, editable: docx, downloads };
  }).filter(x => x.preview || x.editable || x.downloads.length);
}

async function main() {
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
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
