import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
const derive = promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function makeCredential(password) {
  const salt = randomBytes(24).toString('hex');
  const key = await derive(password,salt,64,{N:32768,maxmem:64*1024*1024});
  return {salt,hash:key.toString('hex')};
}
function webUrl(value) {
  try {const url=new URL(value);return ['http:','https:'].includes(url.protocol);}catch{return false;}
}
export function validateProjects(items) {
  if(!Array.isArray(items)||items.length>100) return false;
  const ids=new Set();
  return items.every(item=>{
    if(!item||typeof item!=='object'||!['id','title','url','category','tagline','thumbnail'].every(key=>typeof item[key]==='string'))return false;
    if(!item.id||item.id.length>100||ids.has(item.id))return false;ids.add(item.id);
    return item.title.trim().length>0&&item.title.length<=80&&item.category.trim().length>0&&item.category.length<=60&&item.url.length<=2048&&webUrl(item.url)&&item.tagline.length<=2000&&item.thumbnail.length<=2048&&(!item.thumbnail||webUrl(item.thumbnail)||/^\/portfolio\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|avif)$/i.test(item.thumbnail));
  });
}
export function validateSkills(items) {
  if(!Array.isArray(items)||items.length>20)return false;
  const ids=new Set();
  return items.every(group=>{
    if(!group||typeof group.id!=='string'||!group.id||group.id.length>100||ids.has(group.id)||typeof group.title!=='string'||!group.title.trim()||group.title.length>80||!Array.isArray(group.items)||group.items.length>50)return false;
    ids.add(group.id);
    return group.items.every(item=>typeof item==='string'&&item.trim().length>0&&item.length<=80)&&new Set(group.items).size===group.items.length;
  });
}
async function jsonBody(req) {
  let size=0;const parts=[];
  for await(const part of req){size+=part.length;if(size>1024*1024)throw new Error('Body too large');parts.push(part);}
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
/** Same handler for Vite development and the production Node server. */
export function createApi({root,privateDir=path.join(root,'.private'),originForRequest}) {
  const sessions=new Map(),attempts=new Map();let queue=Promise.resolve();let activeLogins=0;
  const credentialFile=path.join(privateDir,'owner.json');
  async function credential(){try{return JSON.parse(await readFile(credentialFile,'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}}
  async function content(){
    try {const saved=JSON.parse(await readFile(path.join(privateDir,'content.json'),'utf8'));if(!validateProjects(saved.projects)||!validateSkills(saved.skills))throw new Error('Invalid saved content');return saved;}
    catch(error){if(error.code!=='ENOENT')throw error;return {projects:JSON.parse(await readFile(path.join(root,'src/data/projects.json'),'utf8')),skills:JSON.parse(await readFile(path.join(root,'src/data/skills.json'),'utf8'))};}
  }
  function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
  function session(req){const token=(req.headers.cookie||'').split(';').map(value=>value.trim()).find(value=>value.startsWith('jeff_owner='))?.slice(11);if(!token)return null;const key=hash(token),entry=sessions.get(key);if(!entry||entry.expires<Date.now()){sessions.delete(key);return null;}return {...entry,key};}
  return async function api(req,res,next) {
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(!pathname.startsWith('/api/')){next?.();return;}
    try {
      const origin=originForRequest(req);
      if(!origin){send(res,403,{error:'This host is not allowed.'});return;}
      const mutating=!['GET','HEAD'].includes(req.method);
      if(mutating&&(req.headers.origin!==origin||!(req.headers['content-type']||'').startsWith('application/json'))){send(res,403,{error:'Invalid request origin or content type.'});return;}
      if(req.method==='GET'&&pathname==='/api/content'){send(res,200,await content());return;}
      if(req.method==='GET'&&pathname==='/api/session'){const owner=session(req);send(res,200,{authenticated:!!owner,configured:!!await credential(),csrf:owner?.csrf||''});return;}
      if(req.method==='POST'&&pathname==='/api/login') {
        const now=Date.now(),ip=req.socket.remoteAddress||'local';
        for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
        if(attempts.size>1000){send(res,429,{error:'Please try again later.'});return;}
        const bucket=attempts.get(ip)||{count:0,until:now+15*60*1000};
        if(bucket.count>=5){send(res,429,{error:'Too many attempts. Try again in 15 minutes.'});return;}
        bucket.count++;attempts.set(ip,bucket);
        const credentials=await credential();
        if(!credentials){send(res,503,{error:'Run SET OWNER PASSWORD.cmd on your computer first.'});return;}
        const body=await jsonBody(req);
        if(typeof body.password!=='string'||body.password.length>256){send(res,401,{error:'Incorrect owner password.'});return;}
        if(activeLogins>=2){send(res,429,{error:'Sign-in is busy. Please try again shortly.'});return;}
        activeLogins++;let key;
        try{key=await derive(body.password,credentials.salt,64,{N:32768,maxmem:64*1024*1024});}finally{activeLogins--;}
        if(!equal(key.toString('hex'),credentials.hash)){send(res,401,{error:'Incorrect owner password.'});return;}
        attempts.delete(ip);
        for(const [id,entry] of sessions)if(entry.expires<now)sessions.delete(id);
        while(sessions.size>=10)sessions.delete(sessions.keys().next().value);
        const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');
        sessions.set(hash(token),{csrf,expires:now+8*60*60*1000});
        res.setHeader('Set-Cookie','jeff_owner='+token+'; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800'+(origin.startsWith('https:')?'; Secure':''));
        send(res,200,{authenticated:true,configured:true,csrf});return;
      }
      const owner=session(req);
      if(!owner){send(res,401,{error:'Owner sign-in is required.'});return;}
      if(mutating&&!equal(req.headers['x-csrf-token'],owner.csrf)){send(res,403,{error:'Your session needs to be refreshed.'});return;}
      if(req.method==='POST'&&pathname==='/api/logout'){sessions.delete(owner.key);res.setHeader('Set-Cookie','jeff_owner=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0'+(origin.startsWith('https:')?'; Secure':''));send(res,200,{ok:true});return;}
      if(req.method==='PUT'&&['/api/projects','/api/skills'].includes(pathname)) {
        const field=pathname.slice(5),items=await jsonBody(req);
        if(!(field==='projects'?validateProjects(items):validateSkills(items))){send(res,400,{error:'Invalid '+field+' data.'});return;}
        // Serialize writes, rereading current content so one collection cannot erase the other.
        const write=queue.catch(()=>{}).then(async()=>{
          const data=await content();data[field]=items;
          await mkdir(privateDir,{recursive:true});
          const temp=path.join(privateDir,'content-'+randomBytes(8).toString('hex')+'.tmp');
          await writeFile(temp,JSON.stringify(data,null,2),{mode:0o600});
          await rename(temp,path.join(privateDir,'content.json'));return data;
        });
        queue=write;send(res,200,await write);return;
      }
      send(res,404,{error:'Not found.'});
    } catch(error) {
      if(!res.headersSent)send(res,error instanceof SyntaxError?400:500,{error:error instanceof SyntaxError?'Invalid JSON.':'Unable to complete the request. Your changes were not saved.'});
      else res.end();
    }
  };
}
export function localOrigin(req) {
  try {const url=new URL('http://'+req.headers.host);return ['localhost','127.0.0.1','[::1]'].includes(url.hostname)?url.origin:null;}catch{return null;}
}
