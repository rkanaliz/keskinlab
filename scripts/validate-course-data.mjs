import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, 'generated', 'courses.json');
const errors = [];

const SOURCES = {
  '5-sinif': { kind:'bty', files:['5-sinif-bty.html'], count:37 },
  '6-sinif': { kind:'bty', files:['6-sinif-bty.html'], count:37 },
  robotik: { kind:'elective', files:['robotik-data-1.js','robotik-data-2.js'], count:36 },
  'yapay-zeka': { kind:'elective', files:['yapay-zeka-data-1.js','yapay-zeka-data-2.js'], count:36 }
};

function err(message){ errors.push(message); }

function parseBty(text, file){
  const p=text.indexOf('const WEEKS'), a=text.indexOf('[',p), z=text.indexOf('];',a);
  if(p<0||a<0||z<a)throw new Error(`${file}: const WEEKS block not found`);
  return JSON.parse(text.slice(a,z+1));
}

function parseElective(text, file){
  const p=text.indexOf('COURSE_WEEKS.push(...'), a=text.indexOf('[',p), z=text.lastIndexOf(']);');
  if(p<0||a<0||z<a)throw new Error(`${file}: COURSE_WEEKS.push block not found`);
  return JSON.parse(text.slice(a,z+1));
}

async function sourceWeeks(config){
  const parts=[];
  for(const file of config.files){
    const text=await fs.readFile(path.join(ROOT,file),'utf8');
    parts.push(config.kind==='bty'?parseBty(text,file):parseElective(text,file));
  }
  return parts.flat().sort((a,b)=>Number(a.hafta_no)-Number(b.hafta_no));
}

function stable(value){ return JSON.stringify(value); }

function expectedNormalized(source, kind){
  const kazanimlar=Array.isArray(source.kazanimlar)?[...source.kazanimlar]:[];
  const surec=Array.isArray(source.surec_bilesenleri)?[...source.surec_bilesenleri]:[];
  return {
    hafta_no:Number(source.hafta_no),
    baslangic:source.baslangic??'',
    bitis:source.bitis??'',
    tarih_araligi:source.tarih_araligi??source.tarih??'',
    ders_saati:source.ders_saati??null,
    tema:source.tema??source.unite??'',
    unite:source.unite??'',
    konu:source.konu??'',
    ogrenme_ciktisi:source.ogrenme_ciktisi??kazanimlar.join(' • '),
    kazanimlar,
    surec_bilesenleri:surec.length?surec:kazanimlar,
    etkinlik:source.etkinlik??'',
    ozel_hafta:Boolean(source.ozel_hafta),
    kurban_bayrami_cakisiyor:Boolean(source.kurban_bayrami_cakisiyor),
    belirli_gun:source.belirli_gun??'',
    sourceKind:kind
  };
}

async function main(){
  let generated;
  try{ generated=JSON.parse(await fs.readFile(GENERATED,'utf8')); }
  catch(e){ console.error(`ERROR generated/courses.json cannot be read: ${e.message}`); process.exit(1); }

  if(generated.schemaVersion!==1)err(`generated/courses.json schemaVersion must be 1; got ${generated.schemaVersion}`);

  for(const [course,config] of Object.entries(SOURCES)){
    const raw=await sourceWeeks(config);
    if(raw.length!==config.count)err(`${course}: source week count ${raw.length}, expected ${config.count}`);

    const out=generated.courses?.[course];
    if(!out){err(`${course}: missing from generated/courses.json`);continue;}
    if(out.weekCount!==config.count)err(`${course}: generated weekCount ${out.weekCount}, expected ${config.count}`);
    if(!Array.isArray(out.weeks)||out.weeks.length!==config.count){
      err(`${course}: generated weeks length ${Array.isArray(out.weeks)?out.weeks.length:'non-array'}, expected ${config.count}`);
      continue;
    }

    for(let i=0;i<raw.length;i++){
      const source=raw[i], generatedWeek=out.weeks[i];
      if(Number(generatedWeek.hafta_no)!==Number(source.hafta_no))err(`${course}: week order mismatch at index ${i}`);
      if(stable(generatedWeek.source)!==stable(source))err(`${course} week ${source.hafta_no}: source payload is not lossless`);

      const expected=expectedNormalized(source,config.kind);
      for(const [key,value] of Object.entries(expected)){
        if(stable(generatedWeek[key])!==stable(value))err(`${course} week ${source.hafta_no}: normalized ${key} mismatch`);
      }
    }
  }

  for(const course of Object.keys(generated.courses||{}))if(!SOURCES[course])err(`Unknown generated course: ${course}`);
  for(const e of errors)console.error(`ERROR ${e}`);
  console.log(`KeskinLab course-data validation: ${errors.length} error(s)`);
  if(errors.length)process.exit(1);
}

main().catch(e=>{console.error(e);process.exit(1)});
