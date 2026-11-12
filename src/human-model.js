// Original stylised human surfaces, fitted to the authored movement skeleton.
// The skeleton remains the source of movement. These surfaces add appearance only.
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,n)=>a.map(v=>v*n);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=(a,fallback=[0,1,0])=>{const n=Math.hypot(...a);return n>1e-8?mul(a,1/n):fallback;};
const mix=(a,b,t)=>add(a,mul(sub(b,a),t));
const RINGS=16;
function basis(axis,preferred){const along=unit(axis),right=unit(sub(preferred,mul(along,dot(preferred,along))),Math.abs(along[0])<.8?unit(cross(along,[1,0,0])):unit(cross(along,[0,0,1])));return {along,right,front:unit(cross(right,along))};}
export function humanSurfaces(p,motion){
 const faces=[],up=unit(sub(p.chest,p.hip)),right=mul(unit(sub(p.rs,p.ls)),['wheel','birddog','pushup','plank'].includes(motion)?-1:1),front=unit(cross(right,up));
 function surface(rings,material){
  for(let row=0;row<rings.length-1;row++)for(let i=0;i<RINGS;i++){
   const j=(i+1)%RINGS,points=[rings[row][i],rings[row][j],rings[row+1][j],rings[row+1][i]];
   faces.push({points,normal:unit(cross(sub(points[3],points[0]),sub(points[1],points[0]))),material});
  }
 }
 function tube(a,b,profile,material,preferred=right,depth=1){
  const axes=basis(sub(b,a),preferred),rings=profile.map(([t,radius])=>Array.from({length:RINGS},(_,i)=>{const angle=i/RINGS*Math.PI*2;return add(mix(a,b,t),add(mul(axes.right,Math.cos(angle)*radius),mul(axes.front,Math.sin(angle)*radius*depth)));}));
  surface(rings,material);
 }
 function ellipsoid(center,radii,material,axes={right,along:up,front}){
  const rings=Array.from({length:9},(_,j)=>{const latitude=-Math.PI/2+j/8*Math.PI;return Array.from({length:RINGS},(_,i)=>{const longitude=i/RINGS*Math.PI*2;return add(center,add(mul(axes.along,Math.sin(latitude)*radii[1]),add(mul(axes.right,Math.cos(latitude)*Math.cos(longitude)*radii[0]),mul(axes.front,Math.cos(latitude)*Math.sin(longitude)*radii[2]))));});});
  surface(rings,material);
 }
 const shoulder=mul(add(p.ls,p.rs),.5),pelvis=mul(add(p.lp,p.rp),.5);
 tube(add(p.hip,mul(up,-.055)),add(shoulder,mul(up,.015)),[[0,.16],[.14,.175],[.37,.15],[.68,.205],[.90,.235],[1,.19]],'shirt',right,.66);
 ellipsoid(add(pelvis,mul(up,-.005)),[.18,.115,.12],'shorts');
 tube(p.chest,add(p.head,mul(up,-.085)),[[0,.067],[1,.057]],'skin',right,.86);
 for(const side of ['l','r']){
  const s=p[side+'s'],e=p[side+'e'],h=p[side+'h'],hip=p[side+'p'],k=p[side+'k'],a=p[side+'a'],toe=p[side+'f'];
  ellipsoid(s,[.079,.08,.075],'shirt');
  tube(s,e,[[0,.07],[.35,.081],[.70,.068],[1,.052]],'skin');
  tube(s,mix(s,e,.36),[[0,.083],[.7,.085],[1,.077]],'shirt');
  ellipsoid(e,[.052,.053,.052],'skin');
  tube(e,h,[[0,.052],[.3,.061],[.7,.047],[1,.034]],'skin');
  // The palm ends at the wrist target, so equipment contact stays visible.
  const handAxis=basis(sub(h,e),right);
  ellipsoid(mix(e,h,.94),[.048,.070,.030],'skin',handAxis);
  ellipsoid(add(mix(e,h,.90),mul(handAxis.right,side==='l'?.037:-.037)),[.018,.038,.024],'skin',handAxis);
  tube(hip,k,[[0,.101],[.3,.116],[.66,.097],[1,.067]],'skin');
  tube(hip,mix(hip,k,.52),[[0,.116],[.5,.124],[1,.108]],'shorts');
  ellipsoid(k,[.068,.067,.064],'skin');
  tube(k,a,[[0,.062],[.3,.081],[.62,.064],[1,.035]],'skin');
  const footAxis=basis(sub(toe,a),right),footCenter=mix(a,toe,.55);
  // A low shoe sits above each planted contact point, including floor poses.
  const lift=[0,Math.min(a[1],toe[1])<.1?-.025:.032,0];
  ellipsoid(add(footCenter,lift),[.065,Math.hypot(...sub(toe,a))*.62,.043],'shoe',footAxis);
 }
 ellipsoid(p.head,[.091,.119,.086],'skin');
 // A short hair cap and restrained facial landmarks clarify facing direction.
 ellipsoid(add(p.head,add(mul(up,.044),mul(front,-.024))),[.095,.086,.080],'hair');
 ellipsoid(add(p.head,mul(front,.087)),[.019,.025,.027],'skin');
 for(const sign of [-1,1]){
  ellipsoid(add(p.head,mul(right,sign*.089)),[.016,.032,.021],'skin');
  ellipsoid(add(p.head,add(mul(right,sign*.032),add(mul(up,.023),mul(front,.080)))),[.010,.006,.006],'detail');
 }
 ellipsoid(add(p.head,add(mul(up,-.040),mul(front,.079))),[.023,.0035,.006],'detail');
 // Flatten small contact surfaces at the floor without moving the skeleton.
 for(const face of faces)for(const point of face.points)point[1]=Math.max(.002,point[1]);
 return faces;
}
const parseHex=value=>{const hex=value.replace('#','');return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));};
export function drawHuman(ctx,faces,project,angle,colors){
 const materials={shirt:colors.torso,shorts:colors.weight,skin:'#BC896D',hair:'#35312C',shoe:colors.joint,detail:'#4A3028'};
 const light=unit([-.45,.8,.65]),view=unit([-Math.sin(angle),.18,Math.cos(angle)]),rgbMaterials=Object.fromEntries(Object.entries(materials).map(([key,color])=>[key,parseHex(color)]));
 const projected=faces.filter(face=>dot(face.normal,view)>0).map(face=>{const points=face.points.map(project),normal=face.normal;return {...face,points,depth:points.reduce((sum,p)=>sum+p[2],0)/points.length,light:.60+.40*Math.max(0,dot(normal,light))};}).sort((a,b)=>a.depth-b.depth);
 for(const face of projected){
  const rgb=rgbMaterials[face.material],shade=face.light;
  ctx.beginPath();ctx.moveTo(face.points[0][0],face.points[0][1]);for(let i=1;i<face.points.length;i++)ctx.lineTo(face.points[i][0],face.points[i][1]);ctx.closePath();
  const color=`rgb(${rgb.map(v=>Math.round(v*shade)).join(',')})`;ctx.fillStyle=color;ctx.fill();
  // A fine same-colour seam removes gaps between neighbouring projected faces.
  ctx.strokeStyle=color;ctx.lineWidth=.55;ctx.lineJoin='round';ctx.stroke();
 }
}
