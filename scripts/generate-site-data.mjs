import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const MATERIAL_ROOT=path.join(ROOT,'materyaller');
const DATA_ROOT=path.join(ROOT,'data');
const OUT_DIR=path.join(ROOT,'generated');
const MATERIAL_OUT=path.join(OUT_DIR,'materials.json');
const COURSE_OUT=path.join(OUT_DIR,'courses.json');

const COURSES=[
 ['5-sinif','5. Sınıf'],
 ['6-sinif','6. Sınıf'],
 ['robotik','Robotik Kodlama-I'],
 ['yapay-zeka','Yapay Zekâ Uygulamaları-I']
];
const COURSE_SOURCES={
 '5-sinif':{title:'5. Sınıf BTY',kind:'bty',file:'data/5-sinif.json',expectedWeeks:37},
 '6-sinif':{title:'6. Sınıf BTY',kind:'bty',file:'data/6-sinif.json',expectedWeeks:37},
 robotik:{title:'Robotik Kodlama-I',kind:'elective',file:'data/robotik.json',expectedWeeks:36},
 'yapay-zeka':{title:'Yapay Zekâ Uygulamaları-I',kind:'elective',file:'data/yapay-zeka.json',expectedWeeks:36}
};
const LEAVES=[
 ['sunum','Sunum'],['ders-notu','Ders Notu'],['ogrenci-etkinligi','Öğrenci Etkinliği'],['infografik','İnfografik'],['hafta-ozeti','Hafta Özeti'],
 ['olcme-degerlendirme/kisa-cevap','Kısa Cevaplı Kontrol'],['olcme-degerlendirme/rubrik','Dereceli Puanlama'],['olcme-degerlendirme/kontrol-listesi','Kontrol Listesi'],['ogretmen/gozlem-formu','Öğretmen Gözlem Formu']
];
const DISPLAYABLE=new Set(['.pdf','.png','.jpg','.jpeg']);
const EDITABLE=new Set(['.docx']);
const RASTER_EXT=new Set(['.png','.jpg','.jpeg']);
const IMAGE_TYPES=new Set(['sunum','infografik','hafta-ozeti']);
async function exists(p){try{await fs.access(p);return true}catch{return false}}
async function filesIn(dir){if(!(await exists(dir)))return[];const entries=await fs.readdir(dir,{withFileTypes:true});return entries.filter(e=>e.isFile()).map(e=>e.name).sort((a,b)=>a.localeCompare(b,'tr',{numeric:true}))}
function publicPath(...parts){return parts.join('/').replaceAll(path.sep,'/')}
function asciiSlug(value){return value.replaceAll('ı','i').replaceAll('İ','I').replaceAll('ş','s').replaceAll('Ş','S').replaceAll('ğ','g').replaceAll('Ğ','G').replaceAll('ç','c').replaceAll('Ç','C').replaceAll('ö','o').replaceAll('Ö','O').replaceAll('ü','u').replaceAll('Ü','U').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function downloadName(course,week,label,ext,index){const courseLabel=course.replace('5-sinif','5-Sinif').replace('6-sinif','6-Sinif').replace('robotik','Robotik').replace('yapay-zeka','Yapay-Zeka');const safeLabel=asciiSlug(label);const suffix=index==='01'?'':`-${index}`;return`KeskinLab-${courseLabel}-Hafta-${week}-${safeLabel}${suffix}${ext}`}
function groupFormats(names){const map=new Map();for(const name of names){const ext=path.extname(name).toLowerCase(),stem=path.basename(name,ext);if(!map.has(stem))map.set(stem,{});map.get(stem)[ext.slice(1)]=name}return[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr',{numeric:true}))}
function webPaths(course,week,rel,name){const ext=path.extname(name),stem=path.basename(name,ext),base=publicPath('generated','web',course,`hafta${week}`,rel);return{web:publicPath(base,`${stem}.webp`),thumb:publicPath(base,`${stem}-thumb.webp`)}}
async function collectLeaf(course,week,rel,label){const dir=path.join(MATERIAL_ROOT,course,`hafta${week}`,...rel.split('/')),names=await filesIn(dir);if(!names.length)return[];if(IMAGE_TYPES.has(rel)){return names.map(name=>{const ext=path.extname(name).toLowerCase(),index=path.basename(name,ext),href=publicPath('materyaller',course,`hafta${week}`,rel,name),derived=RASTER_EXT.has(ext)?webPaths(course,week,rel,name):null;return{type:rel,label,index,preview:DISPLAYABLE.has(ext)?href:null,webPreview:derived?.web??null,thumbnail:derived?.thumb??null,editable:EDITABLE.has(ext)?href:null,downloads:[{href,format:ext.slice(1),filename:downloadName(course,week,label,ext,index)}]}})}return groupFormats(names).map(([index,formats])=>{const pdf=formats.pdf?publicPath('materyaller',course,`hafta${week}`,rel,formats.pdf):null,docx=formats.docx?publicPath('materyaller',course,`hafta${week}`,rel,formats.docx):null,downloads=[];if(pdf)downloads.push({href:pdf,format:'pdf',filename:downloadName(course,week,label,'.pdf',index)});if(docx)downloads.push({href:docx,format:'docx',filename:downloadName(course,week,`${label} Düzenlenebilir`,'.docx',index)});return{type:rel,label,index,preview:pdf,webPreview:null,thumbnail:null,editable:docx,downloads}}).filter(x=>x.preview||x.editable||x.downloads.length)}
function normalizeWeek(source,sourceKind){const kazanimlar=Array.isArray(source.kazanimlar)?[...source.kazanimlar]:[],surec=Array.isArray(source.surec_bilesenleri)?[...source.surec_bilesenleri]:[];return{hafta_no:Number(source.hafta_no),baslangic:source.baslangic??'',bitis:source.bitis??'',tarih_araligi:source.tarih_araligi??source.tarih??'',ders_saati:source.ders_saati??null,tema:source.tema??source.unite??'',unite:source.unite??'',konu:source.konu??'',ogrenme_ciktisi:source.ogrenme_ciktisi??kazanimlar.join(' • '),kazanimlar,surec_bilesenleri:surec.length?surec:kazanimlar,etkinlik:source.etkinlik??'',ozel_hafta:Boolean(source.ozel_hafta),kurban_bayrami_cakisiyor:Boolean(source.kurban_bayrami_cakisiyor),belirli_gun:source.belirli_gun??'',sourceKind,source}}
async function readCanonical(config){const payload=JSON.parse(await fs.readFile(path.join(ROOT,config.file),'utf8'));if(payload.schemaVersion!==1)throw new Error(`${config.file}: schemaVersion must be 1`);if(payload.sourceKind!==config.kind)throw new Error(`${config.file}: sourceKind mismatch`);if(payload.weekCount!==config.expectedWeeks)throw new Error(`${config.file}: weekCount mismatch`);if(!Array.isArray(payload.weeks)||payload.weeks.length!==config.expectedWeeks)throw new Error(`${config.file}: expected ${config.expectedWeeks} weeks`);return payload.weeks}
async function generateMaterials(){const result={schemaVersion:2,generatedAt:new Date().toISOString(),courses:{}};for(const[course,title]of COURSES){const courseDir=path.join(MATERIAL_ROOT,course),weeks={};if(await exists(courseDir)){const entries=await fs.readdir(courseDir,{withFileTypes:true}),weekDirs=entries.filter(e=>e.isDirectory()&&/^hafta\d{2}$/.test(e.name)).sort((a,b)=>a.name.localeCompare(b.name));for(const w of weekDirs){const week=w.name.slice(5),materials=[];for(const[rel,label]of LEAVES)materials.push(...await collectLeaf(course,week,rel,label));weeks[week]={week:Number(week),materials}}}result.courses[course]={title,weeks}}await fs.writeFile(MATERIAL_OUT,JSON.stringify(result,null,2)+'\n','utf8');console.log(`Generated ${path.relative(ROOT,MATERIAL_OUT)}`)}
async function generateCourses(){const result={schemaVersion:2,generatedAt:new Date().toISOString(),courses:{}};for(const[course,config]of Object.entries(COURSE_SOURCES)){const sourceWeeks=await readCanonical(config);result.courses[course]={title:config.title,sourceKind:config.kind,sourceFile:config.file,weekCount:config.expectedWeeks,weeks:sourceWeeks.map(w=>normalizeWeek(w,config.kind))}}await fs.writeFile(COURSE_OUT,JSON.stringify(result,null,2)+'\n','utf8');console.log(`Generated ${path.relative(ROOT,COURSE_OUT)}`)}
async function main(){await fs.mkdir(OUT_DIR,{recursive:true});await generateMaterials();await generateCourses()}
main().catch(err=>{console.error(err);process.exit(1)});
