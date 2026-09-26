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
