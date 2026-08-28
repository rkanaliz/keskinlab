import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const GENERATED=path.join(ROOT,'generated','courses.json');
const errors=[];
const SOURCES={
 '5-sinif':{kind:'bty',legacy:['5-sinif-bty.html'],canonical:'data/5-sinif.json',count:37},
 '6-sinif':{kind:'bty',legacy:['6-sinif-bty.html'],canonical:'data/6-sinif.json',count:37},
 robotik:{kind:'elective',legacy:['robotik-data-1.js','robotik-data-2.js'],canonical:'data/robotik.json',count:36},
 'yapay-zeka':{kind:'elective',legacy:['yapay-zeka-data-1.js','yapay-zeka-data-2.js'],canonical:'data/yapay-zeka.json',count:36}
};
function err(m){errors.push(m)}
function parseBty(text,file){const p=text.indexOf('const WEEKS'),a=text.indexOf('[',p),z=text.indexOf('];',a);if(p<0||a<0||z<a)throw new Error(`${file}: const WEEKS block not found`);return JSON.parse(text.slice(a,z+1))}
function parseElective(text,file){const p=text.indexOf('COURSE_WEEKS.push(...'),a=text.indexOf('[',p),z=text.lastIndexOf(']);');if(p<0||a<0||z<a)throw new Error(`${file}: COURSE_WEEKS.push block not found`);return JSON.parse(text.slice(a,z+1))}
async function legacyWeeks(config){const parts=[];for(const file of config.legacy){const text=await fs.readFile(path.join(ROOT,file),'utf8');parts.push(config.kind==='bty'?parseBty(text,file):parseElective(text,file))}return parts.flat().sort((a,b)=>Number(a.hafta_no)-Number(b.hafta_no))}
async function canonical(config){return JSON.parse(await fs.readFile(path.join(ROOT,config.canonical),'utf8'))}
function stable(v){return JSON.stringify(v)}
function normalized(source,kind){const kazanimlar=Array.isArray(source.kazanimlar)?[...source.kazanimlar]:[],surec=Array.isArray(source.surec_bilesenleri)?[...source.surec_bilesenleri]:[];return{hafta_no:Number(source.hafta_no),baslangic:source.baslangic??'',bitis:source.bitis??'',tarih_araligi:source.tarih_araligi??source.tarih??'',ders_saati:source.ders_saati??null,tema:source.tema??source.unite??'',unite:source.unite??'',konu:source.konu??'',ogrenme_ciktisi:source.ogrenme_ciktisi??kazanimlar.join(' • '),kazanimlar,surec_bilesenleri:surec.length?surec:kazanimlar,etkinlik:source.etkinlik??'',ozel_hafta:Boolean(source.ozel_hafta),kurban_bayrami_cakisiyor:Boolean(source.kurban_bayrami_cakisiyor),belirli_gun:source.belirli_gun??'',sourceKind:kind}}
async function main(){let generated;try{generated=JSON.parse(await fs.readFile(GENERATED,'utf8'))}catch(e){console.error(`ERROR generated/courses.json cannot be read: ${e.message}`);process.exit(1)}if(generated.schemaVersion!==2)err(`generated/courses.json schemaVersion must be 2; got ${generated.schemaVersion}`);
 for(const[course,config]of Object.entries(SOURCES)){
  const legacy=await legacyWeeks(config),source=await canonical(config);
  if(source.schemaVersion!==1)err(`${config.canonical}: schemaVersion must be 1`);
  if(source.sourceKind!==config.kind)err(`${config.canonical}: sourceKind mismatch`);
  if(source.weekCount!==config.count)err(`${config.canonical}: weekCount ${source.weekCount}, expected ${config.count}`);
  if(!Array.isArray(source.weeks)||source.weeks.length!==config.count){err(`${config.canonical}: invalid weeks length`);continue}
  if(legacy.length!==config.count)err(`${course}: legacy week count ${legacy.length}, expected ${config.count}`);
  if(stable(source.weeks)!==stable(legacy))err(`${course}: canonical data is not lossless against migration source`);
  const out=generated.courses?.[course];if(!out){err(`${course}: missing from generated/courses.json`);continue}
  if(out.weekCount!==config.count)err(`${course}: generated weekCount mismatch`);
  if(out.sourceFile!==config.canonical)err(`${course}: generated sourceFile mismatch`);
  if(!Array.isArray(out.weeks)||out.weeks.length!==config.count){err(`${course}: generated weeks length mismatch`);continue}
  for(let i=0;i<source.weeks.length;i++){
   const raw=source.weeks[i],g=out.weeks[i];
   if(Number(g.hafta_no)!==Number(raw.hafta_no))err(`${course}: week order mismatch at index ${i}`);
   if(stable(g.source)!==stable(raw))err(`${course} week ${raw.hafta_no}: generated source payload is not lossless`);
   const expected=normalized(raw,config.kind);for(const[k,v]of Object.entries(expected))if(stable(g[k])!==stable(v))err(`${course} week ${raw.hafta_no}: normalized ${k} mismatch`);
  }
 }
 for(const course of Object.keys(generated.courses||{}))if(!SOURCES[course])err(`Unknown generated course: ${course}`);
 for(const e of errors)console.error(`ERROR ${e}`);console.log(`KeskinLab course-data validation: ${errors.length} error(s)`);if(errors.length)process.exit(1)
}
main().catch(e=>{console.error(e);process.exit(1)});
