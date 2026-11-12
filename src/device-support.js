const CHANGE='home-training:device';
let snapshot={supported:'serviceWorker' in navigator,ready:false,online:navigator.onLine,installed:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,installable:false,update:false,active:false,error:'',storage:''};
let registration,promptEvent,canUpdate=()=>true,started=false,reloading=false;
export const deviceState=()=>({...snapshot});
function change(patch){snapshot={...snapshot,...patch};window.dispatchEvent(new Event(CHANGE));}
export function refreshWorkoutStatus(){change({active:!canUpdate()});}
async function check(){
  const worker=navigator.serviceWorker?.controller;
  change({update:!!registration?.waiting&&!!worker});
  if(!worker)return;
  const channel=new MessageChannel();
  const timer=setTimeout(()=>channel.port1.close(),4000);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();change({ready:event.data.ready,online:navigator.onLine&&event.data.online});};
  worker.postMessage({type:'CHECK_STATUS'},[channel.port2]);
}
export async function requestInstall(){
  if(!promptEvent)return;
  const prompt=promptEvent;promptEvent=null;change({installable:false});
  await prompt.prompt();await prompt.userChoice;
}
export function applyAppUpdate(){
  if(!canUpdate()){refreshWorkoutStatus();return false;}
  if(!registration?.waiting)return false;
  reloading=true;registration.waiting.postMessage({type:'APPLY_UPDATE'});return true;
}
export async function retryOfflineDownload(){
  change({error:''});
  try{if(!registration)registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await registration.update();await check();}catch{change({error:'The download could not finish. Reconnect and try again.'});}
}
export async function protectStorage(){
  if(!navigator.storage?.persist){change({storage:'This browser manages storage automatically. Keep a downloaded backup.'});return;}
  try{const granted=await navigator.storage.persist();change({storage:granted?'This browser granted persistent storage. Keep a backup for browser resets or device loss.':'This browser manages storage automatically. Keep a downloaded backup.'});}catch{change({storage:'Storage protection is unavailable. Keep a downloaded backup.'});}
}
export function initDeviceSupport(options){
  if(started)return;started=true;canUpdate=options.canUpdate;refreshWorkoutStatus();
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;change({installable:true});});
  window.addEventListener('appinstalled',()=>{promptEvent=null;change({installed:true,installable:false});});
  matchMedia('(display-mode: standalone)').addEventListener('change',event=>change({installed:event.matches}));
  window.addEventListener('offline',()=>change({online:false}));
  window.addEventListener('online',()=>{change({online:true});check();});
  if(!import.meta.env.PROD||!snapshot.supported){change({error:import.meta.env.DEV?'Offline download is available in the published app.':'This browser cannot prepare the app for offline use.'});return;}
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='NETWORK_STATUS')change({online:navigator.onLine&&event.data.online});});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading&&canUpdate())location.reload();else check();});
  const observe=reg=>{
    registration=reg;change({update:!!reg.waiting&&!!navigator.serviceWorker.controller});
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{
      if(worker.state==='installed'){change({update:!!reg.waiting&&!!navigator.serviceWorker.controller});check();}
      if(worker.state==='redundant')change({error:'The download could not finish. Reconnect and try again.'});
    });});
    check();
  };
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(observe).catch(()=>change({error:'Offline download could not start. Reconnect and try again.'}));
  navigator.serviceWorker.ready.then(reg=>{if(!registration)observe(reg);check();});
}
