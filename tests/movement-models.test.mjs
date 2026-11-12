import {humanSurfaces} from '../src/human-model.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {poseFor,modelFrame,equipmentGeometry} from '../src/model.js';
import {EXERCISES} from '../src/exercises.js';
import {SEGMENTS,mirrorPose,solveLimb} from '../src/movement-rig.js';
import {MOVEMENT_SOURCES,permittedVideo,videoEmbedURL} from '../src/movement-sources.js';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const near=(actual,expected,tolerance=1e-5)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} expected ${expected}`);
test('every movement retains the same limb lengths throughout both sides of the animation',()=>{
 for(const exercise of EXERCISES)for(const side of [0,1])for(let frame=0;frame<=30;frame++){
  const {pose:p}=poseFor(exercise.motion,frame/30,side);
  for(const point of Object.values(p)){assert.ok(point.every(Number.isFinite),exercise.id);assert.ok(point[1]>=0,`${exercise.id} joint below floor`);}
  for(const side of ['l','r'])for(const [a,b,length] of [['s','e',SEGMENTS.upperArm],['e','h',SEGMENTS.forearm],['p','k',SEGMENTS.thigh],['k','a',SEGMENTS.shin]])near(distance(p[side+a],p[side+b]),length);
  near(distance(p.chest,p.hip),SEGMENTS.spine);
 }
});
test('the limb solver handles straight, coincident and unreachable targets without invalid joints',()=>{
 for(const target of [[0,0,0],[0,1,0],[100,100,100]]){const result=solveLimb([0,0,0],target,[0,1,0],.34,.33);near(distance([0,0,0],result.joint),.34);near(distance(result.joint,result.end),.33);}
});
test('dead bug and bird dog reach with opposite limbs and offer mirrored sides',()=>{
 for(const motion of ['deadbug','birddog']){
  const start=poseFor(motion,0).pose,end=poseFor(motion,1).pose;
  assert.ok(distance(start.lh,end.lh)>.3);near(distance(end.ls,end.lh),SEGMENTS.upperArm+SEGMENTS.forearm);near(distance(end.rp,end.ra),SEGMENTS.thigh+SEGMENTS.shin);assert.ok(distance(start.ra,end.ra)>.3);
  near(distance(start.rh,end.rh),0);near(distance(start.la,end.la),0);
  assert.deepEqual(poseFor(motion,1,1).pose,mirrorPose(end));assert.deepEqual(mirrorPose(mirrorPose(end)),end);
  near(distance(start.hip,end.hip),0);near(distance(start.chest,end.chest),0);
 }
});
test('bench press feet stay on the floor rather than moving up with the bench',()=>{
 for(let frame=0;frame<=20;frame++){const p=poseFor('benchpress',frame/20).pose;near(p.la[1],.08);near(p.ra[1],.08);near(p.lf[1],.05);near(p.rf[1],.05);assert.ok(p.chest[1]>.5);}
});
test('floor press, squat, wall squat and hinge keep their foot contact through the movement',()=>{
 for(const motion of ['floorpress','squat','goblet','ballsquat','hinge']){const first=poseFor(motion,0).pose;for(let frame=1;frame<=20;frame++){const p=poseFor(motion,frame/20).pose;for(const key of ['la','ra','lf','rf'])assert.ok(distance(first[key],p[key])<.015,`${motion} ${key} moved`);}}
});
test('the floor bridge keeps the shoulders supported and the plank remains a still hold',()=>{
 const start=poseFor('bridge',0).pose,end=poseFor('bridge',1).pose;near(distance(start.chest,end.chest),0);assert.ok(end.hip[1]>start.hip[1]);
 assert.deepEqual(poseFor('plank',0).pose,poseFor('plank',1).pose);
 for(const motion of ['plank','pushup'])for(let frame=0;frame<=20;frame++){const p=poseFor(motion,frame/20).pose,ratio=(p.hip[2]-p.la[2])/(p.chest[2]-p.la[2]);near(p.hip[1],p.la[1]+ratio*(p.chest[1]-p.la[1]),.002);}
 const p=poseFor('plank',1).pose;near(p.le[1],.07,.002);near(p.le[2],p.ls[2],.002);
});
test('the ball curl keeps both heels on the ball and the wall squat places feet ahead of the hips',()=>{
 for(let frame=0;frame<=20;frame++){
  const curl=poseFor('ballcurl',frame/20).pose;near(curl.la[1],.54,.02);near(curl.ra[1],.54,.02);
  const squat=poseFor('ballsquat',frame/20).pose;assert.ok(squat.la[2]-squat.hip[2]>.3);near(squat.hip[2],0);
 }
});
test('video coverage is restricted to verified provider embeds with exact exercise matches',()=>{
 const covered=EXERCISES.filter(e=>permittedVideo(e.id));assert.equal(covered.length,8);
 for(const exercise of covered){const video=permittedVideo(exercise.id);assert.equal(video.owner,'National Academy of Sports Medicine (NASM)');assert.equal(video.permission,'provider-embed');assert.match(videoEmbedURL(exercise.id),/^https:\/\/www.youtube-nocookie.com\/embed\/[A-Za-z0-9_-]{11}\?/);assert.ok(!videoEmbedURL(exercise.id).includes('autoplay=1'));assert.equal(MOVEMENT_SOURCES[exercise.id].checkedOn,'2026-11-12');}
 for(const id of ['ball-squat','ball-curl','band-bridge','split','floor-press','not-an-exercise'])assert.equal(videoEmbedURL(id),null);
});

test('the complete animation fits a small phone canvas in front, side and rotated views',()=>{
 for(const exercise of EXERCISES)for(const angle of [0,.5,Math.PI/2,Math.PI,Math.PI*1.5]){
  const w=224,h=260,frame=modelFrame(exercise.motion,angle,w,h);
  for(const side of [0,1])for(let sample=0;sample<=24;sample++){
   const {pose,center}=poseFor(exercise.motion,sample/24,side);
   for(const point of Object.values(pose)){
    const x=point[0]*Math.cos(angle)+point[2]*Math.sin(angle),z=-point[0]*Math.sin(angle)+point[2]*Math.cos(angle);
    const px=frame.offsetX+x*frame.scale,py=frame.offsetY-(point[1]-center)*frame.scale+z*frame.scale*.18;
    assert.ok(px>8&&px<w-8&&py>8&&py<h-8,`${exercise.id} cropped at angle ${angle}`);
   }
  }
 }
});

const kneeAngle=p=>{const a=p.lp.map((v,i)=>v-p.lk[i]),b=p.la.map((v,i)=>v-p.lk[i]);return Math.acos(a.reduce((sum,v,i)=>sum+v*b[i],0)/(Math.hypot(...a)*Math.hypot(...b)))*180/Math.PI;};
test('all 27 exercises have a specific professional reference and the remaining sixteen record their comparison',()=>{
 assert.equal(Object.keys(MOVEMENT_SOURCES).length,EXERCISES.length);
 for(const e of EXERCISES){const source=MOVEMENT_SOURCES[e.id];assert.ok(source?.provider&&source?.changes,e.id);assert.ok(new URL(source.url).pathname.split('/').filter(Boolean).length>=1&&!/exercise-library\/?$/.test(source.url),e.id);assert.equal(source.checkedOn,'2026-11-12');}
 const ids=['squat','band-bridge','row','band-row','floor-press','wall-push','press','calf','wheel','bench','cable-row','lat-pull','leg-press','barbell-rdl','curl','march'];
 for(const id of ids){const source=MOVEMENT_SOURCES[id];assert.equal(source.criteria.length,3,id);assert.ok(['updated','retained'].includes(source.reviewOutcome));assert.match(source.scope,/not professional approval/);}
 for(const id of ['band-row','calf','wheel','leg-press','curl'])assert.ok(MOVEMENT_SOURCES[id].variantNote.length>30,id);
});
test('wall push up keeps hands and feet fixed while the body leans as one line',()=>{
 const start=poseFor('wallpush',0).pose;
 for(let i=0;i<=20;i++){const p=poseFor('wallpush',i/20).pose;for(const key of ['lh','rh','la','ra','lf','rf'])near(distance(start[key],p[key]),0);
  const ratio=(p.hip[1]-p.la[1])/(p.chest[1]-p.la[1]);near(p.hip[2],p.la[2]+ratio*(p.chest[2]-p.la[2]));
 }
});
test('supported calf raise pivots around planted forefeet and keeps hands on the wall',()=>{
 const start=poseFor('calf',0).pose,end=poseFor('calf',1).pose;assert.ok(end.la[1]>start.la[1]+.07);
 for(let i=0;i<=20;i++){const p=poseFor('calf',i/20).pose;for(const key of ['lf','rf','lh','rh'])near(distance(start[key],p[key]),0);near(distance(p.la,p.lf),distance(start.la,start.lf));near(p.lh[2],.55);}
});
test('floor press reaches gentle floor contact at the bottom and remains above the floor',()=>{
 const p=poseFor('floorpress',0).pose;near(p.le[1],.055,.002);near(p.re[1],.055,.002);near(p.lh[0],p.le[0],.002);near(p.lh[2],p.le[2],.002);
 for(let i=0;i<=30;i++){const p=poseFor('floorpress',i/30).pose;assert.ok(p.le[1]>=.05&&p.re[1]>=.05);near(p.chest[1],.15);}
});
test('kneeling rollout keeps straight arms on the wheel and knees anchored',()=>{
 const start=poseFor('wheel',0).pose;
 for(let i=0;i<=20;i++){const p=poseFor('wheel',i/20).pose;for(const side of ['l','r']){near(p[side+'h'][1],.13,.00001);near(distance(p[side+'s'],p[side+'h']),SEGMENTS.upperArm+SEGMENTS.forearm);near(distance(start[side+'k'],p[side+'k']),0);}}
});
test('leg press has supported trunk, an aligned platform and no locked knees',()=>{
 const first=poseFor('legpress',0).pose;near(kneeAngle(first),90,3);
 for(let i=0;i<=20;i++){const p=poseFor('legpress',i/20).pose;near(distance(first.chest,p.chest),0);near(distance(first.hip,p.hip),0);assert.ok(kneeAngle(p)<155);assert.ok(kneeAngle(p)>85);const {platform,backrest}=equipmentGeometry('legpress',p);assert.equal(backrest.length,2);const a=platform[0],b=platform[3];const slope=(b[2]-a[2])/(b[1]-a[1]);for(const key of ['la','lf'])near(p[key][2],a[2]+slope*(p[key][1]-a[1]),.025);}
});
test('row starts below the shoulders, pulldown finishes at the upper chest and marching pumps opposite arms',()=>{
 const row=poseFor('row',0).pose;near(row.lh[2],row.ls[2]);near(row.lh[0],row.ls[0]);assert.ok(poseFor('row',1).pose.le[2]<row.ls[2]);
 const lat=poseFor('latpull',1).pose;near(lat.lh[1],lat.chest[1]+.06);assert.ok(lat.lh[2]>lat.head[2]+.1);assert.equal(equipmentGeometry('latpull',lat).thighpad.length,2);
 for(const side of [0,1]){const p=poseFor('march',1,side).pose;assert.ok(distance(p.ls,p.lh)<.64&&distance(p.rs,p.rh)<.64);assert.ok(side?p.rh[2]<0&&p.lh[2]>0:p.lh[2]<0&&p.rh[2]>0);}
});

test('human surfaces and full equipment stay finite and fit the phone camera in every movement',()=>{
 for(const exercise of EXERCISES)for(const t of [0,.5,1]){
  const {pose,center}=poseFor(exercise.motion,t),surfaces=humanSurfaces(pose,exercise.motion);
  assert.ok(surfaces.length>1000);
  for(const face of surfaces){assert.ok(face.normal.every(Number.isFinite));for(const point of face.points){assert.ok(point.every(Number.isFinite));assert.ok(point[1]>=0);}}
  const points=[...surfaces.flatMap(face=>face.points),...Object.values(equipmentGeometry(exercise.motion,pose)).flat()];
  for(const angle of [0,.5,Math.PI/2,Math.PI,Math.PI*1.5]){const w=224,h=260,frame=modelFrame(exercise.motion,angle,w,h);for(const point of points){const x=point[0]*Math.cos(angle)+point[2]*Math.sin(angle),z=-point[0]*Math.sin(angle)+point[2]*Math.cos(angle),px=frame.offsetX+x*frame.scale,py=frame.offsetY-(point[1]-center)*frame.scale+z*frame.scale*.18;assert.ok(px>3&&px<w-3&&py>3&&py<h-3,`${exercise.id} human or equipment cropped`);}}
 }
});

test('human facial landmarks face the floor in prone movements and upwards in supine movements',()=>{
 for(const motion of ['wheel','birddog','pushup','plank','floorpress','deadbug','bridge'])for(const t of [0,.5,1]){const p=poseFor(motion,t).pose,details=humanSurfaces(p,motion).filter(f=>f.material==='detail').flatMap(f=>f.points),faceY=details.reduce((sum,v)=>sum+v[1],0)/details.length;assert.ok(['wheel','birddog','pushup','plank'].includes(motion)?faceY<p.head[1]:faceY>p.head[1],motion);}
});
