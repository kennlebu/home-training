import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {serviceWorkerSource} from './scripts/service-worker-source.js';

export default defineConfig({
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  plugins:[tailwindcss(),{
    name:'home-training-offline',
    generateBundle(_,bundle){
      const files=[...new Set(['./','./index.html','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./manifest.webmanifest',...Object.keys(bundle).map(n=>'./'+n)])];
      const digest=createHash('sha256').update(JSON.stringify(files)).update(serviceWorkerSource.toString());
      for(const file of ['icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png','manifest.webmanifest'])digest.update(readFileSync(new URL('./public/'+file,import.meta.url)));
      const hash=digest.digest('hex').slice(0,12);
      const source=serviceWorkerSource(files,hash);
      this.emitFile({type:'asset',fileName:'sw.js',source});
    }
  }],
  build:{outDir:'dist',emptyOutDir:true,rollupOptions:{onwarn(warning,warn){if(warning.code==='MODULE_LEVEL_DIRECTIVE'&&warning.message.includes('use client'))return;warn(warning);}}},
});
