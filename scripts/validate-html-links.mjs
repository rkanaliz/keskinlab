import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SKIP_DIRS=new Set(['.git','node_modules','generated','.cache']);
const errors=[];

async function exists(p){try{await fs.access(p);return true}catch{return false}}
async function walk(dir){
  const out=[];
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    if(entry.isDirectory()&&SKIP_DIRS.has(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(full));
    else if(entry.isFile()&&entry.name.endsWith('.html'))out.push(full);
  }
  return out;
}
async function redirectRoutes(){
  const routes=new Set(['/']);
  const file=path.join(ROOT,'_redirects');
  if(!(await exists(file)))return routes;
  const text=await fs.readFile(file,'utf8');
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith('#'))continue;
    const from=line.split(/\s+/)[0];
    if(from)routes.add(from);
  }
  return routes;
}
function external(ref){return /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(ref)}
async function validTarget(fromFile,clean,routes){
  if(clean==='/')return true;
  if(clean.startsWith('/')&&routes.has(clean))return true;
  const target=clean.startsWith('/')?path.join(ROOT,clean.slice(1)):path.resolve(path.dirname(fromFile),clean);
  if(await exists(target))return true;
  if(!path.extname(clean)&&await exists(`${target}.html`))return true;
  if(await exists(path.join(target,'index.html')))return true;
  return false;
}

async function main(){
  const routes=await redirectRoutes();
  const htmlFiles=(await walk(ROOT)).sort();
  for(const file of htmlFiles){
    const text=await fs.readFile(file,'utf8');
    const re=/(?:href|src)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while((m=re.exec(text))){
      const original=m[1].trim();
      if(!original||original==='#'||original.startsWith('#')||external(original))continue;
      const clean=original.split('#')[0].split('?')[0];
      if(!clean)continue;
      if(!(await validTarget(file,clean,routes))){
        errors.push(`Broken local HTML reference: ${path.relative(ROOT,file).replaceAll(path.sep,'/')} -> ${original}`);
      }
    }
  }
  for(const e of errors)console.error(`ERROR ${e}`);
  console.log(`HTML link validation: ${htmlFiles.length} file(s), ${errors.length} error(s)`);
  if(errors.length)process.exit(1);
}
main().catch(e=>{console.error(e);process.exit(1)});
