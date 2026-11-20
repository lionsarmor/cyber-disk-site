// Mechanical coordinates use the carrier datum. Positive Z points toward the keyboard.
async function pocketParts(rig) {
  const layers = {};
  for (const name of ['cm','nano','face','panel','keys','rear','pico','management','input','disk','battery','paddleSwitches']) {
    layers[name] = new THREE.Group();
    rig.add(layers[name]);
  }
  const mat=(hex,metalness=0,roughness=.65)=>new THREE.MeshStandardMaterial({color:new THREE.Color(hex).convertSRGBToLinear(),metalness,roughness});
  const charcoal=mat('#262b2a'), silver=mat('#c4c6bd',.66,.32), gold=mat('#bd9855',.48), pcb=mat('#245a46');
  function put(parent,geo,finish,x,y,z){
    const m=new THREE.Mesh(geo,finish);m.position.set(x-52,158.1-y,z);
    m.castShadow=m.receiveShadow=true;parent.add(m);return m;
  }
  function box(p,x,y,z,w,h,t,m){return put(p,new THREE.BoxGeometry(w,h,t),m,x,y,z+t/2);}
  function plate(p,x,y,z,w,h,t,r,holes,m){
    const path=new THREE.Shape(), a=w/2,b=h/2;
    path.moveTo(-a+r,-b);path.lineTo(a-r,-b);path.quadraticCurveTo(a,-b,a,-b+r);
    path.lineTo(a,b-r);path.quadraticCurveTo(a,b,a-r,b);path.lineTo(-a+r,b);path.quadraticCurveTo(-a,b,-a,b-r);
    path.lineTo(-a,-b+r);path.quadraticCurveTo(-a,-b,-a+r,-b);
    for(const [hx,hy,hr] of holes){const h=new THREE.Path();h.absarc(hx,-hy,hr,0,Math.PI*2,true);path.holes.push(h);}
    return put(p,new THREE.ExtrudeGeometry(path,{depth:t,bevelEnabled:false,curveSegments:12}),m,x,y,z);
  }
  function decal(p,x,y,z,w,h,text,ink='#eeeece',background=null,rot=0){
    const c=document.createElement('canvas');c.width=512;c.height=Math.max(40,Math.round(512*h/w));const ctx=c.getContext('2d');
    if(background){ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.font='bold '+Math.floor(c.height*.81)+'px monospace';
    ctx.fillText(text,c.width/2,c.height*.53,c.width*.98);
    const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;
    const mesh=put(p,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),x,y,z);
    mesh.rotation.z=rot;mesh.renderOrder=6;mesh.castShadow=false;return mesh;
  }
  // Package positions traced from the Milk-V top view. Heights are allowances.
  const cm=layers.cm, z=17.24, top=z+1.6;
  const holes=[[-24,-16.5,1.35],[24,-16.5,1.35],[-24,16.5,1.35],[24,16.5,1.35]];
  plate(cm,33,146.5,z,55,40,1.6,2.5,holes,mat('#e9e6db'));
  for(const [dx,dy,r] of holes){
    put(cm,new THREE.RingGeometry(r,2.38,36),gold,33+dx,146.5+dy,top+.012);
  }
  // Dimensions below use the 55 × 40 mm module's lower-left and upper edges.
  function chip(x,y,w,h,t,m){return box(cm,5.5+x,126.5+y,top,w,h,t,m);}
  chip(30.4,23.4,17.9,18,1.15,charcoal);
  chip(30.4,23.4,16.8,16.9,1.55,silver);
  decal(cm,35.9,149.9,top+1.57,11.7,2.5,'STARFIVE','#444a46');
  decal(cm,35.9,152.5,top+1.57,9.2,1.8,'JH7110','#444a46');
  chip(7.5,23,10.2,15.5,1.2,charcoal);
  chip(40.5,6.2,12.4,12,1.75,silver);decal(cm,46,132.7,top+1.77,9,1.8,'RF MODULE','#64665e');
  for(const [x,y,w,h] of [[47.4,25,7,7],[31.2,9,5.2,5.4],[11.7,8,4,4],[48,31.7,3.8,3.2],[50.8,19.7,2.2,2.6]])chip(x,y,w,h,1.1,charcoal);
  for(const [x,y] of [[5,11],[17,11],[25,11],[48,17],[41,34],[9,34]]){
    for(let i=0;i<4;i++)chip(x+i*.98,y+(i%2)*1.05,.58,1.1,.38,i%2?silver:charcoal);
  }
  decal(cm,23,149.5,top+.025,14,4.4,'milk·v','#171b1a',null,-Math.PI/2);
  decal(cm,35,163.2,top+.025,21,2.25,'MARS CM  V1.0','#202522');
  const tang=layers.nano;
  for(const x of [66,86.32]){
    box(tang,x,138.13,10.10,2.45,50.6,2.54,charcoal);
    for(let i=0;i<20;i++){
      const y=114+i*2.54;
      box(tang,x,y,5.95,.62,.62,8.92,silver);
      put(tang,new THREE.RingGeometry(.49,.87,24),gold,x,y,14.258);
    }
  }
  decal(tang,77.03,125,15.67,8.3,2.05,'GOWIN','#e3e5dd',null,Math.PI/2);
  decal(tang,76.62,135.72,15.08,4.1,1.18,'BL616','#dcded5',null,Math.PI/2);
  decal(tang,83.93,143.75,14.28,17,1.08,'TANG NANO 20K','#fffde9',null,Math.PI/2);
  const [shell,buffer]=await Promise.all([fetch('../../a1/assembly/assembly.json').then(r=>r.json()),fetch('../../a1/assembly/assembly.bin').then(r=>r.arrayBuffer())]);
  const face=layers.face,keys=layers.keys,panel=layers.panel,rear=layers.rear;
  const classOf=name=>{
    if(/^Front_faceplate|^Removable_keyboard_insert/.test(name))return face;
    if(/^CardKB|^Keyboard_key/.test(name))return keys;
    if(/^Adafruit|^LCD_active|^microSD|^Game_button|^Dpad|^Menu_|^Type_Lock/.test(name))return panel;
    if(/^Release_|^Flexure|^Rear_|^Back_frame|^Seat_/.test(name))return rear;
    if(/^Disk_/.test(name))return layers.disk;
    if(/^Battery_/.test(name))return layers.battery;
    return null;
  };
  const shellMats=new Map();
  for(const part of shell.parts){
    const parent=classOf(part.name);if(!parent)continue;
    const g=new THREE.BufferGeometry(),q=new Int16Array(buffer,part.p,3*part.v),n=new Int8Array(buffer,part.n,3*part.v);
    const pos=new Float32Array(q.length),norm=new Float32Array(q.length);
    for(let i=0;i<q.length;i+=3){
      pos[i]=q[i]/100-52; pos[i+1]=158.1-q[i+1]/100; pos[i+2]=-q[i+2]/100;
      norm[i]=n[i]/127;norm[i+1]=-n[i+1]/127;norm[i+2]=-n[i+2]/127;
    }
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(norm,3));
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer,part.i,3*part.t),1));
    const key=part.color.join(',');
    if(!shellMats.has(key))shellMats.set(key,new THREE.MeshStandardMaterial({color:new THREE.Color(...part.color),metalness:.04,roughness:.66}));
    let finish=shellMats.get(key);
    if(part.name==='Front_faceplate') finish=mat('#cfb593',.02,.76);
    if(part.name==='Rear_lower_cover'||part.name.startsWith('Rear_receiver')||part.name.startsWith('Back_frame'))finish=mat('#383c3d',.035,.74);
    if(part.name.startsWith('Disk_body'))finish=mat('#a8543d',.07,.62);
    if(part.name==='Dpad_cap'||part.name==='Removable_keyboard_insert')finish=mat('#282b2b');
    if(part.name.startsWith('Keyboard_key'))finish=mat('#5c5344');
    if(part.name==='CardKB_U035B_PCB_plan_allowance')finish=mat('#d1c7ac');
    if(part.name.startsWith('Game_button'))finish=mat('#bf592e',.04,.50);
    const mesh=new THREE.Mesh(g,finish);mesh.name=part.name;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);
  }
  decal(face,50,65,24.82,35,4.9,'KESTREL POCKET','#3e3e36');
  decal(panel,54,37,22.55,49,35,'FLY.','#b7f1c8','#1c3634');
  for(const [l,x,y] of [['Y',74,84],['X',84,75],['A',94,84],['B',84,93]])decal(panel,x,y,26.03,5,3.6,l);
  for(const [l,x] of [['SELECT',43],['START',57]])decal(face,x,97.4,24.82,9,1.8,l,'#383b38');
  decal(face,73.5,110.2,24.82,21,2.1,'TYPE / LOCK','#383b38');
  // Outward-facing artwork on the back of the seated disk.
  for(const [text,y,w,h] of [['CYBER DISK',25,61,8],['RODDY.WORLD',36,35,3.5]]){
    const label=decal(layers.disk,52,y,-6.45,w,h,text,'#46392d');label.rotation.y=Math.PI;
  }
  const rows=['1234567890-=','QWERTYUIOP[]',"ASDFGHJKL;'","ZXCVBNM,./",['FN','SH','ALT','SPACE','RET']];
  rows.forEach((row,i)=>Array.from(row).forEach((letter,j)=>{
    const x=i===4?[13.5,20.5,30,54,87][j]:24.5+j*6+(12-row.length)*1.8;
    decal(keys,x,135.5+i*9.9,24.88,3.4,1.65,letter,'#fff8df');
  }));
  for(const x of [10.4,93.6]){
    for(let i=0;i<6;i++)box(rear,x,124+i*2.05,-19.92,8,.75,.33,mat('#525a59'));
  }
  // Through-hole control PCB proposal. Switch centres share the moulded cap datums.
  const input=layers.input;
  plate(input,52.5,85,16.7,94,29,1.6,2.5,[[-43,-11,1.15],[43,-11,1.15],[-43,11,1.15],[43,11,1.15]],pcb);
  const locations=[[22,79.5],[22,88.5],[17.5,84],[26.5,84],[74,84],[84,75],[94,84],[84,93],[46,92],[56,92]];
  for(const [x,y] of locations){
    box(input,x,y,18.3,4.5,4.5,2.55,silver);
    plate(input,x,y,20.85,2.8,2.8,2.7,1.25,[],charcoal);
    for(const d of [-1,1])for(const e of [-1,1])box(input,x+d*2.45,y+e*1.6,15.6,.5,.5,2.7,silver);
  }
  box(input,51,83.4,18.3,34.4,7.15,3.05,charcoal);
  for(let i=0;i<14;i++)for(const sign of [-1,1])box(input,34.49+i*2.54,83.4+sign*3.81,15.95,.42,.66,3.5,silver);
  decal(input,51,83.4,21.38,24,2.4,'MCP23017');
  decal(input,50,74.2,18.34,30,2.3,'INPUT / FIT STUDY');
  for(const x of [10.4,93.6]){
    box(layers.paddleSwitches,x,122,-15.9,5.8,5.8,3.3,charcoal);
    box(layers.paddleSwitches,x,122,-17.1,3,3,1.2,silver);
  }
  plate(layers.management,50.48,193.275,12.64,66.56,35.55,1.6,1.5,[],mat('#7b8074'));
  decal(layers.management,50.48,193,14.28,49,3,'MANAGEMENT / ENVELOPE');
  const pico=layers.pico;
  plate(pico,40.1,192.9,-12.7,51,21,1.6,1.3,[],pcb);
  box(pico,20,192.9,-15.4,7.4,7.7,2.7,silver);
  box(pico,40,192.9,-13.7,7,7,1,charcoal);
  for(const y of [184.01,201.79])for(let i=0;i<20;i++)box(pico,15.99+i*2.54,y,-12.95,.65,.65,7.2,gold);
  return {layers,box,plate,mat,decal};
}
