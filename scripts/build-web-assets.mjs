import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT=process.cwd();
const MATERIAL_ROOT=path.join(ROOT,'materyaller');
const OUT_ROOT=path.join(ROOT,'generated','web');
const RASTER_EXT=new Set(['.png','.jpg','.jpeg']);

async function exists(p){try{await fs.access(p);return true}catch{return false}}
async function walk(dir){
  const out=[];
  if(!(await exists(dir)))return out;
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(full));
    else if(entry.isFile()&&RASTER_EXT.has(path.extname(entry.name).toLowerCase()))out.push(full);
  }
  return out;
}

async function main(){
  await fs.rm(OUT_ROOT,{recursive:true,force:true});
  const files=await walk(MATERIAL_ROOT);
  for(const file of files){
    const relative=path.relative(MATERIAL_ROOT,file);
    const parsed=path.parse(relative);
    const dir=path.join(OUT_ROOT,parsed.dir);
    await fs.mkdir(dir,{recursive:true});
    const web=path.join(dir,`${parsed.name}.webp`);
    const thumb=path.join(dir,`${parsed.name}-thumb.webp`);
    await sharp(file,{failOn:'none'}).webp({quality:80,effort:5,smartSubsample:true}).toFile(web);
    await sharp(file,{failOn:'none'}).resize({width:480,withoutEnlargement:true}).webp({quality:78,effort:5,smartSubsample:true}).toFile(thumb);
  }
  console.log(`Generated ${files.length} WebP previews and ${files.length} thumbnails under generated/web/`);
}

main().catch(e=>{console.error(e);process.exit(1)});
