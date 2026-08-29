import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SKIP_DIRS=new Set(['.git','node_modules','generated','.cache']);
const FILE_EXT_RE=/\.(?:html?|css|js|mjs|json|svg|png|jpe?g|webp|gif|pdf|docx|xlsx|zip)(?:[?#].*)?$/i;
const TEMPLATE_RE=/\$\{[^}]+\}|\{[A-Za-z_]\w*\}/;
const errors=new Set();

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
function cleanRef(ref){return ref.split('#')[0].split('?')[0]}
function fileLabel(file){return path.relative(ROOT,file).replaceAll(path.sep,'/')}
async function validTarget(fromFile,clean,routes){
  if(clean==='/')return true;
  if(clean.startsWith('/')&&routes.has(clean))return true;
  const target=clean.startsWith('/')?path.join(ROOT,clean.slice(1)):path.resolve(path.dirname(fromFile),clean);
  if(await exists(target))return true;
  if(!path.extname(clean)&&await exists(`${target}.html`))return true;
  if(await exists(path.join(target,'index.html')))return true;
  return false;
}
async function validateStaticRef(file,original,routes,kind='HTML reference'){
  if(!original||original==='#'||original.startsWith('#')||external(original)||TEMPLATE_RE.test(original))return;
  const clean=cleanRef(original);
  if(!clean)return;
  if(!(await validTarget(file,clean,routes)))errors.add(`Broken local ${kind}: ${fileLabel(file)} -> ${original}`);
}
async function validateTemplatePath(file,original){
  if(!TEMPLATE_RE.test(original)||external(original))return;
  const clean=cleanRef(original);
  const match=clean.match(TEMPLATE_RE);
  if(!match)return;
  const before=clean.slice(0,match.index);
  if(!before.includes('/'))return;
  const base=before.endsWith('/')?before:path.posix.dirname(before);
  const target=before.startsWith('/')?path.join(ROOT,base.slice(1)):path.resolve(path.dirname(file),base);
  if(!(await exists(target)))errors.add(`Broken local template path base: ${fileLabel(file)} -> ${original}`);
}
async function validateEmbeddedFileLiterals(file,text,routes){
  const re=/(?:'([^'\n]+)'|"([^"\n]+)"|`([^`\n]+)`)/g;
  let m;
  while((m=re.exec(text))){
    const value=(m[1]??m[2]??m[3]??'').trim();
    if(!value||external(value)||!value.includes('/'))continue;
    if(TEMPLATE_RE.test(value)){
      if(FILE_EXT_RE.test(value))await validateTemplatePath(file,value);
      continue;
    }
    if(!FILE_EXT_RE.test(value))continue;
    await validateStaticRef(file,value,routes,'file literal');
  }
}

async function main(){
  const routes=await redirectRoutes();
  const htmlFiles=(await walk(ROOT)).sort();
  for(const file of htmlFiles){
    const text=await fs.readFile(file,'utf8');
    const attrRe=/(?:href|src)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while((m=attrRe.exec(text)))await validateStaticRef(file,m[1].trim(),routes);
    await validateEmbeddedFileLiterals(file,text,routes);
  }
  for(const e of errors)console.error(`ERROR ${e}`);
  console.log(`HTML link validation: ${htmlFiles.length} file(s), ${errors.size} error(s)`);
  if(errors.size)process.exit(1);
}
main().catch(e=>{console.error(e);process.exit(1)});
