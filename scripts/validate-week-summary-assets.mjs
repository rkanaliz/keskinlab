import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'generated', 'materials.json'), 'utf8'));
const checks = [
  ['5-sinif', '01', 4],
  ['5-sinif', '02', 3],
  ['5-sinif', '03', 4],
  ['6-sinif', '01', 4],
];

for (const [course, week, expected] of checks) {
  const materials = manifest.courses[course].weeks[week].materials.filter((item) => item.type === 'hafta-ozeti');
  if (materials.length !== expected) throw new Error(`${course} week ${week}: expected ${expected}, got ${materials.length}`);

  for (let index = 1; index <= expected; index += 1) {
    const number = String(index).padStart(2, '0');
    const files = [
      `materyaller/${course}/hafta${week}/hafta-ozeti/${number}.png`,
      `generated/web/${course}/hafta${week}/hafta-ozeti/${number}.webp`,
      `generated/web/${course}/hafta${week}/hafta-ozeti/${number}-thumb.webp`,
    ];
    for (const relative of files) {
      if (!fs.existsSync(path.join(root, relative))) throw new Error(`Missing ${relative}`);
    }
    const metadata = await sharp(path.join(root, files[0])).metadata();
    if (metadata.width !== 1672 || metadata.height !== 941) {
      throw new Error(`${files[0]}: expected 1672x941, got ${metadata.width}x${metadata.height}`);
    }
  }
  console.log(`OK ${course} week ${week}: ${expected} PNG + WebP + thumbnails`);
}
