import { promises as fs } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';

const ROOT=process.cwd();
const GENERATED=path.join(ROOT,'generated','courses.json');
const errors=[];
const SOURCES={
 '5-sinif':{kind:'bty',canonical:'data/5-sinif.json',legacyOutput:'course-data-5-sinif.js',count:37},
 '6-sinif':{kind:'bty',canonical:'data/6-sinif.json',legacyOutput:'course-data-6-sinif.js',count:37},
 robotik:{kind:'elective',legacy:['robotik-data-1.js','robotik-data-2.js'],canonical:'data/robotik.json',legacyOutput:'course-data-robotik.js',count:36},
 'yapay-zeka':{kind:'elective',legacy:['yapay-zeka-data-1.js','yapay-zeka-data-2.js'],canonical:'data/yapay-zeka.json',legacyOutput:'course-data-yapay-zeka.js',count:36}
};
function err(m){errors.push(m)}
function parseElective(text,file){const p=text.indexOf('COURSE_WEEKS.push(...'),a=text.indexOf('[',p),z=text.lastIndexOf(']);');if(p<0||a<0||z<a)throw new Error(`${file}: COURSE_WEEKS.push block not found`);return JSON.parse(text.slice(a,z+1))}
async function legacyWeeks(config){if(!config.legacy)return null;const parts=[];for(const file of config.legacy){const text=await fs.readFile(path.join(ROOT,file),'utf8');parts.push(parseElective(text,file))}return parts.flat().sort((a,b)=>Number(a.hafta_no)-Number(b.hafta_no))}
async function canonical(config){return JSON.parse(await fs.readFile(path.join(ROOT,config.canonical),'utf8'))}
function stable(v){return JSON.stringify(v)}
function optionalWeekFields(source){const result={};for(const key of['icerik_ders_saati','okul_temelli_planlama_saati','dersler','kilavuz'])if(Object.hasOwn(source,key))result[key]=source[key];return result}
function stripCodes(text=''){return String(text).split('•').map(part=>part.trim()).filter((part,index)=>!(index===0&&/^[A-ZÇĞİÖŞÜ]+\./u.test(part))).map(part=>part.replace(/^(?:[A-ZÇĞİÖŞÜ]+\.)?\d+(?:\.\d+)+\.?\s*/u,'')).filter(Boolean).join(' · ')}
async function legacyOutput(config){try{const context={window:{}};runInNewContext(await fs.readFile(path.join(ROOT,config.legacyOutput),'utf8'),context);return context.window.KL5_DATA}catch(e){err(`${config.legacyOutput}: cannot be read: ${e.message}`);return null}}
function legacyWeek(source,kind,themeNames){const theme=source.tema||source.unite||null;if(theme&&!themeNames.includes(theme))themeNames.push(theme);return{n:Number(source.hafta_no),tarih:source.tarih_araligi||source.tarih,saat:source.ders_saati||'2',tema:theme,temaNo:theme?String(themeNames.indexOf(theme)+1):null,konu:kind==='elective'?stripCodes(source.konu):source.konu,cikti:source.ogrenme_ciktisi||(source.kazanimlar||[]).join(' '),surec:source.surec_bilesenleri||(source.etkinlik?[source.etkinlik]:[]),...optionalWeekFields(source),ozel:Boolean(source.ozel_hafta)||(!source.konu&&/SINAV|SOSYAL|OKUL TEMELLİ/i.test(source.ders_saati||'')),baslangic:source.baslangic,bitis:source.bitis}}
function normalized(source,kind){const kazanimlar=Array.isArray(source.kazanimlar)?[...source.kazanimlar]:[],surec=Array.isArray(source.surec_bilesenleri)?[...source.surec_bilesenleri]:[];return{hafta_no:Number(source.hafta_no),baslangic:source.baslangic??'',bitis:source.bitis??'',tarih_araligi:source.tarih_araligi??source.tarih??'',ders_saati:source.ders_saati??null,tema:source.tema??source.unite??'',unite:source.unite??'',konu:source.konu??'',ogrenme_ciktisi:source.ogrenme_ciktisi??kazanimlar.join(' • '),kazanimlar,surec_bilesenleri:surec.length?surec:kazanimlar,etkinlik:source.etkinlik??'',ozel_hafta:Boolean(source.ozel_hafta),kurban_bayrami_cakisiyor:Boolean(source.kurban_bayrami_cakisiyor),belirli_gun:source.belirli_gun??'',...optionalWeekFields(source),sourceKind:kind}}
function lessonHours(week){if(Number.isFinite(week.icerik_ders_saati))return Number(week.icerik_ders_saati);return String(week.ders_saati||'').split('+').reduce((sum,value)=>sum+(Number(value.replace('*',''))||0),0)}
function validateFiveSinifTiming(weeks){const specialOtpWeeks=[8,16,25,35];for(const number of specialOtpWeeks){const week=weeks.find(item=>Number(item.hafta_no)===number);if(!week||week.ders_saati!=='1+1*'||week.ozel_hafta||week.icerik_ders_saati!==1||week.okul_temelli_planlama_saati!==1)err(`5-sinif week ${number}: expected content + OTP 1+1* structure`)}const week23=weeks.find(item=>Number(item.hafta_no)===23);if(!week23||week23.ders_saati!=='2'||week23.ozel_hafta||week23.tema!=='Yapay Zekâ'||week23.konu!=='Yapay Zekâda Güvenlik'||!String(week23.ogrenme_ciktisi).includes('BTY.5.5.2'))err('5-sinif week 23: expected two-hour Yapay Zekâda Güvenlik content');const teachingWeeks=weeks.filter(week=>!week.ozel_hafta);const themeHours=teachingWeeks.reduce((sum,week)=>sum+lessonHours(week),0),otpHours=teachingWeeks.reduce((sum,week)=>sum+(Number(week.okul_temelli_planlama_saati)||0),0);if(themeHours!==68)err(`5-sinif: theme hours ${themeHours}, expected 68`);if(otpHours!==4)err(`5-sinif: OTP hours ${otpHours}, expected 4`);if(themeHours+otpHours!==72)err(`5-sinif: program hours ${themeHours+otpHours}, expected 72`)}
async function main(){let generated;try{generated=JSON.parse(await fs.readFile(GENERATED,'utf8'))}catch(e){console.error(`ERROR generated/courses.json cannot be read: ${e.message}`);process.exit(1)}if(generated.schemaVersion!==2)err(`generated/courses.json schemaVersion must be 2; got ${generated.schemaVersion}`);
 for(const[course,config]of Object.entries(SOURCES)){
  const source=await canonical(config),legacy=await legacyWeeks(config),legacyData=await legacyOutput(config);
  if(source.schemaVersion!==1)err(`${config.canonical}: schemaVersion must be 1`);
  if(source.sourceKind!==config.kind)err(`${config.canonical}: sourceKind mismatch`);
  if(source.weekCount!==config.count)err(`${config.canonical}: weekCount ${source.weekCount}, expected ${config.count}`);
  if(!Array.isArray(source.weeks)||source.weeks.length!==config.count){err(`${config.canonical}: invalid weeks length`);continue}
  if(course==='5-sinif')validateFiveSinifTiming(source.weeks);
  if(legacy){
   if(legacy.length!==config.count)err(`${course}: legacy week count ${legacy.length}, expected ${config.count}`);
   if(stable(source.weeks)!==stable(legacy))err(`${course}: canonical data is not lossless against migration source`);
  }
  if(legacyData){
   if(legacyData.course?.totalWeeks!==config.count)err(`${course}: ${config.legacyOutput} totalWeeks mismatch`);
   if(!Array.isArray(legacyData.weeks)||legacyData.weeks.length!==config.count)err(`${course}: ${config.legacyOutput} weeks length mismatch`);
   else {const themeNames=[];for(let i=0;i<source.weeks.length;i++){const expected=legacyWeek(source.weeks[i],config.kind,themeNames),actual=legacyData.weeks[i];if(stable(actual)!==stable(expected))err(`${course} week ${source.weeks[i].hafta_no}: ${config.legacyOutput} weekly payload mismatch`)}}
  }
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
