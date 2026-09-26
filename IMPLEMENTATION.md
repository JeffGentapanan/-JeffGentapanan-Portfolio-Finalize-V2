# Portfolio — JavaScript implementation

The app uses JavaScript (including JSX), HTML, and CSS. React and Three.js remain in place. JSON files store content.

## File structure

```text
├── .gitignore
├── index.html
├── jsconfig.json
├── package.json
├── public
│   ├── favicon.svg
│   └── portfolio
│       ├── Jeff-Gentapanan-Resume.pdf
│       └── profile.jpg
├── README.md
├── scripts
│   └── update-stack.mjs
├── server
│   ├── api.mjs
│   ├── setup-owner.mjs
│   └── start.mjs
├── SET OWNER PASSWORD.cmd
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── back-to-top.jsx
│   │   ├── home-stack.css
│   │   ├── home-stack.jsx
│   │   ├── navigation.jsx
│   │   ├── opening-page.jsx
│   │   ├── owner
│   │   │   ├── owner-access.jsx
│   │   │   └── owner-provider.jsx
│   │   ├── personal-sections.jsx
│   │   ├── portfolio.jsx
│   │   ├── projects
│   │   │   ├── project-grid.jsx
│   │   │   ├── project-image.jsx
│   │   │   └── project-manager.jsx
│   │   ├── skills
│   │   │   └── skills-section.jsx
│   │   ├── theme-provider.jsx
│   │   ├── theme-toggle.jsx
│   │   ├── three
│   │   │   ├── floating-box.jsx
│   │   │   ├── plasma-background.jsx
│   │   │   └── scene.jsx
│   │   └── ui
│   │       └── modal.jsx
│   ├── data
│   │   ├── project-details.json
│   │   ├── projects.json
│   │   ├── skills.json
│   │   └── stack.json
│   ├── hooks
│   │   ├── use-media-query.js
│   │   └── use-projects.js
│   ├── lib
│   │   ├── api.js
│   │   └── project-store.js
│   ├── main.jsx
│   └── styles
│       ├── global.css
│       ├── owner-refinement.css
│       └── tokens.css
├── START PORTFOLIO.cmd
├── tests
│   ├── owner-api.test.mjs
│   └── project-store.test.js
└── vite.config.js
```

Run `npm run dev`, `npm run build`, or `npm test`. Language percentages are regenerated before development and production builds.

## index.html

```html
<!doctype html><html lang="en"><head><script>try{document.documentElement.dataset.theme=localStorage.getItem("jeff.clear.theme")==="light"?"light":"dark"}catch{document.documentElement.dataset.theme="dark"}</script><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="description" content="Jeff A. Gentapanan — BSIT student at Western Institute of Technology, exploring front-end development and UI/UX design."/><link rel="icon" href="/favicon.svg"/><title>Jeff A. Gentapanan — Design & Development</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
```

## jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "include": [
    "src"
  ]
}

```

## package.json

```json
{
  "name": "jeff-portfolio-clear",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "predev": "node scripts/update-stack.mjs",
    "prebuild": "node scripts/update-stack.mjs",
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "node server/start.mjs",
    "test": "node --test tests/*.test.js tests/*.test.mjs",
    "start": "node server/start.mjs",
    "owner:setup": "node server/setup-owner.mjs"
  },
  "dependencies": {
    "@react-three/fiber": "^9.4.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "three": "^0.180.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "vite": "^8.0.1"
  }
}

```

## scripts/update-stack.mjs

```javascript
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const languages = { '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.css': 'CSS', '.html': 'HTML' };
const totals = {};
async function count(path) {
  const language = languages[extname(path)];
  if (language) totals[language] = (totals[language] || 0) + (await readFile(path)).length;
}
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) await walk(child);
    else await count(child);
  }
}
await walk(join(root, 'src'));
await walk(join(root, 'server'));
await count(join(root, 'index.html'));
await count(join(root, 'vite.config.js'));
const sum = Object.values(totals).reduce((a, b) => a + b, 0);
const rows = Object.entries(totals).map(([name, bytes]) => ({ name, percentage: Math.floor(bytes / sum * 100), remainder: bytes / sum * 100 % 1 }));
// Largest-remainder rounding keeps the displayed percentages at exactly 100%.
let remaining = 100 - rows.reduce((n, row) => n + row.percentage, 0);
for (const row of [...rows].sort((a, b) => b.remainder - a.remainder)) {
  if (remaining-- > 0) row.percentage++;
}
const data = rows.sort((a, b) => b.percentage - a.percentage).map(({ name, percentage }) => ({ name, percentage }));
await writeFile(join(root, 'src/data/stack.json'), JSON.stringify(data, null, 2) + '\n');

```

## server/api.mjs

```javascript
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

```

## server/setup-owner.mjs

```javascript
import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {mkdir,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeCredential} from './api.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let silent=false;
const output=new Writable({write(chunk,encoding,done){if(!silent)process.stdout.write(chunk);done();}});
const input=createInterface({input:process.stdin,output,terminal:true});
try {
  console.log('Set the private password for your portfolio owner login.');
  console.log('Use at least 12 characters. Input is hidden.');
  try {await access(path.join(root,'.private/owner.json'));console.log('This replaces the current owner password. Restart the portfolio server afterward.');}catch{}
  process.stdout.write('New password: ');silent=true;
  const password=await input.question('');silent=false;process.stdout.write('\n');
  process.stdout.write('Confirm password: ');silent=true;
  const confirmation=await input.question('');silent=false;process.stdout.write('\n');
  if(password.length<12||password.length>256||password!==confirmation)throw new Error('Passwords must match and contain 12–256 characters.');
  const credentials=await makeCredential(password);
  await mkdir(path.join(root,'.private'),{recursive:true});
  await writeFile(path.join(root,'.private/owner.json'),JSON.stringify(credentials),{mode:0o600});
  console.log('Owner password saved as a salted hash. Open Projects or Skills and choose Owner sign in.');
}catch(error){console.error(error.message);process.exitCode=1;}finally{input.close();}

```

## server/start.mjs

```javascript
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

```

## src/App.jsx

```jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { OpeningPage } from './components/opening-page';
import { OwnerProvider } from './components/owner/owner-provider';
import { Portfolio } from './components/portfolio';
import { useMediaQuery } from './hooks/use-media-query';
import './styles/tokens.css';
import './styles/global.css';
const Plasma = lazy(() => import('./components/three/plasma-background'));

function Experience() {
  const [phase, setPhase] = useState('opening');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    if (phase !== 'entering') return;
    const timer = setTimeout(() => setPhase('portfolio'), reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    const id = phase === 'portfolio' ? 'main' : phase === 'opening' ? 'get-started' : null;
    if (id) document.getElementById(id)?.focus({ preventScroll: true });
  }, [phase]);

  return <div className="experience">
    <Suspense fallback={null}><Plasma opacity={0.36}/></Suspense>
    {phase !== 'portfolio' && <OpeningPage leaving={phase === 'entering'} onEnter={() => setPhase('entering')}/>}
    {phase !== 'opening' && <div className="main-reveal" inert={phase === 'entering'}><Portfolio/></div>}
  </div>;
}
export default function App() { return <ThemeProvider><OwnerProvider><Experience/></OwnerProvider></ThemeProvider>; }

import './styles/owner-refinement.css';

```

## src/components/back-to-top.jsx

```jsx
import { createPortal } from 'react-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
/** Scrolls the current page only. It never changes views or reopens the intro. */
export function BackToTop() {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    return createPortal(<button className="back-to-top" onClick={() => { window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' }); document.getElementById('main')?.focus({ preventScroll: true }); }} aria-label="Back to top" title="Back to top"><span aria-hidden="true">↑</span></button>, document.body);
}

```

## src/components/home-stack.css

```css
.home-stack{margin-top:80px;padding-top:56px;border-top:1px solid var(--line)}
.stack-intro{max-width:680px;margin-bottom:40px}
.stack-intro h2{font-size:clamp(32px,4vw,60px);margin:14px 0 20px;line-height:1.1}
.stack-intro>p:last-child{color:var(--muted);font-size:18px;line-height:1.7}
.stack-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(32px,7vw,100px)}
.stack-layout h3{font-size:19px;line-height:1.4;font-weight:650}
.language-list,.stack-tools ul{list-style:none;padding:0;margin:24px 0 0}
.language-list li{margin-bottom:23px}
.language-label{display:flex;justify-content:space-between;gap:20px;margin-bottom:10px;font-size:16px}
.language-label strong{font-variant-numeric:tabular-nums;font-weight:600}
.language-track{height:4px;background:color-mix(in srgb,var(--foreground) 16%,transparent)}
.language-track span{display:block;height:100%;background:var(--foreground)}
.stack-note{font-size:13px;color:var(--muted);line-height:1.7;max-width:420px}
.stack-tools{display:grid;align-content:start;gap:32px}
.stack-tools ul{display:flex;flex-wrap:wrap;gap:12px 24px;margin-top:16px}
.stack-tools li{font-size:17px;line-height:1.6;color:var(--muted)}
@media(max-width:650px){.home-stack{margin-top:56px;padding-top:36px}.stack-layout{grid-template-columns:1fr;gap:36px}.stack-intro{margin-bottom:30px}}

```

## src/components/home-stack.jsx

```jsx
import languages from '@/data/stack.json';
import './home-stack.css';
const groups = [
    { title: 'Frameworks & libraries', items: ['React', 'Three.js', 'React Three Fiber'] },
    { title: 'Tools & runtime', items: ['Vite', 'Node.js', 'npm'] },
];
/** Source composition is generated before dev/build; it is not a skill rating. */
export function HomeStack() {
    return <section className="home-stack" aria-labelledby="stack-title">
    <div className="stack-intro">
      <p className="eyebrow">Behind this portfolio</p>
      <h2 id="stack-title">Languages & tools.</h2>
      <p>The code, libraries, and tools that bring this website to life.</p>
    </div>
    <div className="stack-layout">
      <div>
        <h3>Languages</h3>
        <ul className="language-list">{languages.map(language => <li key={language.name}>
          <div className="language-label"><span>{language.name}</span><strong>{language.percentage}%</strong></div>
          <div className="language-track" aria-hidden="true"><span style={{ width: `${language.percentage}%` }}/></div>
        </li>)}</ul>
        <p className="stack-note">Share of this site’s source code by file size. Excludes dependencies, assets, and generated files.</p>
      </div>
      <div className="stack-tools">{groups.map(group => <div key={group.title}>
        <h3>{group.title}</h3>
        <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
      </div>)}</div>
    </div>
  </section>;
}

```

## src/components/navigation.jsx

```jsx
import { ThemeToggle } from './theme-toggle';
const links = [
    { view: 'index', label: 'Home', hash: 'home' }, { view: 'studio', label: 'About', hash: 'about' },
    { view: 'work', label: 'Projects', hash: 'projects' }, { view: 'skills', label: 'Skills', hash: 'skills' },
    { view: 'resume', label: 'Resume', hash: 'resume' }, { view: 'contact', label: 'Contact', hash: 'contact' }
];
export function Navigation({ view, onChange }) {
    return <header className="header"><a className="wordmark" href="#home" onClick={() => onChange('index')}>JEFF.DEV</a>
    <nav aria-label="Primary navigation">{links.map(link => <a key={link.view} href={'#' + link.hash} aria-current={view === link.view ? 'page' : undefined} onClick={() => onChange(link.view)}>{link.label}</a>)}</nav>
    <ThemeToggle />
  </header>;
}

```

## src/components/opening-page.jsx

```jsx
import { ThemeToggle } from './theme-toggle';
export function OpeningPage({ leaving, onEnter }) {
    return <section className={'opening-page' + (leaving ? ' leaving' : '')} aria-labelledby="intro-title">
    <div className="opening-top"><span className="wordmark">JEFF.DEV</span><ThemeToggle /></div>
    <div className="opening-copy"><p className="eyebrow">Jeff A. Gentapanan</p>
      <h1 id="intro-title">Ideas into form.<br /><em>Code into feeling.</em></h1>
      <p className="intro-description">A student of design. A builder of digital experiences.<br />Always curious about what comes next.</p>
      <button id="get-started" className="button solid get-started" disabled={leaving} onClick={onEnter}>Get Started</button>
    </div>
    <p className="opening-bottom">Front-end development & UI/UX design</p>
  </section>;
}

```

## src/components/owner/owner-access.jsx

```jsx
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useOwner } from './owner-provider';
export function OwnerAccess({ label, onEdit }) {
    const owner = useOwner();
    const [open, setOpen] = useState(false), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    return <div className="owner-controls">
    {owner.authenticated ? <><button className="text-button" onClick={onEdit}>{label}</button><button className="text-button" onClick={async () => { try {
        await owner.logout();
    }
    catch (error) {
        setError(error.message);
    } }}>Sign out</button></> : <button className="text-button" onClick={() => { setError(''); setOpen(true); }}>Owner sign in</button>}
    {error && !open && <p role="alert">{error}</p>}
    {open && <Modal title="Owner sign in" onClose={() => { setOpen(false); setPassword(''); }}>
      <p className="muted">Only the owner can publish changes to projects and skills.</p>
      {!owner.configured && <p className="setup-hint">First time? Run <strong>SET OWNER PASSWORD.cmd</strong> in the portfolio folder to choose your password.</p>}
      <form onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(''); try {
            await owner.login(password);
            setPassword('');
            setOpen(false);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setBusy(false);
        } }}>
        <label>Owner password<input autoFocus name="password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)}/></label>
        {error && <p role="alert">{error}</p>}<button className="button solid" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Modal>}
  </div>;
}

```

## src/components/owner/owner-provider.jsx

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { api, jsonRequest } from '@/lib/api';
const empty = { authenticated: false, configured: false, csrf: '' };
const Context = createContext(null);
export function OwnerProvider({ children }) {
    const [session, setSession] = useState(empty);
    useEffect(() => { let active = true; api('/api/session').then(value => { if (active)
        setSession(value); }).catch(() => { }); return () => { active = false; }; }, []);
    async function login(password) { setSession(await api('/api/login', jsonRequest('POST', { password }))); }
    async function logout() { await api('/api/logout', jsonRequest('POST', {}, session.csrf)); setSession({ ...empty, configured: true }); }
    return <Context.Provider value={{ ...session, login, logout }}>{children}</Context.Provider>;
}
export function useOwner() { const owner = useContext(Context); if (!owner)
    throw new Error('OwnerProvider is required.'); return owner; }

```

## src/components/personal-sections.jsx

```jsx
import { SkillsSection } from './skills/skills-section';
export function PersonalSections({ view }) {
    if (view === 'studio')
        return <section className="personal-section about-section" aria-labelledby="about-title"><div><p className="eyebrow">A little about me</p><h2 id="about-title">Curious by nature.<br /><em>Creative by practice.</em></h2><p className="personal-lead">I’m Jeff A. Gentapanan, a BSIT student at Western Institute of Technology, learning front-end development and UI/UX design.</p><p className="muted personal-copy">I’m still pretty new to the world of front-end development and design, but I’m enjoying the process of exploring how it all works. I’m always looking for new things to learn and ways to expand what I know.</p><a className="button solid" href="#projects">Explore my projects ↗</a></div><figure className="portrait"><img src="/portfolio/profile.jpg" alt="Jeff A. Gentapanan" width="600" height="700" loading="lazy"/><figcaption><span>Jeff A. Gentapanan</span><span>Designing. Building. Learning.</span></figcaption></figure></section>;
    if (view === 'skills')
        return <SkillsSection />;
    if (view === 'resume')
        return <section className="personal-section" aria-labelledby="resume-title"><p className="eyebrow">Background</p><h2 id="resume-title">A little context.<br /><em>The next chapter.</em></h2><dl className="resume-details">{[['Name', 'Jeff A. Gentapanan'], ['Address', 'Igcocolo, Guimbal, Iloilo'], ['Education', 'BSIT — Western Institute of Technology'], ['Birthday', 'May 25, 2004']].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="resume-actions"><a className="button solid" href="https://drive.google.com/file/d/1zBMBMWVx96HQH1sKYThS32GJTFgdBkIW/view?usp=sharing" target="_blank" rel="noopener noreferrer">View résumé ↗</a><a className="button" href="/portfolio/Jeff-Gentapanan-Resume.pdf" download="Jeff-Gentapanan-Resume.pdf">Download PDF ↓</a></div></section>;
    return <section className="personal-section" aria-labelledby="contact-title"><p className="eyebrow">Start a conversation</p><h2 id="contact-title">Have something<br /><em>in mind?</em></h2><div className="contact-columns"><div><p className="personal-lead">I’m open to new opportunities and collaborations. Let’s talk.</p><a className="contact-email" href="mailto:jeff.gentapanan2004525@gmail.com">jeff.gentapanan2004525@gmail.com ↗</a><a className="contact-phone" href="tel:+639944935058">09944935058</a><p className="muted">Philippines</p><a className="text-button" href="https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/" target="_blank" rel="noopener noreferrer">LinkedIn profile ↗</a></div><form className="jeff-contact-form" action="https://formsubmit.co/jeff.gentapanan2004525@gmail.com" method="POST"><label htmlFor="contact-name">Name<input id="contact-name" name="name" autoComplete="name" required maxLength={100}/></label><label htmlFor="contact-email">Email<input id="contact-email" type="email" name="email" autoComplete="email" required maxLength={254}/></label><label htmlFor="contact-message">Message<textarea id="contact-message" name="message" rows={5} required maxLength={5000}/></label><p className="muted">Your message is sent to Jeff through FormSubmit.</p><button className="button solid" type="submit">Send message ↗</button></form></div></section>;
}

```

## src/components/portfolio.jsx

```jsx
'use client';
import { lazy, Suspense, useEffect, useState } from 'react';
import { OwnerAccess } from './owner/owner-access';
import { useOwner } from './owner/owner-provider';
import { BackToTop } from './back-to-top';
import { Navigation } from './navigation';
import { ProjectGrid } from './projects/project-grid';
import { ProjectManager } from './projects/project-manager';
import { PersonalSections } from './personal-sections';
import { HomeStack } from './home-stack';
import { useProjects } from '@/hooks/use-projects';
const Scene = lazy(() => import('./three/scene'));
const routes = { home: 'index', index: 'index', projects: 'work', work: 'work', about: 'studio', studio: 'studio', skills: 'skills', resume: 'resume', contact: 'contact' };
const titles = { index: ['Learning to build.', 'Designing to feel.'], work: ['Selected work.', 'Ideas in motion.'], studio: ['Hello, I’m Jeff.', 'Always exploring.'], skills: ['The toolkit.', 'Always evolving.'], resume: ['My background.', 'What comes next.'], contact: ['Let’s connect.', 'Make it happen.'] };
export function Portfolio() {
    const owner = useOwner();
    const [view, setView] = useState(() => routes[window.location.hash.slice(1)] || 'index');
    const [manager, setManager] = useState(false);
    const store = useProjects();
    useEffect(() => { const sync = () => { const hash = location.hash.slice(1); if (routes[hash]) {
        setView(routes[hash]);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    else if (!hash)
        setView('index'); }; window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
    useEffect(() => { document.title = 'Jeff A. Gentapanan — ' + (view === 'index' ? 'Design & Development' : view === 'studio' ? 'About' : view === 'work' ? 'Projects' : view[0].toUpperCase() + view.slice(1)); }, [view]);
    function change(next) { setManager(false); setView(next); window.scrollTo({ top: 0, behavior: 'instant' }); }
    return <div className="portfolio jeff-portfolio" data-view={view}><a className="skip-link" href="#main">Skip to content</a><Navigation view={view} onChange={change}/>
    <main id="main" tabIndex={-1}><section className="hero" aria-labelledby="hero-title"><div className="hero-title" key={view}><p className="eyebrow">Jeff A. Gentapanan</p><h1 id="hero-title">{titles[view][0]}<br /><em>{titles[view][1]}</em></h1></div><Suspense fallback={<div className="scene scene-loading" aria-label="Loading interactive sculpture">◇</div>}><Scene view={view}/></Suspense>
    <div className="hero-foot"><p>I’m a 2nd-year IT student building my skills in front-end development and design, one thoughtful project at a time.</p></div></section>
    <div className="view-body" key={view} id="section-content">{view === 'index' || view === 'work' ? <section className="work-section" id="selected-work" aria-labelledby="work-title"><div className="section-heading"><div><p className="eyebrow">Selected projects / Design & code</p><h2 id="work-title">Ideas, given form</h2></div>{view === 'work' && <OwnerAccess label="Edit projects" onEdit={() => setManager(true)}/>}</div><ProjectGrid projects={store.projects}/>{view === 'index' && <HomeStack />}{view === 'index' && <div className="home-about-link"><p>Curiosity, a little code,<br /><em>and a lot of possibility.</em></p><a className="button" href="#about">Meet the person behind the work ↗</a></div>}</section> : <PersonalSections view={view}/>}</div>{store.error && !manager && <p role="status" className="storage-note">{store.error}</p>}</main>
    <footer><span>© {new Date().getFullYear()} · Designed & built by Jeff A. Gentapanan.</span><div className="footer-socials"><a href="https://github.com/JeffGentapanan" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://www.facebook.com/share/182aXsGi6r/" target="_blank" rel="noopener noreferrer">Facebook ↗</a><a href="https://github.com/JeffGentapanan/MY-PORTFOLIO-JEFFGENTAPANAN-BSIT2-SECTION1.git" target="_blank" rel="noopener noreferrer">Source ↗</a></div></footer>
    <BackToTop />{manager && view === 'work' && owner.authenticated && <ProjectManager {...store} onClose={() => setManager(false)}/>}</div>;
}

```

## src/components/projects/project-grid.jsx

```jsx
'use client';
import details from '@/data/project-details.json';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ProjectImage } from './project-image';
export function ProjectGrid({ projects }) {
    const [selected, setSelected] = useState(null);
    const detail = selected ? details[selected.id] : undefined;
    return <>
    <div className="project-grid">{projects.length ? projects.map((project, index) => <article className="project-card" key={project.id}>
      <button className="project-preview" onClick={() => setSelected(project)} aria-label={`Preview ${project.title}`}><ProjectImage key={project.thumbnail} src={project.thumbnail} title={project.title} index={index}/><span className="preview-label">Explore project ↗</span></button>
      <div className="project-info"><div><p className="eyebrow">{project.category}</p><h3><button onClick={() => setSelected(project)}>{project.title}</button></h3></div><a className="external" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title} in a new tab`}>↗</a></div>
    </article>) : <p className="empty-state">A blank canvas. Open the project editor to add your first project.</p>}</div>
    {selected && <Modal title={selected.title} onClose={() => setSelected(null)}><ProjectImage key={selected.thumbnail} src={selected.thumbnail} title={selected.title} index={projects.findIndex(p => p.id === selected.id)}/><p className="eyebrow">{selected.category}</p><p className="modal-description">{selected.tagline}</p>{detail && <><ul className="stack-tags">{detail.stack.map(tag => <li key={tag}>{tag}</li>)}</ul>{detail.github && <a className="button" href={detail.github} target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a>}</>}<a className="button solid" href={selected.url} target="_blank" rel="noopener noreferrer">Visit project ↗</a></Modal>}
  </>;
}

```

## src/components/projects/project-image.jsx

```jsx
'use client';
import { useState } from 'react';
export function ProjectImage({ src, title, index }) {
    const [failed, setFailed] = useState(false);
    return <div className={`project-image image-${index % 3}`}>
    {src && !failed ? <img src={src} alt={title} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/> : <div className="typographic-preview" aria-label={`${title} typographic preview`}><strong>{title.slice(0, 1)}</strong><span>{title}</span></div>}
  </div>;
}

```

## src/components/projects/project-manager.jsx

```jsx
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
const blank = { title: '', url: '', category: '', tagline: '', thumbnail: '' };
export function ProjectManager({ projects, ready, error, save, remove, onClose }) {
    const [form, setForm] = useState(blank);
    const [editing, setEditing] = useState();
    const [deleting, setDeleting] = useState();
    const [notice, setNotice] = useState('');
    function reset() { setForm(blank); setEditing(undefined); }
    return <Modal title="Manage projects" onClose={onClose}>
    <p className="muted">Only your signed-in owner session can save changes.</p>
    <div className="manager-list">{projects.map(project => <div key={project.id} className="manager-row"><strong>{project.title}</strong>
      <button disabled={!ready} onClick={() => { setEditing(project.id); setForm({ title: project.title, url: project.url, category: project.category, tagline: project.tagline, thumbnail: project.thumbnail }); setNotice(''); }}>Edit</button>
      <button disabled={!ready} onClick={() => setDeleting(project.id)}>Delete</button>
      {deleting === project.id && <div className="delete-confirm"><p>Delete “{project.title}”?</p><button className="button solid" disabled={!ready} onClick={async () => { if (await remove(project.id)) {
            setDeleting(undefined);
            if (editing === project.id)
                reset();
            setNotice('Project deleted.');
        } }}>Confirm delete</button><button onClick={() => setDeleting(undefined)}>Cancel</button></div>}
    </div>)}</div>
    <form onSubmit={async (event) => { event.preventDefault(); if (await save(form, editing)) {
        setNotice(editing ? 'Project updated.' : 'Project added.');
        reset();
    } }}>
      <div className="form-heading"><h3>{editing ? 'Edit project' : 'Add project'}</h3>{editing && <button type="button" onClick={reset}>Cancel edit</button>}</div>
      <label>Title<input name="title" required maxLength={80} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label>
      <label>Link URL<input name="url" type="url" placeholder="https://" required maxLength={2048} value={form.url} onChange={event => setForm({ ...form, url: event.target.value })}/></label>
      <label>Category<input name="category" required maxLength={60} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}/></label>
      <label>Preview thumbnail URL <span className="optional">(optional)</span><input name="thumbnail" placeholder="https:// or /portfolio/image.png" maxLength={2048} value={form.thumbnail} onChange={event => setForm({ ...form, thumbnail: event.target.value })}/></label>
      <label>Description <span className="optional">(optional)</span><textarea name="tagline" rows={3} maxLength={2000} value={form.tagline} onChange={event => setForm({ ...form, tagline: event.target.value })}/></label>
      {error && <p role="alert" className="form-error">{error}</p>}<p role="status">{notice}</p>
      <button disabled={!ready} type="submit" className="button solid">{editing ? 'Save changes' : 'Add project'}</button>
    </form>
  </Modal>;
}

```

## src/components/skills/skills-section.jsx

```jsx
import { useEffect, useState } from 'react';
import seed from '@/data/skills.json';
import { api, jsonRequest } from '@/lib/api';
import { OwnerAccess } from '@/components/owner/owner-access';
import { useOwner } from '@/components/owner/owner-provider';
import { Modal } from '@/components/ui/modal';
export function SkillsSection() {
    const [groups, setGroups] = useState(seed), [editing, setEditing] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const [id, setId] = useState(), [title, setTitle] = useState(''), [items, setItems] = useState(''), [deleting, setDeleting] = useState(), [notice, setNotice] = useState('');
    const owner = useOwner();
    useEffect(() => { let active = true; api('/api/content').then(data => { if (active)
        setGroups(data.skills); }).catch(() => { if (active)
        setError('Live skills are unavailable. Showing the bundled skills.'); }); return () => { active = false; }; }, []);
    async function commit(next) {
        setBusy(true);
        setError('');
        try {
            const data = await api('/api/skills', jsonRequest('PUT', next, owner.csrf));
            setGroups(data.skills);
            return true;
        }
        catch (error) {
            setError(error.message);
            return false;
        }
        finally {
            setBusy(false);
        }
    }
    function reset() { setId(undefined); setTitle(''); setItems(''); }
    return <section className="personal-section" aria-labelledby="skills-title">
    <div className="section-heading"><div><p className="eyebrow">My toolkit</p><h2 id="skills-title">Skills in progress.<br /><em>Possibilities ahead.</em></h2></div><OwnerAccess label="Edit skills" onEdit={() => setEditing(true)}/></div>
    <p className="personal-lead">The languages, libraries, and tools I’m exploring as I develop my practice.</p>
    <div className="skill-columns">{groups.map(group => <article key={group.id}><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
    {!groups.length && <p>No skills added yet.</p>}
    {error && !editing && <p role="status">{error}</p>}
    {editing && owner.authenticated && <Modal title="Edit skills" onClose={() => setEditing(false)}>
      <p className="muted">Organize your skills into categories. Changes are saved to your portfolio.</p>
      <div className="manager-list">{groups.map(group => <div className="manager-row" key={group.id}><strong>{group.title}</strong><button disabled={busy} onClick={() => { setId(group.id); setTitle(group.title); setItems(group.items.join('\n')); setNotice(''); }}>Edit</button><button disabled={busy} onClick={() => setDeleting(group.id)}>Delete</button>
        {deleting === group.id && <div className="delete-confirm"><p>Delete “{group.title}” and its skills?</p><button className="button solid" disabled={busy} onClick={async () => { if (await commit(groups.filter(item => item.id !== group.id))) {
                setDeleting(undefined);
                if (id === group.id)
                    reset();
                setNotice('Category deleted.');
            } }}>Confirm delete</button><button onClick={() => setDeleting(undefined)}>Cancel</button></div>}
      </div>)}</div>
      <form onSubmit={async (event) => { event.preventDefault(); const list = [...new Set(items.split('\n').map(item => item.trim()).filter(Boolean))]; if (list.length > 50 || list.some(item => item.length > 80)) {
            setError('Use up to 50 skills per category, each under 81 characters.');
            return;
        } if (!title.trim()) {
            setError('Enter a category name.');
            return;
        } if (!id && groups.length >= 20) {
            setError('Use up to 20 categories.');
            return;
        } const group = { id: id || crypto.randomUUID(), title: title.trim(), items: list }; if (await commit(id ? groups.map(item => item.id === id ? group : item) : [...groups, group])) {
            reset();
            setNotice('Skills saved.');
        } }}>
        <div className="form-heading"><h3>{id ? 'Edit category' : 'Add category'}</h3>{id && <button type="button" onClick={reset}>Cancel edit</button>}</div>
        <label>Category name<input required maxLength={80} value={title} onChange={event => setTitle(event.target.value)}/></label>
        <label>Skills — one per line<textarea rows={6} value={items} onChange={event => setItems(event.target.value)}/></label>
        {error && <p role="alert">{error}</p>}<p role="status">{notice}</p><button className="button solid" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save skills'}</button>
      </form>
    </Modal>}
  </section>;
}

```

## src/components/theme-provider.jsx

```jsx
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
const ThemeContext = createContext(null);
const key = 'jeff.clear.theme';
/** Reads the pre-paint theme set in index.html; storage failure never blocks rendering. */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem(key, theme);
        }
        catch { /* The selected theme still works without persistence. */ }
    }, [theme]);
    useEffect(() => {
        const sync = (event) => { if (event.key === key && (event.newValue === 'light' || event.newValue === 'dark'))
            setTheme(event.newValue); };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);
    return <ThemeContext.Provider value={{ resolvedTheme: theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const value = useContext(ThemeContext); if (!value)
    throw new Error('ThemeProvider is required.'); return value; }

```

## src/components/theme-toggle.jsx

```jsx
import { useTheme } from '@/components/theme-provider';
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    return <button className="theme-toggle" onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}><span aria-hidden="true">{resolvedTheme === 'light' ? '☼' : '☾'}</span> Theme: {resolvedTheme === 'light' ? 'Light' : 'Dark'}</button>;
}

```

## src/components/three/floating-box.jsx

```jsx
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
/** One theme-aware material; real lighting and beveled edges provide the face shading. */
export function FloatingBox({ view, dark, reduced, interaction }) {
    const group = useRef(null);
    const materials = useRef([]);
    const { camera } = useThree();
    const geometry = useMemo(() => new RoundedBoxGeometry(1.8, 1.8, 1.8, 4, .085), []);
    const target = useMemo(() => new THREE.Vector3(), []), color = useMemo(() => new THREE.Color(), []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    const palette = Array(6).fill(dark ? '#ffffff' : '#080808');
    useFrame((state, delta) => {
        if (!group.current)
            return;
        const t = reduced ? 0 : state.clock.elapsedTime, ease = reduced ? 1 : 1 - Math.exp(-5 * Math.min(delta, .05)), p = interaction.current;
        target.set(0, Math.sin(t * .7) * .085, 0);
        group.current.position.lerp(target, ease);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, .38 + p.dragY + (reduced ? 0 : p.y * .10 + Math.sin(t * .24) * .035), ease);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -.56 + p.dragX + (reduced ? 0 : p.x * .14 + Math.sin(t * .18) * .12) + (view === 'work' ? .10 : 0), ease);
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, view === 'studio' ? -.07 : .035, ease);
        materials.current.forEach((material, index) => { if (material) {
            color.set(palette[index]);
            material.color.lerp(color, ease);
        } });
        target.set(0, .12, 6.8);
        camera.position.lerp(target, ease);
        camera.lookAt(0, -.1, 0);
    });
    return <>
    <group ref={group} rotation={[.38, -.56, .035]}>
      <mesh castShadow receiveShadow geometry={geometry}>
        {palette.map((_, index) => <meshPhysicalMaterial key={index} ref={material => { materials.current[index] = material; }} attach={'material-' + index} roughness={.38} metalness={.08} clearcoat={.3} clearcoatRoughness={.3}/>)}
      </mesh>
    </group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}><planeGeometry args={[8, 8]}/><shadowMaterial transparent opacity={dark ? .55 : .32}/></mesh>
  </>;
}

```

## src/components/three/plasma-background.jsx

```jsx
import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
const vertex = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }
`;
const fragment = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uOpacity;
uniform float uLight;
void main() {
  vec2 p = (vUv - .5) * vec2(uAspect, 1.);
  float t = uTime * .18;
  float field = sin(p.x * 3.5 + t + sin(p.y * 4. - t));
  field += sin(p.y * 4.8 - t * .7 + cos(p.x * 3. + t));
  field += .5 * sin(length(p) * 8. - t);
  float bands = pow(.5 + .5 * sin(field * 2.2), 3.);
  // Quiet center protects the cube; fade at the edges avoids a hard canvas boundary.
  float centerMask = mix(.15, 1., smoothstep(.1, .6, length(vUv - .5)));
  float edgeMask = .75 + .25 * sin(vUv.y * 3.14159);
  float alpha = bands * centerMask * edgeMask * uOpacity;
  // Composite in the shader instead of relying on browser/GPU canvas alpha.
  vec3 base = vec3(uLight);
  vec3 plasma = vec3(1. - uLight);
  gl_FragColor = vec4(mix(base, plasma, alpha), 1.);
}
`;
/** Decorative only: low-resolution, capped at 30fps, never intercepts input. */
export default function PlasmaBackground({ opacity = .36 }) {
    const canvasRef = useRef(null);
    const { resolvedTheme } = useTheme();
    const themeTarget = useRef(resolvedTheme === 'light' ? 1 : 0);
    const redraw = useRef(null);
    useEffect(() => {
        themeTarget.current = resolvedTheme === 'light' ? 1 : 0;
        redraw.current?.();
    }, [resolvedTheme]);
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
        if (!gl)
            return; // Solid theme background is the graceful fallback.
        const compile = (type, source) => {
            const shader = gl.createShader(type);
            if (!shader)
                return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };
        const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
        if (!vs || !fs) {
            if (vs)
                gl.deleteShader(vs);
            if (fs)
                gl.deleteShader(fs);
            return;
        }
        const program = gl.createProgram();
        if (!program) {
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return;
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return;
        }
        const buffer = gl.createBuffer();
        if (!buffer) {
            gl.deleteProgram(program);
            return;
        }
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const time = gl.getUniformLocation(program, 'uTime');
        const aspect = gl.getUniformLocation(program, 'uAspect');
        const lightUniform = gl.getUniformLocation(program, 'uLight');
        const opacityUniform = gl.getUniformLocation(program, 'uOpacity');
        let light = themeTarget.current;
        let frame = 0, last = 0, visible = true, lost = false;
        const start = performance.now();
        const draw = (now) => {
            if (lost)
                return;
            light = reduced ? themeTarget.current : light + (themeTarget.current - light) * .2;
            gl.uniform1f(lightUniform, light);
            // Keep white text readable even at the brightest point of the plasma.
            gl.uniform1f(opacityUniform, Math.min(.4, Math.max(0, opacity)) * (.42 + light * .13));
            gl.uniform1f(time, reduced ? 0 : (now - start) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        redraw.current = () => draw(performance.now());
        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            // Half CSS resolution, independent of high-DPI screens.
            canvas.width = Math.max(1, Math.round(bounds.width * .5));
            canvas.height = Math.max(1, Math.round(bounds.height * .5));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(aspect, canvas.width / canvas.height);
            draw(performance.now());
        };
        const tick = (now) => {
            if (!visible || document.hidden || lost || reduced) {
                frame = 0;
                return;
            }
            if (now - last >= 1000 / 30) {
                draw(now);
                last = now;
            }
            frame = requestAnimationFrame(tick);
        };
        const resume = () => { if (!frame && visible && !document.hidden && !reduced && !lost)
            frame = requestAnimationFrame(tick); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
        const size = new ResizeObserver(resize);
        const onLost = () => { lost = true; cancelAnimationFrame(frame); };
        observer.observe(canvas);
        size.observe(canvas);
        resize();
        resume();
        document.addEventListener('visibilitychange', resume);
        canvas.addEventListener('webglcontextlost', onLost);
        return () => {
            redraw.current = null;
            cancelAnimationFrame(frame);
            observer.disconnect();
            size.disconnect();
            document.removeEventListener('visibilitychange', resume);
            canvas.removeEventListener('webglcontextlost', onLost);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, [reduced, opacity]);
    return <canvas ref={canvasRef} className="plasma-background" aria-hidden="true"/>;
}

```

## src/components/three/scene.jsx

```jsx
'use client';
import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FloatingBox } from './floating-box';
function Fallback() { return <div className="scene-fallback"><span>◇</span><p>JEFF / DEV</p></div>; }
class SceneBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? <Fallback /> : this.props.children; }
}
export default function Scene({ view }) {
    const { resolvedTheme } = useTheme();
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const interaction = useRef({ x: 0, y: 0, dragX: 0, dragY: 0 });
    const drag = useRef(null);
    const host = useRef(null);
    const [active, setActive] = useState(true);
    const [lost, setLost] = useState(false);
    useEffect(() => {
        let intersecting = true;
        const update = () => setActive(intersecting && !document.hidden);
        const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; update(); });
        if (host.current)
            observer.observe(host.current);
        document.addEventListener('visibilitychange', update);
        return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
    }, []);
    return <div ref={host} className="scene" tabIndex={0} role="group" aria-label="Interactive floating cube. Drag to rotate, use arrow keys, or press R to reset." onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        interaction.current.dragX += e.key === 'ArrowLeft' ? -0.2 : e.key === 'ArrowRight' ? 0.2 : 0;
        interaction.current.dragY += e.key === 'ArrowUp' ? -0.2 : e.key === 'ArrowDown' ? 0.2 : 0;
    } if (e.key.toLowerCase() === 'r') {
        interaction.current.dragX = 0;
        interaction.current.dragY = 0;
    } }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY }; }} onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); interaction.current.x = (e.clientX - r.left) / r.width * 2 - 1; interaction.current.y = (e.clientY - r.top) / r.height * 2 - 1; if (drag.current) {
        interaction.current.dragX += (e.clientX - drag.current.x) * 0.006;
        interaction.current.dragY += (e.clientY - drag.current.y) * 0.006;
        drag.current = { x: e.clientX, y: e.clientY };
    } }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} onPointerLeave={() => { interaction.current.x = 0; interaction.current.y = 0; }}>
    <SceneBoundary>{lost ? <Fallback /> : <Canvas shadows camera={{ position: [0, .12, 6.8], fov: 36 }} dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={<Fallback />} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', () => setLost(true), { once: true }); }}>
      <ambientLight intensity={0.45}/><directionalLight castShadow position={[-3, 5, 4]} intensity={3.4} shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-normalBias={0.025} shadow-bias={-0.0001} shadow-radius={5}/><directionalLight position={[4, 2, -3]} intensity={2.2}/><pointLight position={[1, -1, 4]} intensity={8}/>
      <FloatingBox view={view} dark={resolvedTheme !== 'light'} reduced={reduced} interaction={interaction}/>
    </Canvas>}</SceneBoundary>
  </div>;
}

```

## src/components/ui/modal.jsx

```jsx
'use client';
import { useEffect, useId, useRef } from 'react';
/** Native dialog provides focus containment, Escape, and an inert background. */
export function Modal({ title, onClose, children }) {
    const ref = useRef(null);
    const heading = useId();
    useEffect(() => {
        const dialog = ref.current;
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
    }, []);
    return <dialog ref={ref} className="modal" aria-labelledby={heading} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) {
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            onClose();
    } }}>
    <div className="modal-heading"><h2 id={heading}>{title}</h2><button onClick={onClose} className="icon-button" aria-label="Close dialog">×</button></div>
    {children}
  </dialog>;
}

```

## src/data/project-details.json

```json
{
  "awesome-todos": {
    "description": "A full-stack task management application with a decoupled client-server architecture. Features a clean user interface and persistent data storage.",
    "github": "https://github.com/JeffGentapanan/awesometodosapp.git",
    "stack": [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "JavaScript",
      "HTML/CSS"
    ]
  },
  "letsgo": {
    "description": "A travel planning application that helps users discover and organize their dream destinations. Features a visually appealing interface and seamless integration with travel APIs.",
    "github": "",
    "stack": [
      "UI/UX Design",
      "Figma",
      "Interaction Design",
      "Travel Tech",
      "Mobile Design",
      "User Experience",
      "Visual Design",
      "App Design",
      "Travel Planning"
    ]
  }
}
```

## src/data/projects.json

```json
[
  {
    "id": "awesome-todos",
    "title": "Awesome Todo’s App",
    "url": "https://awesometodosapp-otag.onrender.com",
    "category": "Full-stack development",
    "tagline": "A task management application with a clean interface, persistent storage, and a decoupled client-server architecture.",
    "thumbnail": "/portfolio/todos-preview.png"
  },
  {
    "id": "letsgo",
    "title": "LetsGo",
    "url": "https://www.figma.com/design/BZBrT1mz1qnNmV2bs9eoQO/Let-s-GO?node-id=243-640&t=evY3oR7YkhxSBHMz-1",
    "category": "UI/UX design",
    "tagline": "A travel planning design that helps people discover and organize their dream destinations.",
    "thumbnail": "/portfolio/letsgo-preview.png"
  }
]
```

## src/data/skills.json

```json
[
  {
    "id": "languages",
    "title": "Languages & stack",
    "items": [
      "JavaScript",
      "CSS",
      "HTML5",
      "MERN Stack",
      "JSX"
    ]
  },
  {
    "id": "libraries",
    "title": "Libraries & services",
    "items": [
      "React",
      "Font Awesome",
      "Google Fonts",
      "FormSubmit API",
      "Reactbits"
    ]
  },
  {
    "id": "tools",
    "title": "Tools",
    "items": [
      "Vite",
      "Git & GitHub",
      "Figma"
    ]
  }
]
```

## src/data/stack.json

```json
[
  {
    "name": "JavaScript",
    "percentage": 75
  },
  {
    "name": "CSS",
    "percentage": 24
  },
  {
    "name": "HTML",
    "percentage": 1
  }
]

```

## src/hooks/use-media-query.js

```js
'use client';
import { useEffect, useState } from 'react';
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, [query]);
    return matches;
}

```

## src/hooks/use-projects.js

```js
import { useEffect, useState } from 'react';
import seed from '@/data/projects.json';
import { MAX_PROJECTS, validateProject } from '@/lib/project-store';
import { api, jsonRequest } from '@/lib/api';
import { useOwner } from '@/components/owner/owner-provider';
export function useProjects() {
    const [projects, setProjects] = useState(seed), [ready, setReady] = useState(false), [error, setError] = useState('');
    const { csrf } = useOwner();
    useEffect(() => { let active = true; api('/api/content').then(data => { if (active) {
        setProjects(data.projects);
        setReady(true);
    } }).catch(() => { if (active)
        setError('Live content is unavailable. Showing the bundled portfolio.'); }); return () => { active = false; }; }, []);
    async function commit(next) {
        if (!csrf) {
            setError('Owner sign-in is required.');
            return false;
        }
        setReady(false);
        try {
            const data = await api('/api/projects', jsonRequest('PUT', next, csrf));
            setProjects(data.projects);
            setError('');
            return true;
        }
        catch (error) {
            setError(error.message);
            return false;
        }
        finally {
            setReady(true);
        }
    }
    async function save(input, id) {
        const cleaned = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()]));
        const validation = validateProject(cleaned);
        if (validation) {
            setError(validation);
            return false;
        }
        if (!id && projects.length >= MAX_PROJECTS) {
            setError('You can store up to ' + MAX_PROJECTS + ' projects.');
            return false;
        }
        return commit(id ? projects.map(project => project.id === id ? { ...cleaned, id } : project) : [...projects, { ...cleaned, id: crypto.randomUUID() }]);
    }
    return { projects, ready, error, save, remove: (id) => commit(projects.filter(project => project.id !== id)) };
}

```

## src/lib/api.js

```js
export async function api(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    let body;
    try {
        body = await response.json();
    }
    catch {
        throw new Error('Start the portfolio with START PORTFOLIO.cmd to use owner editing.');
    }
    if (!response.ok)
        throw new Error(body.error || 'Request failed.');
    return body;
}
export function jsonRequest(method, body, csrf = '') {
    return { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(body) };
}

```

## src/lib/project-store.js

```js
export const MAX_PROJECTS = 100;
/** Reject executable schemes before values can reach a link or image element. */
export function isWebUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    }
    catch {
        return false;
    }
}
export function validateProject(input) {
    if (!input.title.trim() || input.title.length > 80)
        return 'Enter a title of 1–80 characters.';
    if (!isWebUrl(input.url) || input.url.length > 2048)
        return 'Enter a complete HTTP or HTTPS project URL.';
    if (!input.category.trim() || input.category.length > 60)
        return 'Enter a category of 1–60 characters.';
    if (input.tagline.length > 2000)
        return 'Keep the description under 2,001 characters.';
    if (input.thumbnail && (!isImageUrl(input.thumbnail) || input.thumbnail.length > 2048))
        return 'Use an HTTP/HTTPS image URL or a /portfolio/ asset path.';
    return null;
}
export function decodeProjects(raw) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length > MAX_PROJECTS)
        throw new Error('Invalid project collection.');
    const ids = new Set();
    for (const item of data) {
        if (!item || typeof item !== 'object' ||
            !['id', 'title', 'url', 'category', 'tagline', 'thumbnail'].every(key => typeof item[key] === 'string') ||
            !item.id || ids.has(item.id) || validateProject(item))
            throw new Error('Invalid project data.');
        ids.add(item.id);
    }
    return data;
}
/** Only packaged portfolio images or explicit web URLs are accepted. */
export function isImageUrl(value) { return isWebUrl(value) || /^\/portfolio\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|avif)$/i.test(value); }

```

## src/main.jsx

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);

```

## src/styles/global.css

```css
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:100px}body{margin:0;font:17px/1.6 var(--sans);background:var(--background);color:var(--foreground);transition:background-color .45s,color .45s}button,input,textarea{font:inherit}a,button{color:inherit}a{text-decoration:none}button{cursor:pointer;background:none;border:0}button:disabled{opacity:.6;cursor:wait}button,a{touch-action:manipulation}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,.scene:focus-visible{outline:3px solid var(--foreground);outline-offset:5px}p,h1,h2,h3,figure{margin:0}h1,h2,h3{line-height:1.06}h1,h2{letter-spacing:-.055em}em,i{font-family:inherit;font-style:normal;font-weight:inherit}::selection{background:var(--foreground);color:var(--inverse)}.experience{isolation:isolate;min-height:100svh}.plasma-background{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}.opening-page,.main-reveal{position:relative;z-index:1}.opening-page{min-height:100svh;padding:30px var(--gutter);display:flex;flex-direction:column;justify-content:space-between;text-align:center}.opening-top{display:flex;justify-content:space-between;align-items:center}.wordmark{font-weight:900;font-size:26px;letter-spacing:-1.5px;line-height:1}.theme-toggle{font-size:14px;font-weight:700;padding:12px 0;min-height:44px}.theme-toggle:hover{text-decoration:underline;text-underline-offset:5px}.opening-copy{padding:70px 0}.eyebrow{font-size:14px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}.opening-copy h1{font-size:clamp(56px,7.8vw,126px);font-weight:800;line-height:1.02;margin:26px 0}.intro-description{font-size:clamp(17px,1.55vw,23px);line-height:1.7;margin:0 auto 35px;max-width:640px}.button{display:inline-flex;align-items:center;justify-content:center;gap:22px;padding:15px 25px;font-size:15px;font-weight:700;min-height:52px;border:1px solid var(--foreground)}.button:hover{opacity:.8}.solid{background:var(--foreground);color:var(--inverse)}.get-started{min-width:235px;font-size:17px;justify-content:space-between}.get-started span{font-size:24px}.opening-bottom{font-size:14px;font-weight:600;padding-bottom:10px}.opening-page.leaving{position:fixed;inset:0;z-index:3;animation:leave .5s var(--ease) forwards;pointer-events:none}.main-reveal{animation:reveal .65s var(--ease) both}.header{margin:0 auto;padding:27px var(--gutter);display:flex;align-items:center;justify-content:space-between;gap:30px;background:var(--glass);backdrop-filter:blur(16px);max-width:1800px}.header nav{display:flex;gap:clamp(18px,2.3vw,38px);align-items:center}.header nav a{font-size:14px;font-weight:700;min-height:44px;display:flex;align-items:center}.header nav a[aria-current=page]{text-decoration:underline;text-underline-offset:8px}.portfolio{max-width:1800px;margin:auto}.hero{margin:0 var(--gutter);height:calc(100svh - 98px);min-height:740px;position:relative;isolation:isolate}.hero-title{position:absolute;top:26px;left:0;right:0;text-align:center;pointer-events:none;z-index:2}.hero h1{font-size:clamp(52px,5.8vw,96px);font-weight:800;margin-top:14px}.scene{position:absolute;left:50%;top:50%;width:min(500px,70vw);height:410px;transform:translate(-50%,-50%);cursor:grab;touch-action:pan-y;z-index:1}.scene:active{cursor:grabbing}.scene canvas{display:block;touch-action:pan-y!important}.scene-loading,.scene-fallback{display:grid;place-content:center;text-align:center;height:100%;font-size:100px}.scene-fallback p{font-size:16px}.hero-foot{position:absolute;left:0;right:0;bottom:34px;display:flex;justify-content:center;text-align:center;z-index:2;pointer-events:none}.hero-foot p{font-size:18px;line-height:1.65;max-width:520px;font-weight:500}.view-body{animation:reveal .5s var(--ease)}.work-section,.personal-section{padding:80px var(--gutter)}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:42px}.section-heading h2,.personal-section h2{font-size:clamp(36px,4.7vw,72px);font-weight:750;margin-top:14px}.text-button{font-size:15px;font-weight:700;padding:12px 0;text-decoration:underline;text-underline-offset:6px}.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:44px}.project-card{min-width:0}.project-preview{display:block;position:relative;padding:0;width:100%;text-align:left;overflow:hidden}.project-image{aspect-ratio:1.55;background:var(--surface);overflow:hidden}.project-image img{width:100%;height:100%;display:block;object-fit:cover;object-position:top;filter:grayscale(1);transition:transform .6s var(--ease)}.project-preview:hover img{transform:scale(1.035)}.preview-label{position:absolute;right:16px;bottom:16px;background:var(--foreground);color:var(--inverse);padding:10px 14px;font-size:13px;font-weight:700}.project-info{display:flex;justify-content:space-between;gap:18px;padding:23px 0}.project-info h3{margin-top:8px;font-size:24px;font-weight:750;overflow-wrap:anywhere}.project-info h3 button{padding:0;text-align:left;font:inherit}.project-info .eyebrow{font-size:13px}.external{font-size:30px;align-self:center;padding:5px 12px}.typographic-preview{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;background:var(--surface);padding:20px}.typographic-preview strong{font:normal 120px/1 var(--sans)}.typographic-preview span{font-size:15px;margin-top:20px}.home-about-link{margin-top:90px;display:flex;align-items:center;justify-content:space-between;gap:40px}.home-about-link p{font-size:clamp(30px,3.4vw,54px);font-weight:700;line-height:1.2;letter-spacing:-.04em}.personal-lead{font-size:22px;line-height:1.7;margin-top:28px;max-width:690px}.muted{color:var(--muted)}.personal-copy{font-size:18px;margin:22px 0 30px;line-height:1.8}.about-section{display:grid;grid-template-columns:1.15fr 1fr;gap:8%;align-items:center}.portrait img{width:100%;height:auto;aspect-ratio:5/6;object-fit:cover;filter:grayscale(1);display:block}.portrait figcaption{display:flex;justify-content:space-between;gap:20px;font-size:13px;font-weight:600;padding-top:15px}.skill-columns{display:grid;grid-template-columns:repeat(3,1fr);gap:50px;margin-top:55px}.skill-columns h3{font-size:24px;font-weight:750}.skill-columns ul{list-style:none;padding:0;margin-top:25px}.skill-columns li{display:flex;justify-content:space-between;gap:20px;font-size:18px;margin:17px 0}.resume-details{margin:40px 0}.resume-details>div{display:grid;grid-template-columns:1fr 2fr;padding:18px 0;gap:30px}.resume-details dt{font-size:16px;font-weight:700}.resume-details dd{font-size:20px;margin:0}.resume-actions{display:flex;gap:18px;flex-wrap:wrap}.contact-columns{display:grid;grid-template-columns:1fr 1fr;gap:10%;margin-top:40px}.contact-columns .personal-lead{margin-top:0}.contact-email,.contact-phone{display:block;font-size:17px;font-weight:600;margin:22px 0;overflow-wrap:anywhere}.contact-columns .text-button{display:inline-block;margin-top:16px}.footer-socials{display:flex;gap:20px;flex-wrap:wrap;font-size:14px;font-weight:600}footer{padding:45px var(--gutter) 110px;display:flex;gap:30px;align-items:center;justify-content:space-between;flex-wrap:wrap}.footer-mark{font-size:22px;font-weight:800}footer>span{font-size:14px;font-weight:500}.back-to-top{position:fixed;left:max(24px,env(safe-area-inset-left));bottom:max(24px,env(safe-area-inset-bottom));width:56px;height:56px;border-radius:50%;background:var(--foreground);color:var(--inverse);font-size:30px;line-height:1;display:grid;place-items:center;z-index:8;box-shadow:0 3px 18px rgb(0 0 0 / 20%);transition:transform .2s}.back-to-top:hover{transform:translateY(-4px)}.modal{background:var(--background);color:var(--foreground);border:0;padding:32px;width:min(620px,calc(100% - 32px));max-height:88svh;overscroll-behavior:contain}.modal::backdrop{background:rgb(0 0 0 / 70%);backdrop-filter:blur(9px)}.modal-heading{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:22px}.modal h2{font-size:32px;font-weight:750;overflow-wrap:anywhere}.icon-button{font-size:32px;min-width:44px;min-height:44px}.modal .project-image{margin-bottom:22px}.modal .project-image img{object-fit:contain}.modal-description{font-size:18px;margin:22px 0;white-space:pre-wrap;overflow-wrap:anywhere}.modal .button{margin:0 10px 12px 0}.stack-tags{display:flex;flex-wrap:wrap;gap:10px;padding:0;list-style:none;margin:24px 0}.stack-tags li{font-size:14px;font-weight:600;background:var(--surface);padding:6px 10px}.manager-list{margin:24px 0 32px}.manager-row{display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:14px 0}.manager-row strong{flex:1;min-width:130px;font-size:17px;overflow-wrap:anywhere}.manager-row>button,.form-heading button{font-size:14px;font-weight:700;text-decoration:underline;text-underline-offset:4px}.delete-confirm{flex-basis:100%;background:var(--surface);padding:18px}.delete-confirm p{margin-bottom:16px}.form-heading{display:flex;justify-content:space-between;align-items:center;margin:20px 0}.form-heading h3{font-size:24px}.optional{font-weight:400;color:var(--muted)}form label{display:block;font-size:15px;font-weight:700;margin-bottom:20px}input,textarea{width:100%;display:block;background:var(--surface);border:1px solid var(--line);border-radius:0;color:var(--foreground);padding:13px;margin-top:8px;font-size:17px;line-height:1.5}textarea{resize:vertical}form .muted{font-size:14px}form>.button{margin-top:16px}.form-error{font-size:15px;margin:20px 0;font-weight:700}.storage-note{padding:20px var(--gutter);font-size:15px}.empty-state{grid-column:1/-1;font-size:20px;padding:35px 0}.skip-link{position:fixed;top:-100px;left:20px;z-index:40;background:var(--foreground);color:var(--inverse);padding:12px}.skip-link:focus{top:12px}@keyframes leave{to{opacity:0;transform:translateY(-20px)}}@keyframes reveal{from{opacity:0}to{opacity:1}}
@media(max-width:1050px){.header{flex-wrap:wrap;padding-top:22px;padding-bottom:15px;gap:16px}.header nav{order:3;width:100%;justify-content:space-between;gap:15px}.header .theme-toggle{margin-left:auto}.hero{height:calc(100svh - 140px);min-height:730px}.hero h1{font-size:clamp(48px,7vw,76px)}.header nav a{font-size:14px}.personal-lead{font-size:20px}.about-section{gap:5%}.scene{height:380px}}
@media(max-width:600px){body{font-size:16px}.opening-page{padding-top:24px}.wordmark{font-size:24px}.opening-copy{padding:70px 0}.opening-copy h1{font-size:clamp(44px,11vw,65px);line-height:1.05}.opening-copy .eyebrow{font-size:14px}.intro-description{font-size:17px;margin-bottom:28px}.intro-description br{display:none}.opening-bottom{font-size:13px}.header nav{gap:12px;overflow-x:auto}.header nav a{font-size:13px;flex-shrink:0}.hero{min-height:690px;height:calc(100svh - 138px);margin:0 var(--gutter)}.hero-title{top:24px}.hero h1{font-size:clamp(36px,8.4vw,50px);line-height:1.08}.hero .eyebrow{font-size:13px}.scene{width:calc(100% + 20px);height:350px}.hero-foot{bottom:22px}.hero-foot p{font-size:16px;max-width:310px;line-height:1.65}.work-section,.personal-section{padding-top:55px;padding-bottom:55px}.section-heading{align-items:start;flex-direction:column;gap:20px;margin-bottom:30px}.section-heading h2,.personal-section h2{font-size:40px;line-height:1.08}.eyebrow{font-size:13px}.project-grid{grid-template-columns:1fr;gap:32px}.project-info h3{font-size:23px}.home-about-link{flex-direction:column;align-items:start;margin-top:55px;gap:25px}.about-section,.skill-columns,.contact-columns{grid-template-columns:1fr;gap:36px}.personal-lead{font-size:20px}.personal-copy{font-size:17px}.portrait figcaption{font-size:12px}.resume-details>div{grid-template-columns:1fr;gap:8px}.resume-details dd{font-size:19px}.modal{padding:23px}.modal h2{font-size:28px}.back-to-top{left:16px;bottom:max(16px,env(safe-area-inset-bottom));width:52px;height:52px}footer{padding-bottom:95px;gap:22px}.footer-socials{font-size:13px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}.back-to-top:hover{transform:none}}
.opening-page:not(.leaving) .opening-copy{animation:reveal .5s var(--ease) both}
main:focus{outline:none}
@media(max-width:600px){.hero-foot{bottom:76px}}


```

## src/styles/owner-refinement.css

```css
/* Owner refinement: system typography, separated layout tracks, and a right-hand scroll utility. */

.wordmark{letter-spacing:-1px;font-weight:700}.eyebrow{letter-spacing:.035em;font-weight:600;text-transform:none}.opening-copy h1,.hero h1{font-weight:600}.header nav a,.theme-toggle{font-weight:600}
.hero{display:grid;grid-template-rows:auto minmax(360px,1fr) auto;row-gap:24px;height:auto;min-height:calc(100svh - 110px);padding:36px 0 42px}
.hero-title{position:relative;inset:auto;text-align:center}.hero h1{font-size:clamp(46px,5.3vw,84px);line-height:1.12}
.scene{position:relative;left:auto;top:auto;transform:none;align-self:center;justify-self:center;width:min(500px,100%);height:390px;max-width:100%}
.hero-foot{position:relative;inset:auto;align-self:end;justify-self:center;max-width:540px}.hero-foot p{font-size:19px;line-height:1.7}
.back-to-top{left:auto;right:max(24px,env(safe-area-inset-right));bottom:max(24px,env(safe-area-inset-bottom))}
.owner-controls{display:flex;align-items:center;justify-content:flex-end;gap:20px;flex-wrap:wrap}.setup-hint{margin:18px 0;font-size:16px}.owner-controls .text-button{white-space:nowrap}.modal form{margin-top:22px}.skill-columns li{overflow-wrap:anywhere}
@media(max-width:1050px){.hero{height:auto;min-height:calc(100svh - 145px)}}
@media(max-width:600px){.hero{height:auto;min-height:0;grid-template-rows:auto 330px auto;gap:24px;padding:26px 0 44px}.hero-title{top:auto}.hero h1{font-size:clamp(33px,8.3vw,48px);line-height:1.14}.scene{height:330px;width:100%}.hero-foot{bottom:auto;padding:0 8px}.hero-foot p{font-size:17px;max-width:310px}.back-to-top{left:auto;right:16px;bottom:max(16px,env(safe-area-inset-bottom))}.owner-controls{justify-content:flex-start;gap:16px}.section-heading{gap:18px}}
.hero{grid-template-columns:minmax(0,1fr)}.hero>*{min-width:0}.hero-title{width:100%}.hero-foot{width:100%}.scene{min-width:0}
@media(max-width:600px){.header nav{gap:8px;flex-wrap:wrap;overflow:visible}.header nav a{font-size:13px}}
/* Final layout rules: the header remains in flow and the sculpture has its own row. */
.header{position:sticky;top:0;z-index:20;padding-block:16px;min-height:80px;background:color-mix(in srgb,var(--background) 94%,transparent);border-bottom:1px solid color-mix(in srgb,var(--foreground) 12%,transparent)}
.hero{grid-template-rows:auto auto auto;align-content:center;min-height:calc(100svh - 80px);gap:18px;padding-block:40px}
.hero h1{font-size:clamp(42px,4.9vw,76px);line-height:1.12;overflow-wrap:break-word}
.scene{height:clamp(280px,38svh,380px);width:min(500px,100%)}
.hero-foot{align-self:auto;max-width:550px}.hero-foot p{font-size:18px;line-height:1.65}
.work-section,.personal-section{scroll-margin-top:150px}
@media(max-width:1050px){.header{gap:8px;padding-block:12px}.header nav{gap:12px}.hero{min-height:calc(100svh - 128px)}}
@media(max-width:600px){.header{padding-inline:20px;gap:6px}.header nav{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:0;width:100%}.header nav a{justify-content:center;font-size:12px;min-width:0;min-height:40px}.header .wordmark{font-size:22px}.header .theme-toggle{font-size:13px}.hero{min-height:0;grid-template-rows:auto auto auto;gap:18px;padding-block:32px}.hero h1{font-size:clamp(32px,8.2vw,48px)}.scene{height:300px}.hero-foot p{font-size:17px}.skill-columns{min-width:0}.personal-section>*{min-width:0}}
@media(min-width:601px) and (max-height:760px){.hero{gap:14px;padding-block:24px}.hero h1{font-size:clamp(40px,4.7vw,62px)}.scene{height:280px}}
/* Apply the same palette to navigation, dialogs and native form controls. */
.header{background:var(--glass);color:var(--foreground)}
.theme-toggle{position:relative;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.theme-toggle span{font-size:20px;line-height:1}
/* One uninterrupted underline spans the icon, gap, and theme label. */
.theme-toggle:hover,.theme-toggle:focus-visible{text-decoration:none}
.theme-toggle::after{content:'';position:absolute;left:0;right:0;bottom:7px;height:1px;background:currentColor;opacity:0;transition:opacity .2s}
.theme-toggle:hover::after,.theme-toggle:focus-visible::after{opacity:1}
input,textarea,select{color-scheme:inherit;caret-color:var(--foreground)}
input::placeholder,textarea::placeholder{color:var(--muted);opacity:1}
input:autofill{box-shadow:0 0 0 1000px var(--surface) inset;-webkit-text-fill-color:var(--foreground)}
.modal{border:1px solid var(--line)}
.project-image{outline:1px solid color-mix(in srgb,var(--foreground) 14%,transparent);outline-offset:-1px}
/* Keep the six navigation labels on one shared baseline at every width. */
.header nav{flex-wrap:nowrap;align-items:center}
.header nav a{white-space:nowrap}
.opening-copy>.eyebrow,.hero-title>.eyebrow{font-size:clamp(18px,1.6vw,22px);font-weight:700;color:var(--foreground);letter-spacing:.015em}
.get-started,.get-started:hover,.get-started:focus,.get-started:focus-visible,.get-started:active,.get-started:disabled{border:0;outline:none;box-shadow:none;text-decoration:none;justify-content:center;text-align:center}

/* Keep emphasized copy upright with its surrounding typography. */
em,i{font-style:normal;font-weight:inherit}
/* Paint the theme on the actual page layers, not just the propagated body background. */
html,body,#root,.experience{background-color:var(--background);color:var(--foreground)}
.experience{position:relative}
.plasma-background{background-color:var(--background)}

```

## src/styles/tokens.css

```css
:root,[data-theme=dark]{color-scheme:dark;--background:#000;--foreground:#fff;--muted:#c9c9c9;--surface:#141414;--line:#606060;--glass:rgb(0 0 0 / 96%);--inverse:#000;--sans:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;--serif:var(--sans);--gutter:clamp(22px,5vw,88px);--ease:cubic-bezier(.22,1,.36,1)}
[data-theme=light]{color-scheme:light;--background:#fff;--foreground:#000;--muted:#373737;--surface:#f2f2f2;--line:#777;--glass:rgb(255 255 255 / 96%);--inverse:#fff}


```

## tests/owner-api.test.mjs

```javascript
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApi,localOrigin,makeCredential,validateProjects,validateSkills} from '../server/api.mjs';

test('server validation rejects unsafe links and malformed skill collections',()=>{
  assert.equal(validateProjects([{id:'x',title:'X',url:'javascript:alert(1)',category:'Web',tagline:'',thumbnail:''}]),false);
  assert.equal(validateSkills([{id:'a',title:'Tools',items:['React','React']}]),false);
  assert.equal(validateSkills([{id:'a',title:'Tools',items:['React']}]),true);
});
test('owner API enforces session, origin, CSRF, persistent writes, and logout',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'jeff-owner-test-'));
  await mkdir(path.join(root,'src/data'),{recursive:true});await mkdir(path.join(root,'.private'));
  await writeFile(path.join(root,'src/data/projects.json'),'[]');await writeFile(path.join(root,'src/data/skills.json'),'[]');
  await writeFile(path.join(root,'.private/owner.json'),JSON.stringify(await makeCredential('test-only-owner-password')));
  const handler=createApi({root,originForRequest:localOrigin});
  const server=createServer((req,res)=>void handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const request=(route,method='GET',body,headers={})=>fetch(origin+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  try{
    assert.equal((await request('/api/projects','PUT',[])).status,401);
    assert.equal((await request('/api/session')).status,200);
    assert.equal((await request('/api/login','POST',{password:'wrong'})).status,401);
    const login=await request('/api/login','POST',{password:'test-only-owner-password'});assert.equal(login.status,200);
    const cookie=login.headers.get('set-cookie').split(';')[0],session=await login.json();
    assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    const headers={Cookie:cookie,'X-CSRF-Token':session.csrf};
    assert.equal((await request('/api/skills','PUT',[],{Cookie:cookie})).status,403);
    assert.equal((await request('/api/skills','PUT',[],{...headers,Origin:'https://other.example'})).status,403);
    const skills=[{id:'tools',title:'Tools',items:['React','Figma']}];
    assert.equal((await request('/api/skills','PUT',skills,headers)).status,200);
    const projects=[{id:'project',title:'Portfolio',url:'https://example.com',category:'Web',tagline:'',thumbnail:''}];
    assert.equal((await request('/api/projects','PUT',projects,headers)).status,200);
    const data=await (await request('/api/content')).json();assert.deepEqual(data.skills,skills);assert.deepEqual(data.projects,projects);
    assert.deepEqual(JSON.parse(await readFile(path.join(root,'.private/content.json'),'utf8')),data);
    assert.equal((await request('/api/logout','POST',{},headers)).status,200);
    assert.equal((await request('/api/projects','PUT',[],headers)).status,401);
    for(let i=0;i<5;i++)await request('/api/login','POST',{password:'wrong'});
    assert.equal((await request('/api/login','POST',{password:'test-only-owner-password'})).status,429);
  }finally{
    await new Promise(resolve=>server.close(resolve));
    if(!path.resolve(root).startsWith(path.join(path.resolve(tmpdir()),'jeff-owner-test-')))throw new Error('Unexpected temporary path');
    await rm(root,{recursive:true,force:true});
  }
});

```

## tests/project-store.test.js

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeProjects, isWebUrl, validateProject } from '../src/lib/project-store.js';
const valid = { id: 'one', title: 'Project', url: 'https://example.com', category: 'Design', tagline: 'A study.', thumbnail: '' };
test('rejects executable and malformed URLs', () => { for (const url of ['javascript:alert(1)', 'data:text/html,hello', '/relative', 'invalid'])
    assert.equal(isWebUrl(url), false); assert.equal(isWebUrl('https://example.com/path'), true); });
test('validates project metadata and image URLs', () => { assert.equal(validateProject(valid), null); assert.ok(validateProject({ ...valid, title: ' ' })); assert.ok(validateProject({ ...valid, thumbnail: 'javascript:alert(1)' })); });
test('preserves a deliberately empty collection', () => { assert.deepEqual(decodeProjects('[]'), []); });
test('rejects corrupt storage and duplicate IDs', () => { assert.throws(() => decodeProjects('{')); assert.throws(() => decodeProjects(JSON.stringify([valid, valid]))); assert.throws(() => decodeProjects('[{"id":"x"}]')); assert.deepEqual(decodeProjects(JSON.stringify([valid])), [valid]); });
test('accepts bundled thumbnails without allowing arbitrary paths', () => { assert.equal(validateProject({ ...valid, thumbnail: '/portfolio/todos-preview.png' }), null); assert.ok(validateProject({ ...valid, thumbnail: '//evil.example/img.png' })); assert.ok(validateProject({ ...valid, thumbnail: '/portfolio/../secret.png' })); });
test('link cards may omit descriptions and thumbnail images', () => { assert.equal(validateProject({ ...valid, tagline: '', thumbnail: '' }), null); });

```

## vite.config.js

```js
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';
import {createApi,localOrigin} from './server/api.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({
  plugins:[react(),{name:'owner-api',configureServer(server){server.middlewares.use(createApi({root,originForRequest:localOrigin}));}}],
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  server:{host:'127.0.0.1',fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/.private/**']}}
});

```
