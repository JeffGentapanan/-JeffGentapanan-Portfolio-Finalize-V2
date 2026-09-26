import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApi,localOrigin} from './api.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const origin=process.env.PUBLIC_ORIGIN?new URL(process.env.PUBLIC_ORIGIN).origin:null;
if(origin&&!origin.startsWith('https://'))throw new Error('PUBLIC_ORIGIN must use HTTPS for owner authentication.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf'};
const api=createApi({root,originForRequest:origin?()=>origin:localOrigin});
const server=createServer((req,res)=>{
  if(req.url.startsWith('/api/')){void api(req,res);return;}
  void (async()=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
    let file=path.resolve(dist,'.'+pathname);
    if(!file.startsWith(dist+path.sep)&&file!==dist){res.writeHead(403);res.end();return;}
    try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');await stat(file);}
    catch{if(path.extname(pathname)){res.writeHead(404);res.end();return;}file=path.join(dist,'index.html');}
    try{const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600'});res.end(req.method==='HEAD'?undefined:body);}
    catch{res.writeHead(500);res.end('Build the portfolio first with npm run build.');}
  })();
});
const port=Number(process.env.PORT)||4173;
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Portfolio: http://127.0.0.1:'+port));
