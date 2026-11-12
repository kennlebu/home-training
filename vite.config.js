import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  plugins:[tailwindcss(),{
    name:'home-training-offline',
    generateBundle(_,bundle){
      const files=[...new Set(['./','./index.html','./icon.svg','./manifest.webmanifest',...Object.keys(bundle).map(n=>'./'+n)])];
      const hash=createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0,12);
      const source=`const CACHE='home-training-v2-${hash}';
const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('home-training-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok&&FILES.some(f=>new URL(f,self.location.href).pathname===new URL(event.request.url).pathname)){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});`;
      this.emitFile({type:'asset',fileName:'sw.js',source});
    }
  }],
  build:{outDir:'dist',emptyOutDir:true,rollupOptions:{onwarn(warning,warn){if(warning.code==='MODULE_LEVEL_DIRECTIVE'&&warning.message.includes('use client'))return;warn(warning);}}},
});
