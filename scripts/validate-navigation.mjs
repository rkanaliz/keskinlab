import { promises as fs } from 'node:fs';

const publicSurfaces = [
  'index.html', 'hakkinda.html', 'iletisim.html', 'dijital-araclar.html',
  'evrak-cantasi.html', 'takvim.html', '5-sinif-bty.html', '6-sinif-bty.html',
  'robotik-kodlama.html', 'yapay-zeka.html'
];
const essentialTargets = ['href="/"', '/5-sinif-bty', '/6-sinif-bty', '/takvim', '/hakkinda'];
const errors = [];
let canonicalHeader = null;
let canonicalFooter = null;

function shellSignature(fragment) {
  return fragment
    .replace(/\s(?:class="nav-link )?is-active"/g, (value) => value.startsWith(' class') ? ' class="nav-link"' : '"')
    .replace(/\saria-current="page"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const file of publicSurfaces) {
  const html = await fs.readFile(file, 'utf8');
  for (const target of essentialTargets) {
    if (!html.includes(target)) errors.push(`${file}: eksik global navigasyon hedefi ${target}`);
  }
  if (/Gizlilik[\s\S]{0,100}href=["']\/hakkinda|href=["']\/hakkinda["'][^>]*>Gizlilik/.test(html)) errors.push(`${file}: Gizlilik etiketi Hakkında hedefine bağlanmış`);
  for (const token of ['data-shared-shell="v2"','searchTrigger','startLesson','mobileMenuTrigger','site-footer','/site-shell.css','/dijital-araclar']) {
    if (!html.includes(token)) errors.push(`${file}: ortak V2 shell öğesi eksik ${token}`);
  }
  const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
  const footer = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) continue;
  const headerSignature = shellSignature(header);
  const footerSignature = shellSignature(footer);
  canonicalHeader ||= headerSignature;
  canonicalFooter ||= footerSignature;
  if (headerSignature !== canonicalHeader) errors.push(`${file}: header kanonik V2 shell ile eşleşmiyor`);
  if (footerSignature !== canonicalFooter) errors.push(`${file}: footer kanonik V2 shell ile eşleşmiyor`);
}

const home = await fs.readFile('index.html', 'utf8');
const order = ['/5-sinif-bty', '/6-sinif-bty', '/#dersler', '/evrak-cantasi', '/takvim', '/hakkinda'];
let cursor = -1;
for (const href of order) {
  const next = home.indexOf(`href="${href}"`, cursor + 1);
  if (next < 0) errors.push(`index.html: onaylı ana menü öğesi bulunamadı ${href}`);
  else cursor = next;
}
if (!home.includes('id="searchTrigger"')) errors.push('index.html: arama kontrolü bulunamadı');
if (!home.includes('id="startLesson"')) errors.push('index.html: Derse Başla kontrolü bulunamadı');
const desktopNav = home.match(/<nav class="main-nav"[\s\S]*?<\/nav>/)?.[0] || '';
if (/>Ana Sayfa<\//.test(desktopNav)) errors.push('index.html: logo varken masaüstü menüsünde gereksiz Ana Sayfa bağlantısı var');
for (const bad of ['/dijital-araclar#ders-hazirla','/dijital-araclar#d3']) {
  if (home.includes(`data-material-filter`) && home.includes(`href="${bad}"`)) errors.push(`index.html: materyal filtresi gerçek materyal yerine rehbere gidiyor ${bad}`);
}
for (const filter of [...home.matchAll(/<a[^>]+data-material-filter="([^"]+)"[^>]*>/g)]) {
  const href = filter[0].match(/href="([^"]+)"/)?.[1] || '';
  if (!href.startsWith('/materyaller/')) errors.push(`index.html: ${filter[1]} filtresinin güvenli fallback hedefi materyal değil: ${href}`);
}

const mobileCss = await fs.readFile('course-v3.css','utf8');
for (const token of ['grid-template-columns:36px minmax(0,1fr) 36px','overflow-wrap:anywhere','min-width:0']) {
  if (!mobileCss.includes(token)) errors.push(`course-v3.css: 390 px yerleşim koruması eksik ${token}`);
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Navigation validation: ${publicSurfaces.length} public surface(s), ${errors.length} error(s)`);
if (errors.length) process.exit(1);
