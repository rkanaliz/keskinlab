import { promises as fs } from 'node:fs';

const publicSurfaces = [
  'index.html', 'hakkinda.html', 'iletisim.html', 'dijital-araclar.html',
  'evrak-cantasi.html', 'takvim.html', '5-sinif-bty.html', '6-sinif-bty.html',
  'robotik-kodlama.html', 'yapay-zeka.html'
];
const essentialTargets = ['href="/"', '/5-sinif-bty', '/6-sinif-bty', '/takvim', '/hakkinda'];
const errors = [];

for (const file of publicSurfaces) {
  const html = await fs.readFile(file, 'utf8');
  for (const target of essentialTargets) {
    if (!html.includes(target)) errors.push(`${file}: eksik global navigasyon hedefi ${target}`);
  }
}

const home = await fs.readFile('index.html', 'utf8');
const order = ['/5-sinif-bty', '/6-sinif-bty', '#dersler', '#dijital-icerikler', '/takvim', '/hakkinda'];
let cursor = -1;
for (const href of order) {
  const next = home.indexOf(`href="${href}"`, cursor + 1);
  if (next < 0) errors.push(`index.html: onaylı ana menü öğesi bulunamadı ${href}`);
  else cursor = next;
}
if (!home.includes('id="searchTrigger"')) errors.push('index.html: arama kontrolü bulunamadı');
if (!home.includes('id="startLesson"')) errors.push('index.html: Derse Başla kontrolü bulunamadı');

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Navigation validation: ${publicSurfaces.length} public surface(s), ${errors.length} error(s)`);
if (errors.length) process.exit(1);
