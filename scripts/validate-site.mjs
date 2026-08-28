import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const strictAssets = process.argv.includes('--strict-assets');
const errors = [];
const warnings = [];

const MATERIAL_ROOT = path.join(ROOT, 'materyaller');
const COURSE_DIRS = new Set(['5-sinif','6-sinif','robotik','yapay-zeka']);
const TOP_LEVEL = new Set(['sunum','ders-notu','ogrenci-etkinligi','infografik','hafta-ozeti','olcme-degerlendirme','ogretmen']);
const ASSESSMENT = new Set(['kisa-cevap','rubrik','kontrol-listesi']);
const TEACHER = new Set(['gozlem-formu']);
const SOURCE_EXT = new Set(['.png','.jpg','.jpeg','.pdf','.docx']);
const RASTER_EXT = new Set(['.png','.jpg','.jpeg']);
const WARN_RASTER_BYTES = Math.round(1.2 * 1024 * 1024);

// These pages are retired presentation surfaces. During A2.0 their local links are
// intentionally ignored, but the BTY WEEKS payloads are guarded separately because
// classroom-v2.js still parses those two files until A2.1 removes the RAW dependency.
const LEGACY_HTML_LINK_EXCLUDES = new Set([
  '5-sinif-bty.html',
  '6-sinif-bty.html',
  'robotik-kodlama.html',
  'yapay-zeka.html'
]);
const LEGACY_BTY_DATA_GUARDS = [
  ['5-sinif-bty.html', 37],
  ['6-sinif-bty.html', 37]
];
const CLASSROOM_PLAN_RULES = [
  ['classroom-5-sinif.html', 37],
  ['classroom-6-sinif.html', 37],
  ['classroom-robotik.html', 36],
  ['classroom-yapay-zeka.html', 36]
];

function rel(p){ return path.relative(ROOT,p).replaceAll(path.sep,'/'); }
async function exists(p){ try{ await fs.access(p); return true; }catch{return false;} }
async function dirs(p){ if(!(await exists(p)))return[]; return (await fs.readdir(p,{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name); }
async function files(p){ if(!(await exists(p)))return[]; return (await fs.readdir(p,{withFileTypes:true})).filter(e=>e.isFile()).map(e=>e.name); }
function err(msg){ errors.push(msg); }
function warn(msg){ warnings.push(msg); }

async function validateFiles(dir){
  for(const name of await files(dir)){
    const full=path.join(dir,name), ext=path.extname(name).toLowerCase(), stem=path.basename(name,ext);
    if(!SOURCE_EXT.has(ext)) err(`Unsupported source format: ${rel(full)}`);
    if(!/^\d{2}$/.test(stem)) err(`Source filename must be two-digit positional name: ${rel(full)}`);
    if(RASTER_EXT.has(ext)){
      const stat=await fs.stat(full);
      if(stat.size>WARN_RASTER_BYTES){
        const msg=`Oversized raster (${(stat.size/1024/1024).toFixed(2)} MiB): ${rel(full)}`;
        strictAssets?err(msg):warn(msg);
      }
    }
  }
}

async function validateMaterialTree(){
  if(!(await exists(MATERIAL_ROOT))){ err('materyaller/ is missing'); return; }
  for(const course of await dirs(MATERIAL_ROOT)){
    if(!COURSE_DIRS.has(course)){ err(`Unknown course material root: materyaller/${course}`); continue; }
    const cdir=path.join(MATERIAL_ROOT,course);
    for(const week of await dirs(cdir)){
      if(!/^hafta\d{2}$/.test(week)){ err(`Week directory must be haftaNN: ${rel(path.join(cdir,week))}`); continue; }
      const wdir=path.join(cdir,week);
      for(const top of await dirs(wdir)){
        if(top==='thumbs'){ err(`Source thumbs/ is forbidden: ${rel(path.join(wdir,top))}`); continue; }
        if(!TOP_LEVEL.has(top)){ err(`Unknown material type: ${rel(path.join(wdir,top))}`); continue; }
        const tdir=path.join(wdir,top);
        if(top==='olcme-degerlendirme'){
          for(const child of await dirs(tdir)){
            if(!ASSESSMENT.has(child))err(`Unknown assessment type: ${rel(path.join(tdir,child))}`);
            else await validateFiles(path.join(tdir,child));
          }
          if((await files(tdir)).length)err(`Files must be inside an assessment subtype: ${rel(tdir)}`);
        }else if(top==='ogretmen'){
          for(const child of await dirs(tdir)){
            if(!TEACHER.has(child))err(`Unknown teacher material type: ${rel(path.join(tdir,child))}`);
            else await validateFiles(path.join(tdir,child));
          }
          if((await files(tdir)).length)err(`Files must be inside a teacher subtype: ${rel(tdir)}`);
        }else{
          if((await dirs(tdir)).length)err(`Unexpected nested directory: ${rel(tdir)}`);
          await validateFiles(tdir);
        }
      }
    }
  }
  if(await exists(path.join(ROOT,'5-sinif')))err('Duplicate legacy material root 5-sinif/ must not exist');
}

const PLAN_RULES=[
  ['gunluk-planlar-5sinif',37],
  ['gunluk-planlar-6sinif',37],
  ['gunluk-planlar-robotik',36],
  ['gunluk-planlar-yapay-zeka',36]
];

async function validatePlans(){
  for(const [folder,count] of PLAN_RULES){
    const dir=path.join(ROOT,folder);
    if(!(await exists(dir))){err(`Missing daily-plan directory: ${folder}`);continue;}
    const nums=new Map();
    let unpadded=0;
    for(const name of await files(dir)){
      if(name==='.gitkeep')continue;
      if(!name.endsWith('.docx')){warn(`Unexpected daily-plan file: ${folder}/${name}`);continue;}
      const m=name.match(/^hafta(\d+)-/);
      if(!m){err(`Daily-plan filename has no week number: ${folder}/${name}`);continue;}
      const n=Number(m[1]);
      if(nums.has(n))err(`Duplicate daily plan for week ${n}: ${folder}`);
      nums.set(n,name);
      if(m[1].length<2)unpadded++;
    }
    for(let n=1;n<=count;n++)if(!nums.has(n))err(`Missing daily plan: ${folder} week ${n}`);
    for(const n of nums.keys())if(n<1||n>count)err(`Out-of-range daily plan: ${folder} week ${n}`);
    if(unpadded)warn(`${folder}: ${unpadded} daily-plan filename(s) are not zero-padded yet; naming migration is still pending`);
  }
}

function parseLegacyWeeks(text, file){
  const p=text.indexOf('const WEEKS'), a=text.indexOf('[',p), z=text.indexOf('];',a);
  if(p<0||a<0||z<a)throw new Error(`${file}: const WEEKS block not found`);
  return JSON.parse(text.slice(a,z+1));
}

async function validateLegacyDataGuards(){
  for(const [file,count] of LEGACY_BTY_DATA_GUARDS){
    const full=path.join(ROOT,file);
    if(!(await exists(full))){err(`Legacy BTY data carrier is missing: ${file}`);continue;}
    try{
      const weeks=parseLegacyWeeks(await fs.readFile(full,'utf8'),file);
      if(!Array.isArray(weeks)||weeks.length!==count)err(`${file}: const WEEKS must parse to exactly ${count} records; got ${Array.isArray(weeks)?weeks.length:'non-array'}`);
    }catch(e){err(`Legacy BTY data guard failed: ${e.message}`);}
  }
}

async function redirectRoutes(){
  const out=new Set(['/']);
  const p=path.join(ROOT,'_redirects');
  if(!(await exists(p)))return out;
  const text=await fs.readFile(p,'utf8');
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith('#'))continue;
    const from=line.split(/\s+/)[0];
    if(from)out.add(from);
  }
  return out;
}

function isExternalRef(ref){
  return /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref);
}

async function validateStaticHtmlLinks(){
  const routes=await redirectRoutes();
  const htmlFiles=(await files(ROOT)).filter(x=>x.endsWith('.html')).sort();
  for(const file of htmlFiles){
    if(LEGACY_HTML_LINK_EXCLUDES.has(file))continue;
    const text=await fs.readFile(path.join(ROOT,file),'utf8');
    const re=/(?:href|src)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while((m=re.exec(text))){
      const original=m[1].trim();
      if(!original||original==='#'||original.startsWith('#')||isExternalRef(original))continue;
      const clean=original.split('#')[0].split('?')[0];
      if(!clean)continue;
      if(clean==='/')continue;
      if(clean.startsWith('/')&&routes.has(clean))continue;
      const target=clean.startsWith('/')?path.join(ROOT,clean.slice(1)):path.resolve(path.dirname(path.join(ROOT,file)),clean);
      if(!(await exists(target)))err(`Broken local HTML reference: ${file} -> ${original}`);
    }
  }
}

function planCountFromPath(p){
  if(p.includes('gunluk-planlar-5sinif')||p.includes('gunluk-planlar-6sinif'))return 37;
  if(p.includes('gunluk-planlar-robotik')||p.includes('gunluk-planlar-yapay-zeka'))return 36;
  return null;
}

async function validateClassroomPlanLinks(){
  const runtime=await fs.readFile(path.join(ROOT,'classroom-v2.js'),'utf8');
  const padded=/C\.plan\.replace\(\s*['"]\{n\}['"]\s*,\s*String\(w\.hafta_no\)\.padStart\(2\s*,\s*['"]0['"]\)\s*\)/.test(runtime);
  const raw=/C\.plan\.replace\(\s*['"]\{n\}['"]\s*,\s*w\.hafta_no\s*\)/.test(runtime);
  if(!padded&&!raw){err('classroom-v2.js: daily-plan expansion pattern is unknown; validator cannot prove runtime links');return;}
  const token=n=>padded?String(n).padStart(2,'0'):String(n);
  for(const [file,count] of CLASSROOM_PLAN_RULES){
    const text=await fs.readFile(path.join(ROOT,file),'utf8');
    const m=text.match(/window\.KESKINLAB_COURSE\s*=\s*(\{[\s\S]*?\});/);
    if(!m){err(`${file}: KESKINLAB_COURSE config not found`);continue;}
    let config;
    try{config=JSON.parse(m[1]);}catch(e){err(`${file}: KESKINLAB_COURSE is not valid JSON (${e.message})`);continue;}
    if(!config.plan||!config.plan.includes('{n}')){err(`${file}: plan template must contain {n}`);continue;}
    for(let n=1;n<=count;n++){
      const target=config.plan.replace('{n}',token(n));
      if(!(await exists(path.join(ROOT,target))))err(`Broken Classroom daily-plan link: ${file} week ${n} -> ${target}`);
    }
  }
}

async function validateHomePlanLinks(){
  const text=await fs.readFile(path.join(ROOT,'home-v2.js'),'utf8');
  const templates=[...text.matchAll(/plan\s*:\s*n\s*=>\s*`([^`]+)`/g)].map(m=>m[1]);
  if(templates.length!==4){err(`home-v2.js: expected 4 daily-plan factories, found ${templates.length}`);return;}
  for(const tpl of templates){
    let factory;
    try{factory=new Function('n',`return \`${tpl}\`;`);}catch(e){err(`home-v2.js: cannot evaluate daily-plan factory (${e.message})`);continue;}
    let sample;
    try{sample=factory(1);}catch(e){err(`home-v2.js: daily-plan factory throws (${e.message})`);continue;}
    const count=planCountFromPath(sample);
    if(!count){err(`home-v2.js: unknown daily-plan factory target: ${sample}`);continue;}
    for(let n=1;n<=count;n++){
      let target;
      try{target=factory(n);}catch(e){err(`home-v2.js: daily-plan factory failed for week ${n} (${e.message})`);break;}
      if(!(await exists(path.join(ROOT,target))))err(`Broken homepage daily-plan link: week ${n} -> ${target}`);
    }
  }
}

async function validateDynamicPlanLinks(){
  await validateClassroomPlanLinks();
  await validateHomePlanLinks();
}

async function validateGenerated(){
  const p=path.join(ROOT,'generated','materials.json');
  if(!(await exists(p))){warn('generated/materials.json not present; run npm run generate before full validation');return;}
  try{JSON.parse(await fs.readFile(p,'utf8'));}catch(e){err(`generated/materials.json is invalid JSON: ${e.message}`);}
}

async function main(){
  await validateMaterialTree();
  await validatePlans();
  await validateLegacyDataGuards();
  await validateStaticHtmlLinks();
  await validateDynamicPlanLinks();
  await validateGenerated();
  for(const w of warnings)console.warn(`WARN  ${w}`);
  for(const e of errors)console.error(`ERROR ${e}`);
  console.log(`KeskinLab validation: ${errors.length} error(s), ${warnings.length} warning(s)`);
  if(errors.length)process.exit(1);
}
main().catch(e=>{console.error(e);process.exit(1)});
