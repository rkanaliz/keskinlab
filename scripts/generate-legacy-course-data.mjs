import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const ROOT = process.cwd();
const courses = [
  { key: '5-sinif', title: '5. Sınıf BTY', subject: 'Bilişim Teknolojileri ve Yazılım', folder: '5sinif', suffix: '5sinif-bty', annual: '/5-sinif-bty-cerceve-yillik-plan.xlsx', week1: '/5-sinif-bty?week=1#weekMaterials' },
  { key: '6-sinif', title: '6. Sınıf BTY', subject: 'Bilişim Teknolojileri ve Yazılım', folder: '6sinif', suffix: '6sinif-bty', annual: '/6-sinif-bty-cerceve-yillik-plan.xlsx' },
  { key: 'robotik', title: 'Robotik Kodlama-I', subject: 'Seçmeli Ders', folder: 'robotik', suffix: 'robotik-kodlama' },
  { key: 'yapay-zeka', title: 'Yapay Zekâ Uygulamaları-I', subject: 'Seçmeli Ders', folder: 'yapay-zeka', suffix: 'yapay-zeka-uygulamalari' }
];

function stripCodes(text = '') {
  return String(text).split('•').map(part => part.trim())
    .filter((part, index) => !(index === 0 && /^[A-ZÇĞİÖŞÜ]+\./u.test(part)))
    .map(part => part.replace(/^(?:[A-ZÇĞİÖŞÜ]+\.)?\d+(?:\.\d+)+\.?\s*/u, ''))
    .filter(Boolean).join(' · ');
}

function optionalWeekFields(week) {
  const result = {};
  for (const key of ['icerik_ders_saati', 'okul_temelli_planlama_saati', 'dersler', 'kilavuz', 'sinif_araclari', 'ogretmen_notu', 'ogrenci_aciklama', 'sinif_akisi', 'gunluk_plan_yok']) {
    if (Object.hasOwn(week, key)) result[key] = week[key];
  }
  return result;
}

const eventsSource = await readFile(`${ROOT}/home-calendar.js`, 'utf8');
const events = JSON.parse(eventsSource.match(/const EVENTS = (\[[\s\S]*?\]);/)[1]);
const context = { window: {} };
// week1Flow and studentCopy are presentation copy, not weekly plan data. Keep
// them while rebuilding the weekly payload solely from data/<course>.json.
runInNewContext(await readFile(`${ROOT}/course-data-5-sinif.js`, 'utf8'), context);
const curated = context.window.KL5_DATA;
const materialManifest = JSON.parse(await readFile(`${ROOT}/generated/materials.json`, 'utf8'));

for (const config of courses) {
  const raw = JSON.parse(await readFile(`${ROOT}/data/${config.key}.json`, 'utf8'));
  const themeNames = [];
  const weeks = raw.weeks.map((week) => {
    const theme = week.tema || week.unite || null;
    if (theme && !themeNames.includes(theme)) themeNames.push(theme);
    const special = Boolean(week.ozel_hafta) || (!week.konu && /SINAV|SOSYAL|OKUL TEMELLİ/i.test(week.ders_saati || ''));
    return {
      n: Number(week.hafta_no),
      tarih: week.tarih_araligi || week.tarih,
      saat: week.ders_saati || '2',
      tema: theme,
      temaNo: theme ? String(themeNames.indexOf(theme) + 1) : null,
      konu: ['robotik', 'yapay-zeka'].includes(config.key) ? stripCodes(week.konu) : week.konu,
      cikti: week.ogrenme_ciktisi || (week.kazanimlar || []).join(' '),
      surec: week.surec_bilesenleri || (week.etkinlik ? [week.etkinlik] : []),
      ...optionalWeekFields(week),
      ozel: special,
      baslangic: week.baslangic,
      bitis: week.bitis
    };
  });
  const themes = Object.fromEntries(themeNames.map((name, index) => [String(index + 1), name]));
  const dailyPlans = Object.fromEntries(weeks.filter(week => !week.gunluk_plan_yok).map(week => [week.n, `/gunluk-planlar-${config.folder}/hafta${String(week.n).padStart(2, '0')}-${config.suffix}.docx`]));
  const materials = {};
  const resourceBundles = {};
  for (const week of Object.values(materialManifest.courses?.[config.key]?.weeks || {})) {
    const entry = {};
    const resources = [];
    for (const material of week.materials || []) {
      const useWeek02WebPreview = config.key === '5-sinif' && week.week === 2 && Boolean(material.webPreview);
      const files = useWeek02WebPreview
        ? [`/${material.webPreview.replace(/^\//, '')}`]
        : (material.downloads || []).map(item => `/${item.href.replace(/^\//, '')}`);
      if (!useWeek02WebPreview && material.preview && !files.includes(`/${material.preview.replace(/^\//, '')}`)) files.push(`/${material.preview.replace(/^\//, '')}`);
      const parts = material.type.split('/');
      if (parts.length === 1) (entry[parts[0]] ||= []).push(...files);
      else ((entry[parts[0]] ||= {})[parts[1]] ||= []).push(...files);
      if (material.type === 'evraklar') {
        resources.push({
          id: material.index,
          label: material.label,
          group: material.group || 'student',
          pdf: material.downloads?.find(item => item.format === 'pdf')?.href ? `/${material.downloads.find(item => item.format === 'pdf').href.replace(/^\//, '')}` : null,
          docx: material.downloads?.find(item => item.format === 'docx')?.href ? `/${material.downloads.find(item => item.format === 'docx').href.replace(/^\//, '')}` : null
        });
      }
    }
    materials[String(week.week)] = entry;
    if (resources.length) resourceBundles[String(week.week)] = resources;
  }
  const data = {
    course: { title: config.title, term: '2026–2027', subject: config.subject, totalWeeks: weeks.length, totalThemes: themeNames.length, weeklyHours: 2, codePrefix: config.key },
    themes, weeks, materials, ...(Object.keys(resourceBundles).length ? { resourceBundles } : {}), dailyPlans, events,
    links: { yearlyPlan: config.annual || null, calendar: '/takvim.html', teacherDocs: '/evrak-cantasi.html', week1Lesson: config.week1 || null, homepage: '/' },
    week1Flow: config.key === '5-sinif' ? curated.week1Flow : [],
    studentCopy: config.key === '5-sinif' ? curated.studentCopy : {}
  };
  await writeFile(`${ROOT}/course-data-${config.key}.js`, `window.KL5_DATA = ${JSON.stringify(data)};\n`);
}
