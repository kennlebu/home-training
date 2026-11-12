import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {serviceWorkerSource} from '../scripts/service-worker-source.js';
function harness({offline=false,failInstall=false}={}){
 const handlers={},entries=new Map(),deleted=[];let skip=0,claimed=0,networkCalls=0;
 const cache={addAll:async files=>{if(failInstall)throw Error('Download interrupted');for(const f of files)entries.set(new URL(f,'https://training.test/sw.js').href,new Response(f));},match:async (request,options={})=>request.headers?.get('Origin')&&!options.ignoreVary?undefined:entries.get(new URL(request.url||request,'https://training.test/sw.js').href)?.clone()};
 const context={URL,Response,AbortController,setTimeout,clearTimeout,fetch:async()=>{networkCalls++;if(offline)throw Error('No connection');return new Response('online page');},caches:{open:async()=>cache,match:cache.match,keys:async()=>['home-training-v2-old','another-app'],delete:async key=>{deleted.push(key);return true;}},self:{location:{href:'https://training.test/sw.js',origin:'https://training.test'},clients:{claim:async()=>{claimed++;},matchAll:async()=>[]},skipWaiting:()=>{skip++;},addEventListener:(type,fn)=>handlers[type]=fn}};
 vm.runInNewContext(serviceWorkerSource(['./','./index.html','./assets/app.js'],'test'),context);
 async function event(type,extra={}){const waits=[];let response;handlers[type]({...extra,waitUntil:p=>waits.push(p),respondWith:p=>response=p});if(response)response=await response;await Promise.all(waits);return response;}
 return {event,entries,deleted,get skip(){return skip;},get claimed(){return claimed;},get networkCalls(){return networkCalls;}};
}
test('offline cache installs atomically and upgrades wait for an explicit update',async()=>{
 const h=harness();await h.event('install');assert.equal(h.entries.size,3);assert.equal(h.skip,0);
 await h.event('activate');assert.equal(h.claimed,1);assert.deepEqual(h.deleted,['home-training-v2-old']);
 await h.event('message',{data:{type:'APPLY_UPDATE'}});assert.equal(h.skip,1);
});
test('an interrupted download fails installation instead of declaring the app ready',async()=>{
 const h=harness({failInstall:true});await assert.rejects(h.event('install'));assert.equal(h.entries.size,0);assert.equal(h.skip,0);
});
test('offline navigation and movement bundles come from the prepared cache',async()=>{
 const h=harness({offline:true});await h.event('install');
 const page=await h.event('fetch',{request:{url:'https://training.test/',method:'GET',mode:'navigate'}});assert.equal(await page.text(),'./index.html');
 const calls=h.networkCalls;const asset=await h.event('fetch',{request:new Request('https://training.test/assets/app.js',{headers:{Origin:'https://training.test'}})});assert.equal(await asset.text(),'./assets/app.js');assert.equal(h.networkCalls,calls);
 let status;await h.event('message',{data:{type:'CHECK_STATUS'},ports:[{postMessage:value=>status=value}]});assert.equal(status.ready,true);assert.equal(status.online,false);
 h.entries.delete('https://training.test/assets/app.js');await h.event('message',{data:{type:'CHECK_STATUS'},ports:[{postMessage:value=>status=value}]});assert.equal(status.ready,false);
});
test('unrelated origins and writes are left to the browser',async()=>{
 const h=harness();assert.equal(await h.event('fetch',{request:{url:'https://external.test/',method:'GET',mode:'cors'}}),undefined);assert.equal(await h.event('fetch',{request:{url:'https://training.test/',method:'POST',mode:'cors'}}),undefined);assert.equal(h.networkCalls,0);
});

test('updates cannot activate or reload while a workout is active',async()=>{
 const window=new EventTarget(),workerEvents=new EventTarget();let active=true,applied=0,reloaded=0;
 const waiting={postMessage:()=>applied++};
 const registration=Object.assign(new EventTarget(),{waiting,update:async()=>{}});
 const navigator={onLine:true,serviceWorker:Object.assign(workerEvents,{controller:{postMessage:()=>{}},register:async()=>registration,ready:Promise.resolve(registration)})};
 class Channel {constructor(){this.port1={close(){}};this.port2={};}}
 const context={window,navigator,Event,MessageChannel:Channel,matchMedia:()=>({matches:false,addEventListener(){}}),setTimeout:()=>0,clearTimeout(){},location:{reload:()=>reloaded++}};
 const source=readFileSync(new URL('../src/device-support.js',import.meta.url),'utf8').replaceAll('import.meta.env.PROD','true').replaceAll('import.meta.env.DEV','false').replaceAll('export ','');
 vm.runInNewContext(source+';this.api={initDeviceSupport,applyAppUpdate,deviceState,refreshWorkoutStatus};',context);
 context.api.initDeviceSupport({canUpdate:()=>!active});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(context.api.deviceState().update,true);assert.equal(context.api.applyAppUpdate(),false);assert.equal(applied,0);
 workerEvents.dispatchEvent(new Event('controllerchange'));assert.equal(reloaded,0);
 active=false;context.api.refreshWorkoutStatus();assert.equal(context.api.deviceState().active,false);
 assert.equal(context.api.applyAppUpdate(),true);assert.equal(applied,1);
 workerEvents.dispatchEvent(new Event('controllerchange'));assert.equal(reloaded,1);
});
