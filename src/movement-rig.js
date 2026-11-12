// Author-defined illustration proportions, not measured human biomechanics.
export const SEGMENTS={upperArm:.34,forearm:.33,thigh:.46,shin:.47,spine:.53};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,n)=>a.map(v=>v*n);
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const length=a=>Math.hypot(...a);
const unit=(a,fallback=[0,1,0])=>length(a)>1e-8?mul(a,1/length(a)):fallback;
export function solveLimb(root,target,hint,upper,lower){
 const delta=sub(target,root),axis=unit(delta),distance=Math.min(upper+lower-1e-6,Math.max(Math.abs(upper-lower)+1e-6,length(delta)));
 const end=add(root,mul(axis,distance));
 let bend=sub(sub(hint,root),mul(axis,dot(sub(hint,root),axis)));
 if(length(bend)<1e-7){const fallback=Math.abs(axis[2])<.8?[0,0,1]:[0,1,0];bend=sub(fallback,mul(axis,dot(fallback,axis)));}
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 return {joint:add(add(root,mul(axis,along)),mul(unit(bend),height)),end};
}
export function constrainPose(source,motion,progress=0){
 const p=structuredClone(source);let spine=unit(sub(p.chest,p.hip));
 if(motion==='wallpush'){
  spine=[0,Math.cos(.28*progress),Math.sin(.28*progress)];
  const ankle=mul(add(p.la,p.ra),.5),legLength=Math.sqrt((SEGMENTS.thigh+SEGMENTS.shin)**2-.07**2);
  p.hip=add(ankle,mul(spine,legLength+.03));p.chest=add(p.hip,mul(spine,SEGMENTS.spine));
  for(const side of ['l','r']){const sign=side==='l'?-1:1;p[side+'h']=[sign*.23,1.45,.64];p[side+'e']=[sign*(.24+.16*progress),1.4,.45];}
 }
 if(motion==='calf'){
  const angle=.45*progress,dy=.06+.03*Math.cos(angle)+.19*Math.sin(angle)-.09,dz=.19+.03*Math.sin(angle)-.19*Math.cos(angle);
  for(const key of Object.keys(p))if(!['lf','rf'].includes(key)){const settle=['la','ra'].includes(key)?0:.09+Math.sqrt((SEGMENTS.thigh+SEGMENTS.shin)**2-.07**2)-1.02;p[key]=add(p[key],[0,dy+settle,dz]);}
  for(const side of ['l','r']){const x=side==='l'?-.23:.23;p[side+'h']=[x,1.42,.55];p[side+'e']=[x,1.3,.28];}
 }
 if(motion==='wheel'){
  const knee=[0,.08,.45],desired=sub(sub(p.hip,mul(spine,.03)),knee);desired[0]=0;
  const pelvis=add(knee,mul(unit(desired),Math.sqrt(SEGMENTS.thigh**2-.02**2)));
  const hip=add(pelvis,mul(spine,.03)),shift=sub(hip,p.hip);p.hip=hip;p.chest=add(p.chest,shift);
  for(const side of ['l','r']){const x=side==='l'?-.15:.15;p[side+'k']=[x,.08,.45];p[side+'a']=[x,.06,.45+Math.sqrt(SEGMENTS.shin**2-.02**2)];p[side+'f']=[x,.04,1.05];}
 }
 if(['plank','pushup'].includes(motion)){
  const ankle=mul(add(p.la,p.ra),.5),legLength=Math.sqrt((SEGMENTS.thigh+SEGMENTS.shin)**2-.03**2);
  if(motion==='plank'){const rise=(.41-ankle[1])/(legLength+.03+SEGMENTS.spine+.05);spine=[0,rise,-Math.sqrt(1-rise*rise)];}
  else spine=unit(sub(p.chest,ankle));
  p.hip=add(ankle,mul(spine,legLength+.03));p.chest=add(p.hip,mul(spine,SEGMENTS.spine));
  if(motion==='plank')for(const side of ['l','r']){const x=side==='l'?-.23:.23,z=p.chest[2]+spine[2]*.05;p[side+'e']=[x,.07,z];p[side+'h']=[x,.07,z-.33];}
 }
 const supine=['bridge','bandbridge','ballcurl','floorpress','benchpress','deadbug'].includes(motion);
 if(supine)p.hip=add(p.chest,mul(spine,-SEGMENTS.spine));else p.chest=add(p.hip,mul(spine,SEGMENTS.spine));
 const shoulders=unit(sub(p.rs,p.ls),[1,0,0]),pelvis=unit(sub(p.rp,p.lp),[1,0,0]);
 const shoulderCenter=add(p.chest,mul(spine,.05)),pelvisCenter=add(p.hip,mul(spine,-.03));
 p.ls=add(shoulderCenter,mul(shoulders,-.23));p.rs=add(shoulderCenter,mul(shoulders,.23));
 p.lp=add(pelvisCenter,mul(pelvis,-.13));p.rp=add(pelvisCenter,mul(pelvis,.13));
 if(!supine){p.neck=add(p.chest,mul(spine,.18));p.head=add(p.neck,mul(spine,.14));}
 if(motion==='row')for(const side of ['l','r']){
  const sign=side==='l'?-1:1,start=add(p[side+'s'],[0,-SEGMENTS.upperArm-SEGMENTS.forearm,0]),end=[sign*.29,1.02,-.04];
  p[side+'h']=start.map((v,i)=>v+(end[i]-v)*progress);p[side+'e']=[sign*.29,1.22,-.12];
 }
 if(motion==='wheel')for(const side of ['l','r']){
  const shoulder=p[side+'s'],x=side==='l'?-.17:.17,y=.13,armLength=SEGMENTS.upperArm+SEGMENTS.forearm;
  p[side+'h']=[x,y,shoulder[2]-Math.sqrt(Math.max(0,armLength**2-(shoulder[1]-y)**2-(shoulder[0]-x)**2))];
  p[side+'e']=add(shoulder,mul(sub(p[side+'h'],shoulder),SEGMENTS.upperArm/armLength));
 }
 if(motion==='deadbug'){
  const angle=progress*Math.acos(.05/(SEGMENTS.upperArm+SEGMENTS.forearm)),armLength=SEGMENTS.upperArm+SEGMENTS.forearm;
  p.lh=add(p.ls,[0,armLength*Math.cos(angle),-armLength*Math.sin(angle)]);
  p.le=add(p.ls,[0,SEGMENTS.upperArm*Math.cos(angle),-SEGMENTS.upperArm*Math.sin(angle)]);
  p.rh=add(p.rs,[0,armLength,0]);p.re=add(p.rs,[0,SEGMENTS.upperArm,0]);
  const extended=[p.rp[0]+.02,.17,p.rp[2]+Math.sqrt((SEGMENTS.thigh+SEGMENTS.shin)**2-(p.rp[1]-.17)**2-.02**2)];
  const start=[.15,.66,.61];p.ra=start.map((value,i)=>value+(extended[i]-value)*progress);p.rf=add(p.ra,[0,0,.13]);
 }
 if(motion==='birddog'){
  const angle=progress*Math.PI/2,armLength=SEGMENTS.upperArm+SEGMENTS.forearm;
  p.lh=add(p.ls,[0,-armLength*Math.cos(angle),-armLength*Math.sin(angle)]);
  p.le=add(p.ls,[0,-SEGMENTS.upperArm*Math.cos(angle),-SEGMENTS.upperArm*Math.sin(angle)]);
  p.rh=add(p.rs,[0,-armLength,0]);p.re=add(p.rs,[0,-SEGMENTS.upperArm,0]);
  const extended=[p.rp[0]+.02,p.rp[1],p.rp[2]+Math.sqrt((SEGMENTS.thigh+SEGMENTS.shin)**2-.02**2)],start=[.15,.06,.9];
  p.ra=start.map((value,i)=>value+(extended[i]-value)*progress);p.rf=add(p.ra,[0,-.01,.13]);p.rk=[.15,.08+(p.rp[1]-.08)*progress,.45+(p.rp[2]+SEGMENTS.thigh-.45)*progress];
 }
 for(const side of ['l','r']){
  const arm=solveLimb(p[side+'s'],p[side+'h'],p[side+'e'],SEGMENTS.upperArm,SEGMENTS.forearm);p[side+'e']=arm.joint;p[side+'h']=arm.end;
  const ankle=p[side+'a'];const leg=solveLimb(p[side+'p'],ankle,p[side+'k'],SEGMENTS.thigh,SEGMENTS.shin);p[side+'k']=leg.joint;p[side+'a']=leg.end;p[side+'f']=add(p[side+'f'],sub(leg.end,ankle));
 }
 return p;
}
export function mirrorPose(source){
 const p={};for(const key of Object.keys(source)){const other=(key.length===2&&'lr'.includes(key[0]))?(key[0]==='l'?'r':'l')+key.slice(1):key;const value=source[other]||source[key];p[key]=[-value[0],value[1],value[2]];}return p;
}
export const SIDED_MOTIONS=new Set(['deadbug','birddog','split','sideplank','march']);
export function movementSideLabel(motion,side){
 if(['deadbug','birddog'].includes(motion))return side?'Right arm and left leg':'Left arm and right leg';
 if(motion==='split')return side?'Left leg forward':'Right leg forward';
 if(motion==='sideplank')return side?'Left forearm support':'Right forearm support';
 if(motion==='march')return side?'Right leg lead':'Left leg lead';return '';
}
