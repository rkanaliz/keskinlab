import { promises as fs } from 'node:fs';

const checks = {
  'index.html': ['/dijital-araclar', '/hakkinda', '/iletisim'],
  'hakkinda.html': ['/dijital-araclar', '/hakkinda', '/iletisim'],
  'iletisim.html': ['/dijital-araclar', '/hakkinda', '/iletisim'],
  'dijital-araclar.html': ['/dijital-araclar', '/hakkinda', '/iletisim'],
  'classroom-5-sinif.html': ['href="/"', '/dijital-araclar', '/hakkinda'],
  'classroom-6-sinif.html': ['href="/"', '/dijital-araclar', '/hakkinda'],
  'classroom-robotik.html': ['href="/"', '/dijital-araclar', '/hakkinda'],
  'classroom-yapay-zeka.html': ['href="/"', '/dijital-araclar', '/hakkinda']
};

const errors = [];
for (const [file, needles] of Object.entries(checks)) {
  const html = await fs.readFile(file, 'utf8');
  for (const needle of needles) {
    if (!html.includes(needle)) errors.push(`${file}: eksik global navigasyon hedefi ${needle}`);
  }
}

// Ana navigasyon sırasını, site-wide bilgi mimarisinin referansı olarak anasayfada kilitle.
const home = await fs.readFile('index.html', 'utf8');
const order = ['#bugun', '#zaman', '#dersler', '/dijital-araclar', '/hakkinda', '/iletisim'];
let cursor = -1;
for (const href of order) {
  const next = home.indexOf(`href="${href}"`, cursor + 1);
  if (next < 0) errors.push(`index.html: ana menü öğesi bulunamadı ${href}`);
  else if (next < cursor) errors.push(`index.html: ana menü sırası bozulmuş ${href}`);
  else cursor = next;
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Navigation validation: ${Object.keys(checks).length} public surface(s), ${errors.length} error(s)`);
if (errors.length) process.exit(1);
