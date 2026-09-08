import { readFile, writeFile } from 'node:fs/promises';

const courses = [
  { key: '5-sinif', file: '5-sinif-bty.html', title: '5. Sınıf BTY', subject: 'Bilişim Teknolojileri ve Yazılım', folder: '5sinif', suffix: '5sinif-bty', annual: '/5-sinif-bty-cerceve-yillik-plan.xlsx', week1: '/5-sinif-hafta01.html' },
  { key: '6-sinif', file: '6-sinif-bty.html', title: '6. Sınıf BTY', subject: 'Bilişim Teknolojileri ve Yazılım', folder: '6sinif', suffix: '6sinif-bty', annual: '/6-sinif-bty-cerceve-yillik-plan.xlsx' },
  { key: 'robotik', file: 'robotik-kodlama.html', title: 'Robotik Kodlama-I', subject: 'Seçmeli Ders', folder: 'robotik', suffix: 'robotik-kodlama' },
  { key: 'yapay-zeka', file: 'yapay-zeka.html', title: 'Yapay Zekâ Uygulamaları-I', subject: 'Seçmeli Ders', folder: 'yapay-zeka', suffix: 'yapay-zeka-uygulamalari' }
];

function shellHeader(current) {
  const links = [['/5-sinif-bty','5. Sınıf'],['/6-sinif-bty','6. Sınıf'],['/#dersler','Seçmeli Dersler'],['/evrak-cantasi','İçerikler ve Evraklar'],['/takvim','Takvim'],['/hakkinda','Hakkında']]
    .map(([href,label]) => `<a href="${href}"${href===current?' aria-current="page"':''}>${label}</a>`).join('');
  return `<header class="site-shell-header"><div class="site-shell-inner"><a class="site-shell-logo" href="/"><strong>KeskinLab</strong><span>ÖĞRENMEYİ TASARLAR</span></a><nav class="site-shell-nav" aria-label="Ana navigasyon">${links}</nav><div class="site-shell-actions"><button class="site-shell-icon" id="siteShellSearchButton" type="button" aria-label="Ara">⌕</button><button class="site-shell-icon site-shell-menu-button" id="siteShellMenuButton" type="button" aria-label="Menüyü aç">☰</button></div></div></header>`;
}
const shellOverlays = `<nav class="site-shell-mobile" id="siteShellMobile" aria-label="Mobil navigasyon" hidden><button class="site-shell-close" data-shell-close type="button">Kapat</button><a href="/">Ana Sayfa</a><a href="/5-sinif-bty">5. Sınıf</a><a href="/6-sinif-bty">6. Sınıf</a><a href="/#dersler">Seçmeli Dersler</a><a href="/evrak-cantasi">İçerikler ve Evraklar</a><a href="/takvim">Takvim</a><a href="/hakkinda">Hakkında</a><button id="siteShellMobileSearch" type="button">Ara</button></nav><div class="site-shell-search" id="siteShellSearch" role="dialog" aria-modal="true" aria-label="KeskinLab'da ara" hidden><div class="site-shell-search-box"><button class="site-shell-close" data-shell-close type="button">Kapat</button><label for="siteShellSearchInput">KeskinLab'da ara</label><input id="siteShellSearchInput" type="search" placeholder="Ders, hafta, materyal veya evrak ara"><div class="site-shell-results" id="siteShellResults"></div></div></div>`;
const shellFooter = `<footer class="site-shell-footer"><div class="site-shell-footer-inner"><span>© 2026 KeskinLab. Tüm hakları saklıdır.</span><nav aria-label="Alt navigasyon"><a href="/hakkinda">Hakkında</a><a href="/iletisim">İletişim</a><a href="/dijital-araclar">Dijital Araçlar</a></nav></div></footer>`;

const homeHtml = (await readFile('preview/homepage-v2.html', 'utf8'))
  .replaceAll('homepage-v2.html', '/')
  .replaceAll('../', '/')
  .replaceAll('final-assets/', 'preview/final-assets/')
  .replaceAll('/5-sinif-bty.html', '/5-sinif-bty')
  .replaceAll('/6-sinif-bty.html', '/6-sinif-bty')
  .replaceAll('/robotik-kodlama.html', '/robotik-kodlama')
  .replaceAll('/yapay-zeka.html', '/yapay-zeka')
  .replaceAll('/evrak-cantasi.html', '/evrak-cantasi')
  .replaceAll('/takvim.html', '/takvim')
  .replaceAll('/hakkinda.html', '/hakkinda')
  .replaceAll('/iletisim.html', '/iletisim')
  .replaceAll('/dijital-araclar.html', '/dijital-araclar')
  .replace('href="homepage-v2.css"', 'href="/site-v2.css"')
  .replace('src="homepage-materials.js"', 'src="/site-materials.js"')
  .replace('src="homepage-v2.js"', 'src="/site-v2.js"');
await writeFile('index.html', homeHtml);
await writeFile('site-v2.css', (await readFile('preview/homepage-v2.css', 'utf8')).replaceAll('final-assets/', 'preview/final-assets/'));
await writeFile('site-materials.js', await readFile('preview/homepage-materials.js', 'utf8'));
await writeFile('site-v2.js', (await readFile('preview/homepage-v2.js', 'utf8')).replaceAll('../', '/'));
await writeFile('course-v3.css', await readFile('preview/5-sinif-v3.css', 'utf8'));

let courseJs = await readFile('preview/5-sinif-v3.js', 'utf8');
courseJs = courseJs
  .replaceAll('../', '/')
  .replace("{ key: '5-sinif', label: '5. Sınıf BTY', page: '5-sinif-v3.html'", "{ key: '5-sinif', label: '5. Sınıf BTY', page: '/5-sinif-bty.html'")
  .replace("if (n === 1) {\n      actions.push('<a href=\"' + D.links.week1Lesson", "if (n === 1 && D.links.week1Lesson) {\n      actions.push('<a href=\"' + D.links.week1Lesson")
  .replace("(week.n === 1 ? D.links.week1Lesson : mats['sunum'][0])", "(week.n === 1 && D.links.week1Lesson ? D.links.week1Lesson : mats['sunum'][0])");
courseJs = courseJs.replaceAll('/5-sinif-bty.html', '/5-sinif-bty').replaceAll('/6-sinif-bty.html', '/6-sinif-bty').replaceAll('/robotik-kodlama.html', '/robotik-kodlama').replaceAll('/yapay-zeka.html', '/yapay-zeka').replaceAll('/takvim.html', '/takvim');
courseJs = courseJs.replace(
  "var first = week.cikti.split(/BTY\\.5\\.\\d+\\.\\d+\\.?\\s*/).filter(Boolean)[0] || week.cikti;\n    first = first.trim().replace(/\\s*BTY\\.5.*$/, '');",
  "var first = week.cikti.replace(/^\\S*\\d(?:\\.\\d+)+\\.?\\s*/u, '').trim();\n    first = first.replace(/\\s+\\S*\\d(?:\\.\\d+)+.*$/u, '');"
);
await writeFile('course-v3.js', courseJs);

const calendarSource = await readFile('home-calendar.js', 'utf8');
const events = JSON.parse(calendarSource.match(/const EVENTS = (\[[\s\S]*?\]);/)[1]);
const materialSource = await readFile('preview/5-sinif-v3-data.js', 'utf8');
const context = { window: {} };
const { runInNewContext } = await import('node:vm');
runInNewContext(materialSource, context);
const curated = context.window.KL5_DATA;

function stripCodes(text = '') {
  return String(text).split('•').map(part => part.trim())
    .filter((part, index) => !(index === 0 && /^[A-ZÇĞİÖŞÜ]+\./u.test(part)))
    .map(part => part.replace(/^(?:[A-ZÇĞİÖŞÜ]+\.)?\d+(?:\.\d+)+\.?\s*/u, ''))
    .filter(Boolean).join(' · ');
}

const materialManifest = JSON.parse(await readFile('generated/materials.json', 'utf8'));
for (const config of courses) {
  const raw = JSON.parse(await readFile(`data/${config.key}.json`, 'utf8'));
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
      ozel: special,
      baslangic: week.baslangic,
      bitis: week.bitis
    };
  });
  const themes = Object.fromEntries(themeNames.map((name, index) => [String(index + 1), name]));
  const dailyPlans = Object.fromEntries(weeks.map(w => [w.n, `/gunluk-planlar-${config.folder}/hafta${String(w.n).padStart(2, '0')}-${config.suffix}.docx`]));
  const materials = {};
  const manifestCourse = materialManifest.courses?.[config.key];
  for (const week of Object.values(manifestCourse?.weeks || {})) {
    const entry = {};
    for (const material of week.materials || []) {
      const files = (material.downloads || []).map(item => '/' + item.href.replace(/^\//, ''));
      if (material.preview && !files.includes('/' + material.preview.replace(/^\//, ''))) files.push('/' + material.preview.replace(/^\//, ''));
      const parts = material.type.split('/');
      if (parts.length === 1) entry[parts[0]] = files;
      else (entry[parts[0]] ||= {})[parts[1]] = files;
    }
    materials[String(week.week)] = entry;
  }
  const data = {
    course: { title: config.title, term: '2026–2027', subject: config.subject, totalWeeks: weeks.length, totalThemes: themeNames.length, weeklyHours: 2, codePrefix: config.key },
    themes, weeks, materials, dailyPlans, events,
    links: { yearlyPlan: config.annual || null, calendar: '/takvim.html', teacherDocs: '/evrak-cantasi.html', week1Lesson: config.week1 || null, homepage: '/' },
    week1Flow: config.key === '5-sinif' ? curated.week1Flow : [],
    studentCopy: config.key === '5-sinif' ? curated.studentCopy : {}
  };
  await writeFile(`course-data-${config.key}.js`, `window.KL5_DATA = ${JSON.stringify(data)};\n`);

  let html = await readFile('preview/5-sinif-v3.html', 'utf8');
  html = html.replaceAll('../', '/').replaceAll('homepage-v2.html', '/')
    .replaceAll('5-sinif-v3.html', '/5-sinif-bty.html')
    .replaceAll('5-sinif-v3.css', '/course-v3.css')
    .replaceAll('homepage-materials.js', '/site-materials.js')
    .replaceAll('5-sinif-v3-data.js', `/course-data-${config.key}.js`)
    .replaceAll('5-sinif-v3.js', '/course-v3.js')
    .replaceAll('5. Sınıf BTY', config.title)
    .replaceAll('Bilişim Teknolojileri ve Yazılım', config.subject)
    .replaceAll('/5-sinif-bty.html', '/5-sinif-bty')
    .replaceAll('/6-sinif-bty.html', '/6-sinif-bty')
    .replaceAll('/robotik-kodlama.html', '/robotik-kodlama')
    .replaceAll('/yapay-zeka.html', '/yapay-zeka')
    .replaceAll('/evrak-cantasi.html', '/evrak-cantasi')
    .replaceAll('/takvim.html', '/takvim')
    .replaceAll('/hakkinda.html', '/hakkinda')
    .replaceAll('/iletisim.html', '/iletisim')
    .replaceAll('/dijital-araclar.html', '/dijital-araclar')
    .replace('href="/5-sinif-bty" class="nav-link is-active"', 'href="/5-sinif-bty" class="nav-link"');
  const activeHref = '/' + config.file.replace(/\.html$/, '');
  html = html.replace(`href="${activeHref}" class="nav-link"`, `href="${activeHref}" class="nav-link is-active" aria-current="page"`);
  if (!config.annual) html = html.replace(/<a href="\/5-sinif-bty-cerceve-yillik-plan\.xlsx" class="teacher-link">Yıllık Plan<\/a>\s*/, '');
  else html = html.replace('/5-sinif-bty-cerceve-yillik-plan.xlsx', config.annual);
  html = html.replace('<title>5. Sınıf BTY — KeskinLab</title>', `<title>${config.title} — KeskinLab</title>`);
  html = html.replace('<a href="/hakkinda">Gizlilik</a>', '<a href="/dijital-araclar">Dijital Araçlar</a>');
  const legacyConfig = JSON.stringify({ source: config.key, plan: `gunluk-planlar-${config.folder}/hafta{n}-${config.suffix}.docx` });
  html = html.replace(`<script src="/course-data-${config.key}.js"></script>`, `<script>window.KESKINLAB_COURSE=${legacyConfig};</script>\n<script src="/course-data-${config.key}.js"></script>`);
  await writeFile(config.file, html);
  const mirror = { '5-sinif': 'classroom-5-sinif.html', '6-sinif': 'classroom-6-sinif.html', robotik: 'classroom-robotik.html', 'yapay-zeka': 'classroom-yapay-zeka.html' }[config.key];
  await writeFile(mirror, html);
}

const editorialFiles = ['hakkinda.html', 'iletisim.html', 'evrak-cantasi.html', 'takvim.html', 'dijital-araclar.html'];
for (const file of editorialFiles) {
  let html = await readFile(file, 'utf8');
  const current = '/' + file.replace(/\.html$/, '');
  const links = [
    ['/5-sinif-bty', '5. Sınıf'], ['/6-sinif-bty', '6. Sınıf'], ['/#dersler', 'Seçmeli Dersler'],
    ['/evrak-cantasi', 'İçerikler ve Evraklar'], ['/takvim', 'Takvim'], ['/hakkinda', 'Hakkında']
  ].map(([href, label]) => `<a${href === current ? ' class="active" aria-current="page"' : ''} href="${href}">${label}</a>`).join('');
  html = html.replace(/<header(?:\s[^>]*)?>[\s\S]*?<\/header>/, shellHeader(current))
    .replace(/<input[^>]+id="mobileNavToggle"[\s\S]*?<\/aside>/, '')
    .replace(/<\/main>[\s\S]*?(?=<footer)/, '</main>')
    .replace(/<footer(?:\s[^>]*)?>[\s\S]*?<\/footer>/, shellFooter)
    .replace('</main>', `</main>${shellOverlays}`)
    .replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=[^"']+/, 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap')
    .replaceAll('href="/evrak-cantasi.html"', 'href="/evrak-cantasi"')
    .replaceAll('href="/takvim.html"', 'href="/takvim"');
  if (!html.includes('href="/site-shell.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/site-shell.css"></head>');
  if (!html.includes('keskinlab-typography.css')) html = html.replace('<link rel="stylesheet" href="/site-shell.css">', '<link rel="stylesheet" href="/keskinlab-typography.css"><link rel="stylesheet" href="/site-shell.css">');
  if (!html.includes('class="site-shell-header"')) html = html.replace('<body>', `<body>${shellHeader(current)}`);
  if (!html.includes('src="/site-shell.js"')) html = html.replace('</body>', '<script src="/site-materials.js"></script><script src="/site-shell.js"></script></body>');
  await writeFile(file, html);
}

let editorialCss = await readFile('keskinlab-editorial.css', 'utf8');
editorialCss = editorialCss
  .replaceAll('#F4F6F3', '#FCFBFA').replaceAll('#12182B', '#181A1F')
  .replaceAll('#565F70', '#5F646D').replaceAll('#8890A0', '#858A92')
  .replaceAll('#1E8A80', '#8B1E24').replaceAll('#146059', '#74181D')
  .replaceAll('#E2A63B', '#8B1E24').replaceAll('#DCE1DE', '#DEDCD8')
  .replaceAll('#BEC6C2', '#B9B8B5').replaceAll('rgba(244,246,243,.92)', 'rgba(252,251,250,.94)')
  .replaceAll('rgba(18,24,43', 'rgba(24,26,31');
await writeFile('keskinlab-editorial.css', editorialCss);

let typographyCss = await readFile('keskinlab-typography.css', 'utf8');
typographyCss = typographyCss
  .replace('Space Grotesk = display, Inter = reading', 'IBM Plex Sans = display and reading')
  .replace('"Space Grotesk",system-ui,sans-serif', '"IBM Plex Sans",system-ui,sans-serif')
  .replace('Inter,system-ui,-apple-system', '"IBM Plex Sans",system-ui,-apple-system');
await writeFile('keskinlab-typography.css', typographyCss);
