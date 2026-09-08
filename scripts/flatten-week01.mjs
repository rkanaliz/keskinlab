import { readFile, writeFile, unlink, access } from 'node:fs/promises';

const CANONICAL = '/5-sinif-bty?week=1#weekMaterials';
const LEGACY = /\/5-sinif-hafta01(?:\.html)?(?=["'?#\s<]|$)/g;
const changed = [];
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function edit(file, transform) {
  if (!(await exists(file))) throw new Error('Required file missing: ' + file);
  const before = await readFile(file, 'utf8');
  const after = transform(before);
  if (after !== before) { await writeFile(file, after); changed.push(file); }
}
function flattenCourseJS(text) {
  const start = text.indexOf('    // eylemler\n');
  const end = text.indexOf('    // görsel slot\n', start);
  if (start < 0 || end < 0) throw new Error('Course action renderer not found');
  const block = text.slice(start, end);
  const first = block.indexOf('    if (n === 1');
  const next = block.indexOf('    } else if (!week.ozel) {', first);
  if (first < 0 || next < 0) throw new Error('Week 01 action branch not found');
  const replacement = `    if (n === 1) {
      // The presentation already lives in the week materials below.
      var sunum = D.materials['1'] && D.materials['1']['sunum'];
      if (sunum) actions.push('<a href="#weekMaterials" class="btn btn-secondary">Materyalleri Gör</a>');
`;
  text = text.slice(0, start + first) + replacement + text.slice(start + next, end) + text.slice(end);
  text = text.replace(
    "if (mats['sunum'] && !(week.n === 1 && D.links.week1Lesson))",
    "if (mats['sunum'] && week.n !== 1)"
  );
  text = text.replace(
    "if (mats['sunum']) links.push('<a href=\"' + (week.n === 1 ? D.links.week1Lesson : mats['sunum'][0])",
    "if (mats['sunum'] && week.n !== 1) links.push('<a href=\"' + mats['sunum'][0]"
  );
  return text.replace(LEGACY, CANONICAL);
}

for (const file of ['preview/5-sinif-v3.js', 'course-v3.js']) {
  await edit(file, flattenCourseJS);
}
for (const file of ['preview/5-sinif-v3-data.js', 'course-data-5-sinif.js']) {
  await edit(file, text => text.replace(LEGACY, CANONICAL));
}
await edit('scripts/promote-v2-surfaces.mjs', text => {
  const start = text.indexOf("let weekWorkspace = await readFile('5-sinif-hafta01.html', 'utf8');");
  const endMarker = "await writeFile('5-sinif-hafta01.html', weekWorkspace);";
  if (start >= 0) {
    const end = text.indexOf(endMarker, start);
    if (end < 0) throw new Error('Week workspace generator end not found');
    text = text.slice(0, start) + text.slice(end + endMarker.length).replace(/^\s*\n/, '\n');
  }
  const legacyStart = text.indexOf('  .replace("if (n === 1)');
  if (legacyStart >= 0) {
    const legacyEnd = text.indexOf("courseJs = courseJs.replaceAll('/5-sinif-bty.html'", legacyStart);
    if (legacyEnd < 0) throw new Error('Legacy course generator transform end not found');
    text = text.slice(0, legacyStart) + ';\n' + text.slice(legacyEnd);
  }
  return text.replace(LEGACY, CANONICAL);
});

for (const file of [
  'preview/homepage-v2.html', 'preview/homepage-v2.js',
  'preview/homepage-materials.js', 'site-materials.js', 'site-v2.js',
  'index.html', '5-sinif-bty.html', 'classroom-5-sinif.html',
  'dijital-icerikler.html'
]) {
  if (await exists(file)) await edit(file, text => text.replace(LEGACY, CANONICAL));
}

if (await exists('5-sinif-hafta01.html')) {
  await unlink('5-sinif-hafta01.html');
  changed.push('5-sinif-hafta01.html (deleted)');
}
await edit('_redirects', text => {
  const rules = '/5-sinif-hafta01 /5-sinif-bty?week=1 301\n/5-sinif-hafta01.html /5-sinif-bty?week=1 301\n';
  return text.includes('/5-sinif-hafta01 /5-sinif-bty?week=1 301') ? text : rules + '\n' + text;
});

const sourceFiles = [
  'preview/5-sinif-v3.js', 'course-v3.js', 'preview/5-sinif-v3-data.js',
  'course-data-5-sinif.js', 'scripts/promote-v2-surfaces.mjs',
  'index.html', 'site-v2.js', 'site-materials.js', '5-sinif-bty.html',
  'classroom-5-sinif.html', 'dijital-icerikler.html'
];
for (const file of sourceFiles) {
  if (await exists(file) && LEGACY.test(await readFile(file, 'utf8'))) {
    throw new Error('Obsolete route remains in ' + file);
  }
  LEGACY.lastIndex = 0;
}
console.log('Week 01 route migration:', changed.length ? changed.join(', ') : 'already applied');
