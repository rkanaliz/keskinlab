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

async function validateGenerated(){
  const p=path.join(ROOT,'generated','materials.json');
  if(!(await exists(p))){warn('generated/materials.json not present; run npm run generate before full validation');return;}
  try{JSON.parse(await fs.readFile(p,'utf8'));}catch(e){err(`generated/materials.json is invalid JSON: ${e.message}`);}
}

async function main(){
  await validateMaterialTree();
  await validatePlans();
  await validateGenerated();
  for(const w of warnings)console.warn(`WARN  ${w}`);
  for(const e of errors)console.error(`ERROR ${e}`);
  console.log(`KeskinLab validation: ${errors.length} error(s), ${warnings.length} warning(s)`);
  if(errors.length)process.exit(1);
}
main().catch(e=>{console.error(e);process.exit(1)});
