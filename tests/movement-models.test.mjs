import test from 'node:test';
import assert from 'node:assert/strict';
import {poseFor,modelFrame} from '../src/model.js';
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
