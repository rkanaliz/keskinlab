import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const MATERIAL_ROOT = path.join(ROOT, 'materyaller');
const TARGET_BYTES = 600 * 1024;
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg']);

async function exists(p){ try{ await fs.access(p); return true; }catch{return false;} }
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

function kib(n){ return `${(n/1024).toFixed(0)} KiB`; }

async function optimizeOne(file){
  const before=(await fs.stat(file)).size;
  if(before<=TARGET_BYTES)return {file,before,after:before,changed:false};
  const ext=path.extname(file).toLowerCase();
  const beforeMeta=await sharp(file).metadata();
  const temp=`${file}.keskinlab-opt${ext}`;
  let pipeline=sharp(file,{failOn:'none'}).withMetadata({orientation:undefined});
  if(ext==='.png'){
    pipeline=pipeline.png({
      palette:true,
      colours:256,
      quality:100,
      compressionLevel:9,
      effort:10,
      adaptiveFiltering:true,
      dither:0.8
    });
  }else{
    pipeline=pipeline.jpeg({quality:90,mozjpeg:true,chromaSubsampling:'4:4:4'});
  }
  await pipeline.toFile(temp);
  const afterMeta=await sharp(temp).metadata();
  if(beforeMeta.width!==afterMeta.width||beforeMeta.height!==afterMeta.height){
    await fs.rm(temp,{force:true});
    throw new Error(`Pixel dimensions changed for ${path.relative(ROOT,file)}: ${beforeMeta.width}x${beforeMeta.height} -> ${afterMeta.width}x${afterMeta.height}`);
  }
  const after=(await fs.stat(temp)).size;
  if(after>=before){
    await fs.rm(temp,{force:true});
    return {file,before,after:before,changed:false};
  }
  await fs.rename(temp,file);
  return {file,before,after,changed:true};
}

async function main(){
  const files=await walk(MATERIAL_ROOT);
  let changed=0,beforeTotal=0,afterTotal=0;
  for(const file of files){
    const result=await optimizeOne(file);
    beforeTotal+=result.before;
    afterTotal+=result.after;
    if(result.changed){
      changed++;
      console.log(`OPT ${path.relative(ROOT,file)}: ${kib(result.before)} -> ${kib(result.after)}`);
    }
  }
  console.log(`Source image optimization: ${changed}/${files.length} changed; ${kib(beforeTotal)} -> ${kib(afterTotal)}. Pixel dimensions preserved.`);
}

main().catch(e=>{console.error(e);process.exit(1)});
