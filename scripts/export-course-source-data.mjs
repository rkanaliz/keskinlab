import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'data');
const SOURCES={
  '5-sinif':{kind:'bty',files:['5-sinif-bty.html'],count:37,title:'5. Sınıf BTY'},
  '6-sinif':{kind:'bty',files:['6-sinif-bty.html'],count:37,title:'6. Sınıf BTY'},
  robotik:{kind:'elective',files:['robotik-data-1.js','robotik-data-2.js'],count:36,title:'Robotik Kodlama-I'},
  'yapay-zeka':{kind:'elective',files:['yapay-zeka-data-1.js','yapay-zeka-data-2.js'],count:36,title:'Yapay Zekâ Uygulamaları-I'}
};
function parseBty(text,file){const p=text.indexOf('const WEEKS'),a=text.indexOf('[',p),z=text.indexOf('];',a);if(p<0||a<0||z<a)throw new Error(`${file}: const WEEKS block not found`);return JSON.parse(text.slice(a,z+1));}
function parseElective(text,file){const p=text.indexOf('COURSE_WEEKS.push(...'),a=text.indexOf('[',p),z=text.lastIndexOf(']);');if(p<0||a<0||z<a)throw new Error(`${file}: COURSE_WEEKS.push block not found`);return JSON.parse(text.slice(a,z+1));}
async function read(config){const chunks=[];for(const file of config.files){const text=await fs.readFile(path.join(ROOT,file),'utf8');chunks.push(config.kind==='bty'?parseBty(text,file):parseElective(text,file));}const weeks=chunks.flat().sort((a,b)=>Number(a.hafta_no)-Number(b.hafta_no));if(weeks.length!==config.count)throw new Error(`${config.title}: expected ${config.count}, got ${weeks.length}`);return weeks;}
await fs.mkdir(OUT,{recursive:true});
for(const [key,config] of Object.entries(SOURCES)){
  const weeks=await read(config);
  const payload={schemaVersion:1,course:key,title:config.title,sourceKind:config.kind,weekCount:config.count,weeks};
  await fs.writeFile(path.join(OUT,`${key}.json`),JSON.stringify(payload,null,2)+'\n','utf8');
  console.log(`Exported data/${key}.json (${weeks.length} weeks)`);
}
