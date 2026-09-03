import { promises as fs } from 'node:fs';

const files = [
  'index.html','hakkinda.html','iletisim.html','dijital-araclar.html',
  'evrak-cantasi.html','takvim.html',
  'classroom-5-sinif.html','classroom-6-sinif.html','classroom-robotik.html','classroom-yapay-zeka.html'
];
const errors = [];

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  if (!/<html\b[^>]*\blang=["']tr["']/i.test(html)) errors.push(`${file}: html lang="tr" eksik`);

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${file}: tam 1 adet h1 bekleniyor, bulunan ${h1Count}`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(match[0])) errors.push(`${file}: alt niteliği olmayan img -> ${match[0].slice(0,100)}`);
  }

  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${file}: yinelenen id="${id}"`);
    seen.add(id);
  }
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Accessibility guard: ${files.length} public surface(s), ${errors.length} error(s)`);
if (errors.length) process.exit(1);
