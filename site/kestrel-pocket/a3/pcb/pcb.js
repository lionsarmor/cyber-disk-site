'use strict';
(() => {
const $ = (id) => document.getElementById(id);
const canvas=$('scene'), stage=canvas.parentElement, status=$('status');
const options=[...document.querySelectorAll('[data-view]')];
function assembly(){
 return {root:new THREE.Group(),hardware:new THREE.Group(),board:new THREE.Group(),outline:[],bounds:{}};
}
const carrier=assembly(), reader=assembly(), rig=new THREE.Group();
const point=(x,y,z)=>new THREE.Vector3(x,y,z);
const state={view:'front',frame:0};
const poses={
 front:{dir:[-.30,-.72,1]}, rear:{dir:[.28,-.66,-1]},
 pico:{dir:[-.34,-.68,-1],ref:'A1'},
 ports:{dir:[-1.05,-.41,-.66],refs:['J3','J4']},
 contacts:{dir:[.58,-.20,-1],reader:true}
};
let renderer,scene,camera,controls,key,fill,rim;
const color=(hex)=>new THREE.Color(hex).convertSRGBToLinear();
function invalidate(){
 if(!state.frame)state.frame=requestAnimationFrame(draw);
}
function draw(){
 state.frame=0;
 const ray=camera.position.clone().sub(controls.target).normalize();
 const right=point(1,0,0).applyQuaternion(camera.quaternion);
 const up=point(0,1,0).applyQuaternion(camera.quaternion);
 key.position.copy(ray).multiplyScalar(170).addScaledVector(right,-95).addScaledVector(up,100);
 fill.position.copy(ray).multiplyScalar(100).addScaledVector(right,100).addScaledVector(up,-67);
 rim.position.copy(ray).multiplyScalar(-180).addScaledVector(up,75);
 const distance=camera.position.distanceTo(controls.target);
 camera.near=Math.max(.3,distance*.045);camera.far=distance+350;camera.updateProjectionMatrix();
 renderer.render(scene,camera);
}
function makeStudio(){
 const environment=new THREE.Scene();
 environment.background=new THREE.Color(.09,.095,.10);
 function strip(x,y,z,w,h,intensity,tint){
   const col=new THREE.Color(...tint).multiplyScalar(intensity*1.25);
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));
   mesh.position.set(x,y,z);mesh.lookAt(0,0,0);environment.add(mesh);
 }
 strip(-4,4,6,4,7,3.3,[1,.98,.95]);strip(4,1.2,4,1,8,3.1,[.93,.96,1]);strip(4,5,-5,6,3,2.7,[.94,.97,1]);strip(-4,-3,-5,4,4,1.7,[1,.94,.82]);
 const generator=new THREE.PMREMGenerator(renderer);scene.environment=generator.fromScene(environment,.028).texture;generator.dispose();
 environment.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
}
function lighting(){
 scene.add(new THREE.HemisphereLight(0xfff7e8,0x7a8a83,.43));
 key=new THREE.DirectionalLight(0xfff5e4,1.3);
 key.castShadow=true;key.shadow.mapSize.set(2048,2048);
 Object.assign(key.shadow.camera,{left:-104,right:104,top:104,bottom:-104,near:8,far:390});
 key.shadow.normalBias=.095;key.shadow.bias=-.00013;
 fill=new THREE.DirectionalLight(0xeaf4ff,.56);rim=new THREE.DirectionalLight(0xfff1db,.55);
 scene.add(key,fill,rim);makeStudio();
}
function material(name,meta){
 const finishes={
 substrate:['#0f3827',.14,.57],edge:['#ac9369',.12,.79],copper:['#22553d',.22,.48],
 pad:['#d2a648',.76,.33],via:['#ab964d',.55,.43],spring:['#efbf54',.88,.27],
 soldermask:['#003c2a',.12,.49],silkscreen:['#f4eddd',.04,.66]
 };
 const f=finishes[name];
 let m;
 if(f){m=new THREE.MeshStandardMaterial({color:color(f[0]),metalness:f[1],roughness:f[2],side:THREE.DoubleSide,envMapIntensity:.83});}
 else{
   const raw=meta.materials[Number(name.slice(1))]||[.4,.41,.42];
   const c=new THREE.Color(...raw.slice(0,3));const peak=Math.max(...raw.slice(0,3)), low=Math.min(...raw.slice(0,3));
   const metallic=peak>.36 && (low>.23||raw[0]>.65&&raw[1]>.34);
   m=new THREE.MeshStandardMaterial({color:c,metalness:metallic?.76:.09,roughness:metallic?.34:.56,side:THREE.DoubleSide,envMapIntensity:.83});
 }
 if(name==='soldermask'){m.transparent=true;m.opacity=.62;m.depthWrite=false;}
 return m;
}
function build(assembly,meta,bytes){
 for(const g of meta.groups){
   const geom=new THREE.BufferGeometry(),quantized=new Int16Array(bytes,g.p,g.n*3),pos=new Float32Array(g.n*3);
   for(let i=0;i<pos.length;i++)pos[i]=quantized[i]*meta.scale;
   geom.setAttribute('position',new THREE.BufferAttribute(pos,3));
   geom.setAttribute('normal',new THREE.BufferAttribute(new Int8Array(bytes,g.d,3*g.n),3,true));
   geom.setIndex(new THREE.BufferAttribute(g.wide?new Uint32Array(bytes,g.i,g.c):new Uint16Array(bytes,g.i,g.c),1));
   geom.computeBoundingSphere();
   const mesh=new THREE.Mesh(geom,material(g.name,meta));
   const comp=g.name.startsWith('m')||g.name==='spring';
   mesh.castShadow=comp||g.name==='substrate';mesh.receiveShadow=g.name!=='silkscreen';
   if(g.name==='soldermask')mesh.renderOrder=3;
   (comp?assembly.hardware:assembly.board).add(mesh);
 }
 assembly.bounds=meta.bounds;
 for(const [lo,hi] of Object.values(meta.bounds)) assembly.outline.push(...corners(lo,hi));
 meta.outline.forEach(([x,y])=>assembly.outline.push(point(x,y,0),point(x,y,1.6)));
 assembly.root.add(assembly.board,assembly.hardware);
 rig.add(assembly.root);
}
function corners(lo,hi){
 const res=[];for(const x of [lo[0],hi[0]])for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])res.push(point(x,y,z));return res;
}
function size(){
 const rect=stage.getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
 camera.aspect=rect.width/Math.max(rect.height,1);camera.updateProjectionMatrix();
}
function select(view,record){
 const pose=poses[view]||poses.front;state.view=poses[view]?view:'front';
 options.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 const detail=!!pose.ref||!!pose.refs||!!pose.reader;const wide=camera.aspect>1.15;
 let roll=wide?(state.view==='contacts'?-.97:detail?-.18:.22):(state.view==='pico'?.55:-.14);
 if(state.view==='rear')roll=-roll;
 if(state.view==='ports')roll=wide?-.96:-.20;
 rig.rotation.z=roll;rig.updateMatrixWorld(true);
 const rot=rig.quaternion,aim=point(...pose.dir).applyQuaternion(rot).normalize();
 const vertical=point(0,1,0),right=vertical.clone().cross(aim).normalize(), up=aim.clone().cross(right);
 let pts;
 if(pose.ref||pose.refs){
   pts=(pose.refs||[pose.ref]).flatMap(ref=>{const [lo,hi]=carrier.bounds[ref];return corners(lo.map(n=>n-2),hi.map(n=>n+2));});
 } else if(pose.reader && reader.root.visible){
   pts=reader.outline;
 } else if(pose.reader) {
   const [lo,hi]=carrier.bounds.J14;
   pts=corners(lo.map(n=>n-6),hi.map(n=>n+6));
 } else {
   pts=reader.root.visible?carrier.outline.concat(reader.outline):carrier.outline;
 }
 pts=pts.map(v=>v.clone().applyQuaternion(rot));
 const extent=(axis)=>(pts.map(p=>p.dot(axis)));
 const mid=(xs)=>(Math.min(...xs)+Math.max(...xs))/2;
 const target=point(0,0,0).addScaledVector(right,mid(extent(right))).addScaledVector(up,mid(extent(up))).addScaledVector(aim,mid(extent(aim)));
 const tan=Math.tan(camera.fov*Math.PI/360), margin=detail?.84:.91;
 let distance=Math.max(...pts.map(p=>{
   const q=p.clone().sub(target);
   return q.dot(aim)+Math.max(Math.abs(q.dot(up))/tan,Math.abs(q.dot(right))/(tan*camera.aspect))/margin;
 }));
 // Recenter using projected margins so the near side of a tilted PCB cannot push it off centre.
 for(let i=0;i<3;i++){
   const sx=[],sy=[];
   for(const p of pts){
     const q=p.clone().sub(target), depth=distance-q.dot(aim);
     sx.push(q.dot(right)/(depth*tan*camera.aspect));sy.push(q.dot(up)/(depth*tan));
   }
   const mx=mid(sx),my=mid(sy);
   target.addScaledVector(right,mx*distance*tan*camera.aspect).addScaledVector(up,my*distance*tan);
   const used=Math.max((Math.max(...sx)-Math.min(...sx))/2,(Math.max(...sy)-Math.min(...sy))/2);
   distance*=Math.max(.82,Math.min(1.16,used/margin));
 }
 controls.target.copy(target);camera.up.copy(vertical);camera.position.copy(target).addScaledVector(aim,distance);
 controls.update();invalidate();
 if(record){const url=new URL(location.href);url.hash=state.view;history.replaceState(null,'',url);}
}
function zoom(factor){
 const rel=camera.position.clone().sub(controls.target);const dist=Math.max(controls.minDistance,Math.min(controls.maxDistance,rel.length()*factor));
 camera.position.copy(controls.target).add(rel.setLength(dist));controls.update();invalidate();
}
function move(dx,dy){
 const rel=camera.position.clone().sub(controls.target), spherical=new THREE.Spherical().setFromVector3(rel);
 spherical.theta+=dx;spherical.phi+=dy;spherical.makeSafe();
 camera.position.copy(controls.target).add(point(0,0,0).setFromSpherical(spherical));controls.update();invalidate();
}
async function loadAssembly(group,name){
 const [j,r]=await Promise.all([fetch(name+'.json'),fetch(name+'.gz')]);
 if(!r.ok||!j.ok)throw Error('mesh response failed');
 const meta=await j.json();let bytes=await r.arrayBuffer();
 if(new Uint8Array(bytes,0,1)[0]===31){
   const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
   bytes=await new Response(stream).arrayBuffer();
 }
 build(group,meta,bytes);
}
function pickView(view,record){
 const readerView=view==='contacts'||view==='reader';
 reader.root.visible=readerView;
 $('reader-module').checked=readerView;
 select(readerView?'contacts':view,record);
}
async function start(){
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(1.8,window.devicePixelRatio||1));renderer.outputEncoding=THREE.sRGBEncoding;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.5,650);
 camera.position.set(0,0,300);controls=new THREE.OrbitControls(camera,canvas);
 controls.enablePan=true;controls.enableDamping=false;controls.minDistance=7;controls.maxDistance=550;controls.zoomSpeed=.86;controls.rotateSpeed=.85;
 lighting();controls.addEventListener('change',invalidate);size();
 await Promise.all([loadAssembly(carrier,'geometry'),loadAssembly(reader,'reader')]);
 scene.add(rig);pickView(location.hash.slice(1),false);status.hidden=true;
 new ResizeObserver(()=>{size();select(state.view,false);}).observe(stage);
 options.forEach(b=>b.addEventListener('click',()=>pickView(b.dataset.view,true)));
 window.addEventListener('hashchange',()=>pickView(location.hash.slice(1),false));
 $('plus').onclick=()=>zoom(.78);$('minus').onclick=()=>zoom(1.28);$('reset').onclick=()=>select(state.view,false);
 $('components').onchange=(e)=>{carrier.hardware.visible=reader.hardware.visible=e.target.checked;invalidate();};
 $('reader-module').onchange=e=>{
   reader.root.visible=e.target.checked;
   select(state.view,false);
 };
 canvas.addEventListener('keydown',e=>{switch(e.key){
 case '+':case '=':zoom(.82);break;case '-':zoom(1.22);break;
 case 'ArrowLeft':move(-.1,0);break;case 'ArrowRight':move(.1,0);break;case 'ArrowUp':move(0,-.1);break;case 'ArrowDown':move(0,.1);break;default:return;
 }e.preventDefault();});
}
start().catch(error=>{
 console.error('PCB viewer:',error);status.textContent='Your browser could not display the 3D board.';
 const a=document.createElement('a');a.href='../';a.textContent='See the PCB renders';a.target='_top';status.appendChild(a);
});
})();
