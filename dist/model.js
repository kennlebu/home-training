// Original articulated movement diagrams. All joint positions are authored here.
// These are simplified illustrations, not captured biomechanics or form assessment.
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const V=(x,y,z=0)=>[x,y,z];
const bones=[['hip','chest'],['chest','neck'],['neck','head'],['chest','ls'],['chest','rs'],['ls','le'],['le','lh'],['rs','re'],['re','rh'],['hip','lp'],['hip','rp'],['lp','lk'],['lk','la'],['rp','rk'],['rk','ra'],['la','lf'],['ra','rf']];
function standing(){return {hip:V(0,1.05),chest:V(0,1.58),neck:V(0,1.77),head:V(0,1.91),ls:V(-.23,1.63),rs:V(.23,1.63),le:V(-.28,1.3),re:V(.28,1.3),lh:V(-.27,1),rh:V(.27,1),lp:V(-.13,1.02),rp:V(.13,1.02),lk:V(-.15,.56),rk:V(.15,.56),la:V(-.2,.09),ra:V(.2,.09),lf:V(-.2,.06,.19),rf:V(.2,.06,.19)};}
function floorPose(){return {hip:V(0,.2,.1),chest:V(0,.2,-.42),neck:V(0,.2,-.6),head:V(0,.23,-.76),ls:V(-.23,.2,-.44),rs:V(.23,.2,-.44),le:V(-.35,.15,-.15),re:V(.35,.15,-.15),lh:V(-.43,.15,.1),rh:V(.43,.15,.1),lp:V(-.13,.2,.1),rp:V(.13,.2,.1),lk:V(-.15,.47,.48),rk:V(.15,.47,.48),la:V(-.16,.08,.8),ra:V(.16,.08,.8),lf:V(-.16,.05,.95),rf:V(.16,.05,.95)};}
function quadPose(){return {hip:V(0,.64,.35),chest:V(0,.68,-.18),neck:V(0,.7,-.35),head:V(0,.7,-.5),ls:V(-.23,.66,-.2),rs:V(.23,.66,-.2),le:V(-.23,.36,-.2),re:V(.23,.36,-.2),lh:V(-.23,.07,-.18),rh:V(.23,.07,-.18),lp:V(-.13,.64,.35),rp:V(.13,.64,.35),lk:V(-.15,.08,.45),rk:V(.15,.08,.45),la:V(-.15,.06,.9),ra:V(.15,.06,.9),lf:V(-.15,.04,1.02),rf:V(.15,.04,1.02)};}
export function poseFor(motion,t){let a=standing(),b=standing();const props=[];let center=1;
 if(['squat','goblet','ballsquat','split'].includes(motion)){
  for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])b[k][1]-=.48;
  b.hip[2]=-.28;b.lp[2]=b.rp[2]=-.28;b.lk=V(-.25,.46,.18);b.rk=V(.25,.46,.18);b.chest[2]=-.08;b.neck[2]=.02;b.head[2]=.05;
  if(motion==='goblet'){for(const p of [a,b]){p.le=V(-.18,p.chest[1]-.17,.23);p.re=V(.18,p.chest[1]-.17,.23);p.lh=V(-.08,p.chest[1]-.02,.28);p.rh=V(.08,p.chest[1]-.02,.28);}props.push('goblet');}
  if(motion==='squat'||motion==='ballsquat'){for(const p of [a,b]){p.le=V(-.2,p.chest[1]-.05,.32);p.re=V(.2,p.chest[1]-.05,.32);p.lh=V(-.18,p.chest[1]-.05,.59);p.rh=V(.18,p.chest[1]-.05,.59);}}
  if(motion==='split'){for(const p of [a,b]){p.la[2]=-.45;p.ra[2]=.4;p.lf[2]=-.28;p.rf[2]=.57;}b.lk=V(-.15,.15,-.15);b.rk=V(.15,.5,.62);}
  if(motion==='ballsquat')props.push('wall','backball');
 }else if(['hinge','barbellhinge','row','bandrow'].includes(motion)){
  const hinged=standing();hinged.hip[2]=-.27;hinged.lp[2]=hinged.rp[2]=-.27;hinged.lk[2]=hinged.rk[2]=.06;hinged.chest=V(0,1.24,.22);hinged.neck=V(0,1.36,.37);hinged.head=V(0,1.45,.48);hinged.ls=V(-.23,1.28,.22);hinged.rs=V(.23,1.28,.22);hinged.le=V(-.27,.96,.31);hinged.re=V(.27,.96,.31);hinged.lh=V(-.27,.64,.33);hinged.rh=V(.27,.64,.33);
  if(motion==='row'){a=hinged;b=structuredClone(a);b.le=V(-.29,1.22,-.12);b.re=V(.29,1.22,-.12);b.lh=V(-.29,1.1,.16);b.rh=V(.29,1.1,.16);props.push('pair');}
  else if(motion==='bandrow'){a=standing();b=standing();for(const p of [a,b]){p.lh=V(-.18,1.32,.6);p.rh=V(.18,1.32,.6);p.le=V(-.22,1.32,.3);p.re=V(.22,1.32,.3);}b.le=V(-.26,1.3,-.25);b.re=V(.26,1.3,-.25);b.lh=V(-.2,1.28,.1);b.rh=V(.2,1.28,.1);props.push('anchorband');}
  else{b=hinged;props.push(motion==='barbellhinge'?'barbell':'pair');}
 }else if(['bridge','bandbridge','ballcurl','floorpress','benchpress','deadbug'].includes(motion)){
  a=floorPose();b=floorPose();center=.65;
  if(motion==='bridge'||motion==='bandbridge'){for(const k of ['hip','lp','rp'])b[k][1]+=.34;b.lk[1]=b.rk[1]=.52;for(const p of [a,b]){p.le=V(-.26,.13,-.1);p.re=V(.26,.13,-.1);p.lh=V(-.28,.1,.2);p.rh=V(.28,.1,.2);}if(motion==='bandbridge')props.push('kneeband');}
  if(motion==='floorpress'||motion==='benchpress'){for(const p of [a,b]){p.le=V(-.42,.2,-.22);p.re=V(.42,.2,-.22);p.lh=V(-.42,.53,-.22);p.rh=V(.42,.53,-.22);}b.le=V(-.18,.5,-.4);b.re=V(.18,.5,-.4);b.lh=V(-.13,.84,-.4);b.rh=V(.13,.84,-.4);props.push('pair');if(motion==='benchpress'){for(const p of [a,b])for(const k of Object.keys(p))p[k][1]+=.35;props.push('bench');center=.8;}}
  if(motion==='deadbug'){for(const p of [a,b]){p.lh=V(-.17,.85,-.38);p.rh=V(.17,.85,-.38);p.le=V(-.2,.54,-.4);p.re=V(.2,.54,-.4);p.lk=V(-.15,.66,.16);p.rk=V(.15,.66,.16);p.la=V(-.15,.66,.61);p.ra=V(.15,.66,.61);p.lf=V(-.15,.66,.75);p.rf=V(.15,.66,.75);}b.lh=V(-.17,.27,-1);b.le=V(-.18,.39,-.68);b.rk=V(.15,.27,.56);b.ra=V(.15,.17,1);b.rf=V(.15,.17,1.13);}
  if(motion==='ballcurl'){for(const p of [a,b]){p.hip[1]=p.lp[1]=p.rp[1]=.56;p.lk=V(-.15,.48,.56);p.rk=V(.15,.48,.56);p.la=V(-.16,.43,1);p.ra=V(.16,.43,1);p.lf=V(-.16,.43,1.12);p.rf=V(.16,.43,1.12);}b.lk=V(-.15,.76,.43);b.rk=V(.15,.76,.43);b.la=V(-.16,.46,.67);b.ra=V(.16,.46,.67);b.lf=V(-.16,.46,.8);b.rf=V(.16,.46,.8);props.push('football');}
 }else if(['birddog','wheel','plank','pushup','sideplank','wallpush'].includes(motion)){
  a=quadPose();b=quadPose();center=.7;
  if(motion==='birddog'){b.lh=V(-.23,.7,-.85);b.le=V(-.23,.68,-.53);b.rk=V(.15,.65,.78);b.ra=V(.15,.66,1.17);b.rf=V(.15,.65,1.3);}
  if(motion==='wheel'){for(const p of [a,b]){p.lh[2]=p.rh[2]=-.4;}b.hip=V(0,.35,.18);b.chest=V(0,.34,-.31);b.neck=V(0,.35,-.47);b.head=V(0,.36,-.62);b.ls=V(-.23,.34,-.32);b.rs=V(.23,.34,-.32);b.le=V(-.22,.2,-.6);b.re=V(.22,.2,-.6);b.lh=V(-.17,.13,-.86);b.rh=V(.17,.13,-.86);b.lp=V(-.13,.35,.18);b.rp=V(.13,.35,.18);props.push('wheel');}
  if(['plank','pushup'].includes(motion)){for(const p of [a,b]){p.hip=V(0,.48,.35);p.lp=V(-.13,.48,.35);p.rp=V(.13,.48,.35);p.lk=V(-.15,.29,.78);p.rk=V(.15,.29,.78);p.la=V(-.16,.1,1.16);p.ra=V(.16,.1,1.16);p.lf=V(-.16,.04,1.27);p.rf=V(.16,.04,1.27);}if(motion==='pushup'){for(const k of ['chest','neck','head','ls','rs','hip','lp','rp'])b[k][1]-=.25;b.le=V(-.42,.21,-.15);b.re=V(.42,.21,-.15);}else{for(const p of [a,b]){p.chest[1]=.48;p.ls[1]=p.rs[1]=.48;p.neck[1]=p.head[1]=.5;p.le=V(-.23,.07,-.12);p.re=V(.23,.07,-.12);p.lh=V(-.23,.07,-.4);p.rh=V(.23,.07,-.4);}}}
  if(motion==='sideplank'){a={hip:V(0,.42,.2),chest:V(0,.63,-.27),neck:V(0,.72,-.44),head:V(0,.8,-.56),ls:V(0,.8,-.28),rs:V(0,.44,-.28),le:V(.1,.79,-.01),re:V(0,.06,-.28),lh:V(.1,.62,.2),rh:V(0,.06,-.55),lp:V(0,.49,.2),rp:V(0,.35,.2),lk:V(0,.3,.63),rk:V(0,.23,.63),la:V(0,.12,1.05),ra:V(0,.05,1.05),lf:V(.16,.08,1.13),rf:V(.16,.04,1.13)};b=structuredClone(a);}
  if(motion==='wallpush'){a=standing();b=standing();for(const p of [a,b]){p.lh=V(-.24,1.45,.65);p.rh=V(.24,1.45,.65);p.le=V(-.24,1.5,.32);p.re=V(.24,1.5,.32);}for(const k of ['hip','chest','neck','head','ls','rs','lp','rp'])b[k][2]+=.22;b.le=V(-.4,1.4,.45);b.re=V(.4,1.4,.45);props.push('frontwall');center=1;}
 }else if(['press','curl','march','calf','cablerow','latpull','legpress'].includes(motion)){
  if(motion==='press'){for(const p of [a,b]){p.le=V(-.45,1.52);p.re=V(.45,1.52);p.lh=V(-.44,1.86);p.rh=V(.44,1.86);}b.le=V(-.29,1.99);b.re=V(.29,1.99);b.lh=V(-.23,2.27);b.rh=V(.23,2.27);props.push('pair');center=1.1;}
  if(motion==='curl'){b.le=V(-.28,1.3);b.re=V(.28,1.3);b.lh=V(-.28,1.55,.24);b.rh=V(.28,1.55,.24);props.push('pair');}
  if(motion==='calf'){for(const k of Object.keys(b))b[k][1]+=.09;b.lf[1]=b.rf[1]=.06;}
  if(motion==='march'){b.lk=V(-.16,.88,.34);b.la=V(-.16,.43,.4);b.lf=V(-.16,.4,.55);b.re=V(.26,1.48,.23);b.rh=V(.26,1.65,.4);}
  if(['cablerow','latpull','legpress'].includes(motion)){for(const p of [a,b]){for(const k of ['hip','chest','neck','head','ls','rs','le','re','lh','rh','lp','rp'])p[k][1]-=.5;p.lk=V(-.15,.5,.43);p.rk=V(.15,.5,.43);p.la=V(-.16,.08,.5);p.ra=V(.16,.08,.5);p.lf=V(-.16,.06,.65);p.rf=V(.16,.06,.65);}props.push('seat');center=.8;
   if(motion==='cablerow'){for(const p of [a,b]){p.le=V(-.2,1,.3);p.re=V(.2,1,.3);p.lh=V(-.15,1,.62);p.rh=V(.15,1,.62);}b.le[2]=b.re[2]=-.2;b.lh[2]=b.rh[2]=.12;props.push('cable');}
   if(motion==='latpull'){for(const p of [a,b]){p.le=V(-.45,1.54);p.re=V(.45,1.54);p.lh=V(-.5,1.86);p.rh=V(.5,1.86);}b.le=V(-.4,1);b.re=V(.4,1);b.lh=V(-.5,1.35,.1);b.rh=V(.5,1.35,.1);props.push('pulldownbar');}
   if(motion==='legpress'){for(const p of [a,b]){p.chest[2]=-.25;p.neck[2]=p.head[2]=-.4;p.lk=V(-.2,.55,.47);p.rk=V(.2,.55,.47);p.la=V(-.2,.85,.73);p.ra=V(.2,.85,.73);p.lf=V(-.2,.85,.85);p.rf=V(.2,.85,.85);}b.lk=V(-.2,.64,.6);b.rk=V(.2,.64,.6);b.la=V(-.2,.95,1);b.ra=V(.2,.95,1);b.lf=V(-.2,.95,1.12);b.rf=V(.2,.95,1.12);props.push('platform');}
  }
 }
 const pose={};for(const k of Object.keys(a))pose[k]=mix(a[k],b[k],t);return {pose,props,center};
}
export function mountModel(canvas,motion){let angle=.5,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,phase=0,disposed=false,last=0,raf;const ctx=canvas.getContext('2d');let dragging=false,x0=0;const onDown=e=>{dragging=true;x0=e.clientX;canvas.setPointerCapture(e.pointerId)};const onMove=e=>{if(dragging){angle+=(e.clientX-x0)*.012;x0=e.clientX;draw();}};const onUp=()=>dragging=false;canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
 function draw(){if(disposed)return;const w=canvas.clientWidth||400,h=canvas.clientHeight||300;const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const t=(1-Math.cos(phase))/2;const {pose:p,props,center}=poseFor(motion,t);const scale=Math.min(w*.34,h*.36);const project=v=>{const x=v[0]*Math.cos(angle)+v[2]*Math.sin(angle),z=-v[0]*Math.sin(angle)+v[2]*Math.cos(angle);return [w/2+x*scale,h*.52-(v[1]-center)*scale+z*scale*.18,z]};
 const line=(a,b,color,width)=>{const q=project(a),r=project(b);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(r[0],r[1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};const sphere=(v,r,color)=>{const q=project(v);const gradient=ctx.createRadialGradient(q[0]-r*.3,q[1]-r*.3,r*.1,q[0],q[1],r);gradient.addColorStop(0,color);gradient.addColorStop(1,color==='#aec3a8'?'#708f69':'#295044');ctx.beginPath();ctx.arc(q[0],q[1],r,0,Math.PI*2);ctx.fillStyle=gradient;ctx.fill();};
 // Floor grid gives the viewer depth cues while the camera rotates.
 for(let n=-3;n<=3;n++){line(V(n*.4,0,-1.2),V(n*.4,0,1.5),'#d7e1d0',1);line(V(-1.2,0,n*.4),V(1.2,0,n*.4),'#d7e1d0',1);}
 if(props.includes('wall')){line(V(-.8,0,-.62),V(-.8,2.2,-.62),'#c3d0bc',3);line(V(.8,0,-.62),V(.8,2.2,-.62),'#c3d0bc',3);line(V(-.8,2.2,-.62),V(.8,2.2,-.62),'#c3d0bc',3);}
 if(props.includes('frontwall')){line(V(-.8,0,.68),V(-.8,2.2,.68),'#c3d0bc',3);line(V(.8,0,.68),V(.8,2.2,.68),'#c3d0bc',3);line(V(-.8,2.2,.68),V(.8,2.2,.68),'#c3d0bc',3);}
 if(props.includes('backball'))sphere(V(0,p.hip[1]+.24,-.4),scale*.24,'#aec3a8');
 if(props.includes('football'))sphere(V(0,.24,p.la[2]),scale*.25,'#aec3a8');
 if(props.includes('bench')){line(V(0,.47,-.8),V(0,.47,.4),'#82917e',scale*.35);line(V(0,0,-.6),V(0,.45,-.6),'#82917e',6);line(V(0,0,.2),V(0,.45,.2),'#82917e',6);}
 if(props.includes('seat')){line(V(-.3,.48,.1),V(.3,.48,.1),'#82917e',12);line(V(0,.05,.1),V(0,.47,.1),'#82917e',6);}
 const sorted=[...bones].sort((a,b)=>(project(p[a[0]])[2]+project(p[a[1]])[2])-(project(p[b[0]])[2]+project(p[b[1]])[2]));for(const [a,b] of sorted)line(p[a],p[b],a==='hip'?'#325b4c':'#6c8e7b',a==='hip'?scale*.2:a==='chest'&&b==='neck'?scale*.08:scale*.065);for(const k of ['ls','rs','le','re','lh','rh','lk','rk','la','ra'])sphere(p[k],scale*.043,'#a4baa8');sphere(p.head,scale*.095,'#a4baa8');
 const weight=hand=>{const c=p[hand];line(V(c[0]-.13,c[1],c[2]),V(c[0]+.13,c[1],c[2]),'#bd7a36',5);sphere(V(c[0]-.12,c[1],c[2]),scale*.055,'#305446');sphere(V(c[0]+.12,c[1],c[2]),scale*.055,'#305446');};
 if(props.includes('pair')){weight('lh');weight('rh');}if(props.includes('goblet')){line(p.lh,p.rh,'#bc7a36',8);sphere(mix(p.lh,p.rh,.5),scale*.07,'#305446');}if(props.includes('barbell')||props.includes('pulldownbar')){const y=p.lh[1],z=p.lh[2];line(V(-.8,y,z),V(.8,y,z),'#ba7c3d',6);if(props.includes('barbell')){sphere(V(-.7,y,z),scale*.1,'#305446');sphere(V(.7,y,z),scale*.1,'#305446');}}
 if(props.includes('kneeband'))line(p.lk,p.rk,'#be7d3e',6);
 if(props.includes('anchorband')){line(p.lh,V(-.1,1.3,1.1),'#be7d3e',3);line(p.rh,V(.1,1.3,1.1),'#be7d3e',3);line(V(0,0,1.1),V(0,2,1.1),'#acbba3',5);}
 if(props.includes('cable'))line(mix(p.lh,p.rh,.5),V(0,.6,1.3),'#be7d3e',3);
 if(props.includes('wheel')){const center=mix(p.lh,p.rh,.5);sphere(V(0,.12,center[2]),scale*.11,'#305446');line(p.lh,p.rh,'#bd7a36',7);}
 if(props.includes('platform'))line(V(-.4,p.la[1],p.la[2]+.1),V(.4,p.ra[1],p.ra[2]+.1),'#82917e',9);
 }
 function frame(now){if(disposed)return;if(last&&playing)phase+=(now-last)/1000*speed*1.25;last=now;draw();if(playing)raf=requestAnimationFrame(frame);else raf=null;}raf=requestAnimationFrame(frame);
 return {play:()=>{playing=!playing;if(playing&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}return playing;},setSpeed:v=>speed=Number(v),front:()=>{angle=0;draw();},side:()=>{angle=Math.PI/2;draw();},step:v=>{playing=false;if(raf)cancelAnimationFrame(raf);raf=null;phase=Number(v)*Math.PI;draw();},dispose:()=>{disposed=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);}};
}
