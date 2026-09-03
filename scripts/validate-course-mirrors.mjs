import { promises as fs } from 'node:fs';

const pairs = [
  ['5-sinif-bty.html', 'classroom-5-sinif.html'],
  ['6-sinif-bty.html', 'classroom-6-sinif.html'],
  ['robotik-kodlama.html', 'classroom-robotik.html'],
  ['yapay-zeka.html', 'classroom-yapay-zeka.html']
];

const errors = [];
for (const [canonical, mirror] of pairs) {
  const [a, b] = await Promise.all([fs.readFile(canonical, 'utf8'), fs.readFile(mirror, 'utf8')]);
  if (a !== b) errors.push(`${mirror} kanonik ${canonical} ile aynı değil`);
}

for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Course mirror validation: ${pairs.length} pair(s), ${errors.length} error(s)`);
if (errors.length) process.exit(1);
