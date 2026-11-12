
const CACHE='home-training-v3-3e1a6cecf0a5';
const FILES=["./","./index.html","./icon.svg","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./manifest.webmanifest","./assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2","./assets/manrope-greek-wght-normal-DL7QRZyv.woff2","./assets/manrope-latin-ext-wght-normal-Ch3YOpNY.woff2","./assets/manrope-vietnamese-wght-normal-usUDDRr7.woff2","./assets/dm-sans-latin-ext-wght-normal-BOFOeGcA.woff2","./assets/manrope-latin-wght-normal-DHIcAJRg.woff2","./assets/dm-sans-latin-wght-normal-Xz1IZZA0.woff2","./assets/index-CRSIAmRQ.css","./assets/index-DKdnxLq8.js"];
const paths=new Set(FILES.map(f=>new URL(f,self.location.href).pathname));
let networkAvailable=true;
const announce=()=>self.clients.matchAll({type:'window'}).then(clients=>clients.forEach(client=>client.postMessage({type:'NETWORK_STATUS',online:networkAvailable})));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('home-training-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{
  if(event.data?.type==='APPLY_UPDATE')self.skipWaiting();
  if(event.data?.type==='CHECK_STATUS')event.waitUntil(caches.open(CACHE).then(async cache=>{
    const ready=(await Promise.all(FILES.map(file=>cache.match(file)))).every(Boolean);
    event.ports[0]?.postMessage({ready,online:networkAvailable,version:CACHE});
  }));
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);
      try{
        const response=await fetch(request,{signal:controller.signal});
        if(!response.ok)throw Error('Navigation unavailable');
        networkAvailable=true;event.waitUntil(announce());return response;
      }catch{
        networkAvailable=false;event.waitUntil(announce());
        const cache=await caches.open(CACHE);
        return (await cache.match('./index.html',{ignoreVary:true}))||Response.error();
      }finally{clearTimeout(timer);}
    })());return;
  }
  if(paths.has(url.pathname))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request,{ignoreSearch:true,ignoreVary:true}))||fetch(request)));
});
