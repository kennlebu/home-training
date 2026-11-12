import {humanSurfaces,drawHuman} from './human-model.js';
import {constrainPose,mirrorPose,SIDED_MOTIONS,movementSideLabel} from './movement-rig.js';
// Original articulated movement diagrams. All joint positions are authored here.
// These are simplified illustrations, not captured biomechanics or form assessment.
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const V=(x,y,z=0)=>[x,y,z];

function standing(){return {hip:V(0,1.05),chest:V(0,1.58),neck:V(0,1.77),head:V(0,1.91),ls:V(-.23,1.63),rs:V(.23,1.63),le:V(-.28,1.3),re:V(.28,1.3),lh:V(-.27,1),rh:V(.27,1),lp:V(-.13,1.02),rp:V(.13,1.02),lk:V(-.15,.56),rk:V(.15,.56),la:V(-.2,.09),ra:V(.2,.09),lf:V(-.2,.06,.19),rf:V(.2,.06,.19)};}
function floorPose(){return {hip:V(0,.15,.1),chest:V(0,.15,-.42),neck:V(0,.14,-.6),head:V(0,.095,-.76),ls:V(-.23,.2,-.44),rs:V(.23,.2,-.44),le:V(-.35,.15,-.15),re:V(.35,.15,-.15),lh:V(-.43,.15,.1),rh:V(.43,.15,.1),lp:V(-.13,.2,.1),rp:V(.13,.2,.1),lk:V(-.15,.47,.48),rk:V(.15,.47,.48),la:V(-.16,.08,.8),ra:V(.16,.08,.8),lf:V(-.16,.05,.95),rf:V(.16,.05,.95)};}
function quadPose(){return {hip:V(0,.54,.35),chest:V(0,.72,-.18),neck:V(0,.7,-.35),head:V(0,.7,-.5),ls:V(-.23,.66,-.2),rs:V(.23,.66,-.2),le:V(-.23,.36,-.2),re:V(.23,.36,-.2),lh:V(-.23,.07,-.18),rh:V(.23,.07,-.18),lp:V(-.13,.54,.35),rp:V(.13,.54,.35),lk:V(-.15,.08,.45),rk:V(.15,.08,.45),la:V(-.15,.06,.9),ra:V(.15,.06,.9),lf:V(-.15,.04,1.02),rf:V(.15,.04,1.02)};}
export function poseFor(motion,t,side=0){t=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));let a=standing(),b=standing();const props=[];let center=1;
 if(['squat','goblet','ballsquat','split'].includes(motion)){
  for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])b[k][1]-=.48;
  b.hip[2]=-.28;b.lp[2]=b.rp[2]=-.28;b.lk=V(-.25,.46,.18);b.rk=V(.25,.46,.18);b.chest[2]=-.08;b.neck[2]=.02;b.head[2]=.05;
  if(motion==='squat')for(const p of [a,b]){p.lf[0]=-.24;p.rf[0]=.24;}
  if(motion==='goblet'){for(const p of [a,b]){p.le=V(-.18,p.chest[1]-.17,.23);p.re=V(.18,p.chest[1]-.17,.23);p.lh=V(-.08,p.chest[1]-.02,.28);p.rh=V(.08,p.chest[1]-.02,.28);}props.push('goblet');}
  if(motion==='squat'||motion==='ballsquat'){for(const p of [a,b]){p.le=V(-.2,p.chest[1]-.05,.32);p.re=V(.2,p.chest[1]-.05,.32);p.lh=V(-.18,p.chest[1]-.05,.59);p.rh=V(.18,p.chest[1]-.05,.59);}}
  if(motion==='split'){
   for(const p of [a,b]){p.la=V(-.2,.20,-.45);p.ra=V(.2,.09,.45);p.lf=V(-.2,.06,-.3);p.rf=V(.2,.06,.64);p.hip[2]=p.lp[2]=p.rp[2]=p.chest[2]=0;}
   for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])a[k][1]-=.17;
   b.lk=V(-.15,.15,-.12);b.rk=V(.15,.5,.54);
  }
  if(motion==='ballsquat'){
   for(const p of [a,b]){for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])p[k][2]=0;p.la[2]=p.ra[2]=.35;p.lf[2]=p.rf[2]=.54;}
   for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])a[k][1]-=.09;
   props.push('wall','backball');
  }
 }else if(['hinge','barbellhinge','row','bandrow'].includes(motion)){
  const hinged=standing();hinged.hip[1]=.97;hinged.lp[1]=hinged.rp[1]=.94;hinged.hip[2]=-.27;hinged.lp[2]=hinged.rp[2]=-.27;hinged.lk[2]=hinged.rk[2]=.06;hinged.chest=V(0,1.24,.22);hinged.neck=V(0,1.36,.37);hinged.head=V(0,1.45,.48);hinged.ls=V(-.23,1.28,.22);hinged.rs=V(.23,1.28,.22);hinged.le=V(-.27,.96,.31);hinged.re=V(.27,.96,.31);hinged.lh=V(-.27,.64,.14);hinged.rh=V(.27,.64,.14);
  if(motion==='row'){a=hinged;b=structuredClone(a);b.le=V(-.29,1.22,-.12);b.re=V(.29,1.22,-.12);b.lh=V(-.29,1.1,.16);b.rh=V(.29,1.1,.16);props.push('pair');}
  else if(motion==='bandrow'){a=standing();b=standing();for(const p of [a,b]){p.lh=V(-.18,1.32,.6);p.rh=V(.18,1.32,.6);p.le=V(-.22,1.32,.3);p.re=V(.22,1.32,.3);}b.le=V(-.26,1.3,-.25);b.re=V(.26,1.3,-.25);b.lh=V(-.2,1.28,.1);b.rh=V(.2,1.28,.1);props.push('anchorband');}
  else{b=hinged;if(motion==='barbellhinge')a.lh[2]=a.rh[2]=.12;props.push(motion==='barbellhinge'?'barbell':'pair');}
 }else if(['bridge','bandbridge','ballcurl','floorpress','benchpress','deadbug'].includes(motion)){
  a=floorPose();b=floorPose();center=.65;
  if(motion==='bridge'||motion==='bandbridge'){for(const k of ['hip','lp','rp'])b[k][1]+=.34;b.lk[1]=b.rk[1]=.52;for(const p of [a,b]){p.le=V(-.26,.13,-.1);p.re=V(.26,.13,-.1);p.lh=V(-.28,.1,.2);p.rh=V(.28,.1,.2);}if(motion==='bandbridge')props.push('kneeband');}
  if(motion==='floorpress'||motion==='benchpress'){for(const p of [a,b]){p.le=V(-.42,.2,-.22);p.re=V(.42,.2,-.22);p.lh=V(-.42,.53,-.22);p.rh=V(.42,.53,-.22);}b.le=V(-.18,.5,-.4);b.re=V(.18,.5,-.4);b.lh=V(-.13,.84,-.4);b.rh=V(.13,.84,-.4);if(motion==='floorpress'){a.le=V(-.5,.055,-.2865);a.re=V(.5,.055,-.2865);a.lh=V(-.5,.385,-.2865);a.rh=V(.5,.385,-.2865);b.lh=V(-.18,.818,-.47);b.rh=V(.18,.818,-.47);}
   props.push('pair');if(motion==='benchpress'){for(const p of [a,b])for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])p[k][1]+=.45;props.push('bench');center=.8;}}
  if(motion==='deadbug'){for(const p of [a,b]){p.lh=V(-.17,.85,-.38);p.rh=V(.17,.85,-.38);p.le=V(-.2,.54,-.4);p.re=V(.2,.54,-.4);p.lk=V(-.15,.66,.16);p.rk=V(.15,.66,.16);p.la=V(-.15,.66,.61);p.ra=V(.15,.66,.61);p.lf=V(-.15,.66,.75);p.rf=V(.15,.66,.75);}b.lh=V(-.17,.27,-1);b.le=V(-.18,.39,-.68);b.rk=V(.15,.27,.56);b.ra=V(.15,.17,1);b.rf=V(.15,.17,1.13);}
  if(motion==='ballcurl'){for(const p of [a,b]){p.hip[1]=p.lp[1]=p.rp[1]=.56;p.lk=V(-.15,.48,.56);p.rk=V(.15,.48,.56);p.la=V(-.16,.54,.96);p.ra=V(.16,.54,.96);p.lf=V(-.16,.54,1.08);p.rf=V(.16,.54,1.08);}b.lk=V(-.15,.76,.43);b.rk=V(.15,.76,.43);b.la=V(-.16,.54,.67);b.ra=V(.16,.54,.67);b.lf=V(-.16,.54,.8);b.rf=V(.16,.54,.8);props.push('football');}
 }else if(['birddog','wheel','plank','pushup','sideplank','wallpush'].includes(motion)){
  a=quadPose();b=quadPose();center=.7;
  if(motion==='birddog'){b.lh=V(-.23,.7,-.85);b.le=V(-.23,.68,-.53);b.rk=V(.15,.65,.81);b.ra=V(.15,.66,1.27);b.rf=V(.15,.65,1.4);}
  if(motion==='wheel'){for(const p of [a,b]){p.lh[2]=p.rh[2]=-.4;}b.hip=V(0,.35,.18);b.chest=V(0,.34,-.31);b.neck=V(0,.35,-.47);b.head=V(0,.36,-.58);b.ls=V(-.23,.34,-.32);b.rs=V(.23,.34,-.32);b.le=V(-.22,.2,-.6);b.re=V(.22,.2,-.6);b.lh=V(-.17,.13,-.86);b.rh=V(.17,.13,-.86);b.lp=V(-.13,.35,.18);b.rp=V(.13,.35,.18);props.push('wheel');}
  if(['plank','pushup'].includes(motion)){for(const p of [a,b]){p.hip=V(0,.48,.35);p.lp=V(-.13,.48,.35);p.rp=V(.13,.48,.35);p.lk=V(-.15,.29,.78);p.rk=V(.15,.29,.78);p.la=V(-.16,.1,1.16);p.ra=V(.16,.1,1.16);p.lf=V(-.16,.04,1.27);p.rf=V(.16,.04,1.27);}if(motion==='pushup'){for(const k of ['chest','neck','head','ls','rs','hip','lp','rp'])b[k][1]-=.25;b.le=V(-.42,.21,-.15);b.re=V(.42,.21,-.15);}else{for(const p of [a,b]){p.hip[1]=.30;p.lp[1]=p.rp[1]=.30;p.chest[1]=.40;p.ls[1]=p.rs[1]=.40;p.neck[1]=p.head[1]=.42;p.le=V(-.23,.07,-.12);p.re=V(.23,.07,-.12);p.lh=V(-.23,.07,-.4);p.rh=V(.23,.07,-.4);}}}
  if(motion==='sideplank'){a={hip:V(0,.42,.2),chest:V(0,.63,-.27),neck:V(0,.72,-.44),head:V(0,.8,-.56),ls:V(0,.8,-.28),rs:V(0,.44,-.28),le:V(.1,.79,-.01),re:V(0,.06,-.28),lh:V(.1,.62,.2),rh:V(0,.06,-.55),lp:V(0,.49,.2),rp:V(0,.35,.2),lk:V(0,.3,.63),rk:V(0,.23,.63),la:V(0,.12,1.05),ra:V(0,.05,1.05),lf:V(.16,.08,1.13),rf:V(.16,.04,1.13)};b=structuredClone(a);}
  if(motion==='wallpush'){a=standing();b=standing();for(const p of [a,b]){p.lh=V(-.24,1.45,.65);p.rh=V(.24,1.45,.65);p.le=V(-.24,1.5,.32);p.re=V(.24,1.5,.32);}for(const k of ['hip','chest','neck','head','ls','rs','lp','rp'])b[k][2]+=.22;b.le=V(-.4,1.4,.45);b.re=V(.4,1.4,.45);props.push('frontwall');center=1;}
 }else if(['press','curl','march','calf','cablerow','latpull','legpress'].includes(motion)){
  if(motion==='press'){for(const p of [a,b]){p.le=V(-.45,1.52);p.re=V(.45,1.52);p.lh=V(-.44,1.86);p.rh=V(.44,1.86);}b.le=V(-.29,1.99);b.re=V(.29,1.99);b.lh=V(-.23,2.27);b.rh=V(.23,2.27);props.push('pair');center=1.1;}
  if(motion==='curl'){b.le=V(-.28,1.3);b.re=V(.28,1.3);b.lh=V(-.28,1.55,.24);b.rh=V(.28,1.55,.24);props.push('pair');}
  if(motion==='calf')props.push('frontwall');
  if(motion==='march'){for(const p of [a,b]){p.le=V(-.26,1.30,0);p.re=V(.26,1.30,0);p.lh=V(-.26,1.08,.25);p.rh=V(.26,1.08,.25);}b.le=V(-.26,1.30,-.12);b.lh=V(-.26,1.10,-.35);b.lk=V(-.16,.88,.34);b.la=V(-.16,.43,.4);b.lf=V(-.16,.4,.55);b.re=V(.26,1.30,.20);b.rh=V(.26,1.55,.42);}
  if(['cablerow','latpull','legpress'].includes(motion)){for(const p of [a,b]){for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])p[k][1]-=.5;p.lk=V(-.15,.5,.43);p.rk=V(.15,.5,.43);p.la=V(-.16,.08,.5);p.ra=V(.16,.08,.5);p.lf=V(-.16,.06,.65);p.rf=V(.16,.06,.65);}props.push('seat');center=.8;
   if(motion==='cablerow'){for(const p of [a,b]){p.le=V(-.2,1,.3);p.re=V(.2,1,.3);p.lh=V(-.15,1,.62);p.rh=V(.15,1,.62);}b.le[2]=b.re[2]=-.2;b.lh[2]=b.rh[2]=.12;props.push('cable');}
   if(motion==='latpull'){for(const p of [a,b]){p.le=V(-.45,1.54,.08);p.re=V(.45,1.54,.08);p.lh=V(-.46,1.746,.12);p.rh=V(.46,1.746,.12);}b.le=V(-.4,.9,.06);b.re=V(.4,.9,.06);b.lh=V(-.46,1.14,.18);b.rh=V(.46,1.14,.18);props.push('pulldownbar','thighpad');}
   if(motion==='legpress'){for(const p of [a,b]){p.chest[2]=-.25;p.neck[2]=p.head[2]=-.4;p.lk=V(-.2,.55,.47);p.rk=V(.2,.55,.47);p.la=V(-.2,.823,.593);p.ra=V(.2,.823,.593);p.lf=V(-.2,.963,.533);p.rf=V(.2,.963,.533);}b.lk=V(-.2,.64,.6);b.rk=V(.2,.64,.6);b.la=V(-.2,.933,.813);b.ra=V(.2,.933,.813);b.lf=V(-.2,1.073,.753);b.rf=V(.2,1.073,.753);props.push('platform','backrest');}
  }
 }
 const raw={};for(const k of Object.keys(a))raw[k]=mix(a[k],b[k],t);
 if(motion==='curl'){
  const theta=t*2.25;
  for(const side of ['l','r']){const shoulder=raw[side+'s'];raw[side+'e']=V(shoulder[0],shoulder[1]-.34,shoulder[2]);raw[side+'h']=V(shoulder[0],shoulder[1]-.34-.33*Math.cos(theta),shoulder[2]+.33*Math.sin(theta));}
 }
 let pose=constrainPose(raw,motion,t);if(side%2&&SIDED_MOTIONS.has(motion))pose=mirrorPose(pose);
 return {pose,props,center,side:side%2};
}
export function equipmentGeometry(motion,p){
 const bar=['barbellhinge','latpull'].includes(motion)?[V(-.8,p.lh[1],p.lh[2]),V(.8,p.rh[1],p.rh[2])]:[];
 const platform=motion==='legpress'?[V(-.4,p.la[1]-.04,p.la[2]+.03),V(.4,p.ra[1]-.04,p.ra[2]+.03),V(.4,p.ra[1]+.19,p.ra[2]-.06),V(-.4,p.la[1]+.19,p.la[2]-.06)]:[];
 const backrest=motion==='legpress'?[V(0,.48,-.1),V(0,p.head[1]+.1,p.head[2]-.12)]:[];
 const thighpad=motion==='latpull'?[V(-.27,(p.lp[1]+p.lk[1])/2+.09,(p.lp[2]+p.lk[2])/2),V(.27,(p.rp[1]+p.rk[1])/2+.09,(p.rp[2]+p.rk[2])/2)]:[];
 const band=motion==='bandbridge'?[mix(p.lp,p.lk,.8),mix(p.rp,p.rk,.8)]:[];
 return {bar,platform,backrest,thighpad,band};
}
export function modelFrame(motion,angle,width,height){
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const side of [0,1])for(let frame=0;frame<=16;frame++){
  const {pose,center}=poseFor(motion,frame/16,side);
  for(const point of [...Object.values(pose),...Object.values(equipmentGeometry(motion,pose)).flat()]){
   const x=point[0]*Math.cos(angle)+point[2]*Math.sin(angle),z=-point[0]*Math.sin(angle)+point[2]*Math.cos(angle),y=-(point[1]-center)+z*.18;
   minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
 }
 const scale=Math.min(width*.82/(maxX-minX+.34),height*.80/(maxY-minY+.28));
 return {scale,offsetX:width/2-(minX+maxX)/2*scale,offsetY:height*.48-(minY+maxY)/2*scale};
}
export function mountModel(canvas,motion){let angle=.5,sideOffset=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,phase=0,disposed=false,last=0,raf,framing=null;const ctx=canvas.getContext('2d');const readColors=()=>{const style=getComputedStyle(document.documentElement);return Object.fromEntries(['grid','body','torso','joint','shadow','ball','ball-shadow','support','equipment','weight','accent'].map(key=>[key,style.getPropertyValue('--model-'+key).trim()]));};let colors=readColors();const themeChanged=()=>{colors=readColors();draw();};window.addEventListener('home-training:theme',themeChanged);let dragging=false,x0=0;const onDown=e=>{dragging=true;x0=e.clientX;canvas.setPointerCapture(e.pointerId)};const onMove=e=>{if(dragging){angle+=(e.clientX-x0)*.012;x0=e.clientX;draw();}};const onUp=()=>dragging=false;canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
 function draw(){if(disposed)return;const w=canvas.clientWidth||400,h=canvas.clientHeight||300;const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const t=(1-Math.cos(phase))/2;const {pose:p,props,center,side}=poseFor(motion,t,((['deadbug','birddog','march'].includes(motion)?Math.floor(phase/(2*Math.PI)):0)+sideOffset)%2);const label=canvas.parentElement?.querySelector('[data-model-side]');const sideText=movementSideLabel(motion,side);if(label&&label.textContent!==sideText)label.textContent=sideText;if(!framing||framing.width!==w||framing.height!==h||framing.angle!==angle)framing={...modelFrame(motion,angle,w,h),width:w,height:h,angle};const scale=framing.scale;const project=v=>{const x=v[0]*Math.cos(angle)+v[2]*Math.sin(angle),z=-v[0]*Math.sin(angle)+v[2]*Math.cos(angle);return [framing.offsetX+x*scale,framing.offsetY-(v[1]-center)*scale+z*scale*.18,z]};
 const line=(a,b,color,width)=>{const q=project(a),r=project(b);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(r[0],r[1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};const sphere=(v,r,color)=>{const q=project(v);const gradient=ctx.createRadialGradient(q[0]-r*.3,q[1]-r*.3,r*.1,q[0],q[1],r);gradient.addColorStop(0,color);gradient.addColorStop(1,color===colors['ball']?colors['ball-shadow']:colors['shadow']);ctx.beginPath();ctx.arc(q[0],q[1],r,0,Math.PI*2);ctx.fillStyle=gradient;ctx.fill();};
 // Floor grid gives the viewer depth cues while the camera rotates.
 for(let n=-3;n<=3;n++){line(V(n*.4,0,-1.2),V(n*.4,0,1.5),colors['grid'],1);line(V(-1.2,0,n*.4),V(1.2,0,n*.4),colors['grid'],1);}
 if(props.includes('wall')){line(V(-.8,0,-.58),V(-.8,2.2,-.58),colors['support'],3);line(V(.8,0,-.58),V(.8,2.2,-.58),colors['support'],3);line(V(-.8,2.2,-.58),V(.8,2.2,-.58),colors['support'],3);}
 if(props.includes('frontwall')){const z=motion==='calf'?.55:.68;line(V(-.8,0,z),V(-.8,2.2,z),colors['support'],3);line(V(.8,0,z),V(.8,2.2,z),colors['support'],3);line(V(-.8,2.2,z),V(.8,2.2,z),colors['support'],3);}
 if(props.includes('backball'))sphere(V(0,p.hip[1]+.24,-.34),scale*.24,colors['ball']);
 if(props.includes('football'))sphere(V(0,.25,p.la[2]),scale*.25,colors['ball']);
 if(props.includes('bench')){line(V(0,.40,-.8),V(0,.40,.4),colors['equipment'],scale*.12);line(V(0,0,-.6),V(0,.40,-.6),colors['equipment'],6);line(V(0,0,.2),V(0,.40,.2),colors['equipment'],6);}
 if(props.includes('seat')){line(V(-.3,.48,.1),V(.3,.48,.1),colors['equipment'],12);line(V(0,.05,.1),V(0,.47,.1),colors['equipment'],6);}
 const equipment=equipmentGeometry(motion,p);
 if(props.includes('backrest'))line(...equipment.backrest,colors['equipment'],scale*.12);
 if(props.includes('thighpad'))line(...equipment.thighpad,colors['equipment'],scale*.08);
 drawHuman(ctx,humanSurfaces(p,motion),project,angle,colors);
 const weight=hand=>{const c=p[hand];line(V(c[0]-.13,c[1],c[2]),V(c[0]+.13,c[1],c[2]),colors['accent'],5);sphere(V(c[0]-.12,c[1],c[2]),scale*.055,colors['weight']);sphere(V(c[0]+.12,c[1],c[2]),scale*.055,colors['weight']);};
 if(props.includes('pair')){weight('lh');weight('rh');}if(props.includes('goblet')){const c=mix(p.lh,p.rh,.5);line(V(c[0],c[1]-.18,c[2]),V(c[0],c[1]+.05,c[2]),colors['accent'],5);sphere(V(c[0],c[1]-.18,c[2]),scale*.075,colors['weight']);sphere(V(c[0],c[1]+.05,c[2]),scale*.075,colors['weight']);}if(props.includes('barbell')||props.includes('pulldownbar')){const y=p.lh[1],z=p.lh[2];line(V(-.8,y,z),V(.8,y,z),colors['accent'],6);if(props.includes('barbell')){sphere(V(-.7,y,z),scale*.1,colors['weight']);sphere(V(.7,y,z),scale*.1,colors['weight']);}}
 if(props.includes('kneeband')){const [l,r]=equipment.band;line([l[0],l[1]+.015,l[2]+.04],[r[0],r[1]+.015,r[2]+.04],colors['accent'],5);line([l[0],l[1]-.015,l[2]-.04],[r[0],r[1]-.015,r[2]-.04],colors['accent'],5);line([l[0],l[1]+.015,l[2]+.04],[l[0],l[1]-.015,l[2]-.04],colors['accent'],5);line([r[0],r[1]+.015,r[2]+.04],[r[0],r[1]-.015,r[2]-.04],colors['accent'],5);}
 if(props.includes('anchorband')){line(p.lh,V(-.1,1.3,1.1),colors['accent'],3);line(p.rh,V(.1,1.3,1.1),colors['accent'],3);line(V(0,0,1.1),V(0,2,1.1),colors['support'],5);}
 if(props.includes('cable'))line(mix(p.lh,p.rh,.5),V(0,.6,1.3),colors['accent'],3);
 if(props.includes('wheel')){const center=mix(p.lh,p.rh,.5);sphere(V(0,.12,center[2]),scale*.11,colors['weight']);line(p.lh,p.rh,colors['accent'],7);}
 if(props.includes('platform'))for(let i=0;i<4;i++)line(equipment.platform[i],equipment.platform[(i+1)%4],colors['equipment'],9);
 }
 function frame(now){if(disposed)return;if(last&&playing)phase+=(now-last)/1000*speed*1.25;last=now;draw();if(playing)raf=requestAnimationFrame(frame);else raf=null;}raf=requestAnimationFrame(frame);
 return {otherSide:()=>{sideOffset=1-sideOffset;draw();},play:()=>{playing=!playing;if(playing&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}return playing;},setSpeed:v=>speed=Number(v),front:()=>{angle=0;draw();},side:()=>{angle=Math.PI/2;draw();},step:v=>{playing=false;if(raf)cancelAnimationFrame(raf);raf=null;phase=Number(v)*Math.PI;draw();},dispose:()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('home-training:theme',themeChanged);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);}};
}
