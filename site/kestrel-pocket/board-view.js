/* KiCad placement inspector, dimensions in mm. Component envelopes are illustrative. */
(async () => {
  const host = document.getElementById('board-view');
  if (!host) return;
  const status = document.getElementById('board-status');
  const reset = document.getElementById('board-reset');
  const modelsToggle = document.getElementById('board-components');
  let renderer;
  let controls;
  try {
    const response = await fetch(host.dataset.model || './board-view.json');
    if (!response.ok) throw new Error('Placement data could not be loaded');
    const board = await response.json();
    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const canvas = renderer.domElement;
    canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', '3D PCB placement. Drag to rotate, right drag to pan, scroll or pinch to zoom. Press Home to reset.');
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const bounds = new THREE.Box2().setFromPoints(board.outline.map(([x,y]) => new THREE.Vector2(x,y)));
    const size = bounds.getSize(new THREE.Vector2());
    const center = bounds.getCenter(new THREE.Vector2());
    const world = ([x,y]) => new THREE.Vector2(x - center.x, center.y - y);
    const outline = new THREE.Shape(board.outline.map(world));
    for (const pad of board.pads) {
      if (!pad.drill[0]) continue;
      const p = world(pad.xy);
      const hole = new THREE.Path();
      hole.absellipse(p.x, p.y, pad.drill[0]/2, pad.drill[1]/2, 0, Math.PI*2, true, pad.rotation*Math.PI/180);
      outline.holes.push(hole);
    }
    // KiCad XY is down the page, while the model's +Y is up.
    function faceTexture(side) {
      const sheet = document.createElement('canvas');
      const scale = Math.min(16, 2048 / Math.max(size.x,size.y));
      sheet.width = Math.ceil(size.x*scale);
      sheet.height = Math.ceil(size.y*scale);
      const ctx = sheet.getContext('2d');
      ctx.fillStyle='#15694f';
      ctx.fillRect(0,0,sheet.width,sheet.height);
      ctx.scale(sheet.width/size.x,sheet.height/size.y);
      ctx.translate(-bounds.min.x,-bounds.min.y);
      ctx.lineJoin='round';
      ctx.lineCap='round';
      for(const zone of (board.zones || []).filter(z=>z.side===side)){
        ctx.beginPath();
        for(const loop of zone.loops){
          ctx.moveTo(...loop[0]);for(const p of loop.slice(1))ctx.lineTo(...p);ctx.closePath();
        }
        ctx.fillStyle='#247656';ctx.fill('evenodd');
      }
      for(const track of board.tracks.filter(t => t.side===side)){
        ctx.beginPath(); ctx.moveTo(...track.a); ctx.lineTo(...track.b);
        ctx.lineWidth=track.width; ctx.strokeStyle='#368568'; ctx.stroke();
      }
      for(const pad of board.pads.filter(p => p.plated)){
        const [w,h] = pad.size;
        ctx.save(); ctx.translate(...pad.xy); ctx.rotate(-pad.rotation*Math.PI/180);
        ctx.fillStyle='#e3c67d';
        if (/rect/i.test(pad.shape)) ctx.fillRect(-w/2,-h/2,w,h);
        else {ctx.beginPath(); ctx.ellipse(0,0,w/2,h/2,0,0,2*Math.PI); ctx.fill();}
        ctx.restore();
      }
      for(const item of board.silk.filter(s => s.side === side)){
        ctx.save();
        ctx.strokeStyle=ctx.fillStyle='#e5ebdb';
        if(item.text){
          ctx.translate(...item.position); ctx.rotate(-item.rotation*Math.PI/180);
          if(side==='bottom') ctx.scale(-1,1);
          ctx.font='600 '+item.height*1.22+'px monospace';
          ctx.textAlign=item.align<0?'left':item.align>0?'right':'center';
          ctx.textBaseline='middle'; ctx.fillText(item.text,0,0);
        } else {
          ctx.lineWidth=Math.max(item.width,0.08); ctx.beginPath();
          if(item.points){ctx.moveTo(...item.points[0]); for(const p of item.points.slice(1))ctx.lineTo(...p);}
          else if(item.center)ctx.arc(...item.center,item.radius,0,2*Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      }
      const texture = new THREE.CanvasTexture(sheet);
      texture.encoding=THREE.sRGBEncoding;
      texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
      return texture;
    }
    const boardGeometry=new THREE.ExtrudeGeometry(outline,{depth:board.thickness,bevelEnabled:false,curveSegments:8});
    scene.add(new THREE.Mesh(boardGeometry,[new THREE.MeshStandardMaterial({color:0x1c694b}),new THREE.MeshStandardMaterial({color:0x8b8063})]));
    // Preserve real cutouts on the textured planes, including NPTH tooling holes.
    for(const side of ['top','bottom']){
      const geometry=new THREE.ShapeGeometry(outline,8);
      const pos=geometry.attributes.position;
      for(let i=0;i<pos.count;i++)geometry.attributes.uv.setXY(i,pos.getX(i)/size.x+0.5,pos.getY(i)/size.y+0.5);
      const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:faceTexture(side),roughness:.82,side:THREE.DoubleSide}));
      mesh.position.z=side==='top'?board.thickness+.012:-.012;
      scene.add(mesh);
    }
    const materials={ module:0x31485a, header:0x292b30, keyed:0xd9ccad, metal:0xb2b8bc, ic:0x262a2d, pcb:0x276c67, gold:0xc1a96e, ochre:0xb99356, tube:0x9bc5cd };
    const bodies=new THREE.Group();
    scene.add(bodies);
    function block(x,y,z,w,h,depth,mat){
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,depth),new THREE.MeshStandardMaterial({color:new THREE.Color(materials[mat]).convertSRGBToLinear(),roughness:.72}));
      mesh.position.set(x,y,z+depth/2);
      bodies.add(mesh);
      return mesh;
    }
    function componentData(part){
      const pads=board.pads.filter(p=>p.ref===part.ref && p.num);
      const xs=pads.map(p=>p.xy[0]),ys=pads.map(p=>p.xy[1]);
      const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
      const z=board.thickness;
      function box(cx,cy,base,w,h,depth,finish){
        const at=world([cx,cy]);
        block(at.x,at.y,base,w,h,depth,finish).userData.part=part;
      }
      if(part.ref==='U1'){
        // Relative to socket pin A1; local XY spans match the DevKitC-1 module.
        const [ox,oy]=pads.find(p=>p.num==='A1').xy;
        const left=ox-1.575, top=oy-24.13, right=left+51.8;
        for(const y of [ymin,ymax])box((xmax+xmin)/2,y,z,xmax-xmin+2.54,2.54,5,'header');
        box((left+right)/2,top+12.7,z+5,51.8,25.4,1.3,'module');
        box(left+2,top+12.7,z+6.3,16.7,18,1.1,'pcb');
        box(left+7,top+12.7,z+7.4,11,16,1.5,'metal');
        for(const y of [top+6.4,top+19]){
          box(right-3.3,y,z+6.3,6.6,8.7,3.2,'metal');
          box(right+.04,y,z+6.75,.1,6.9,2.2,'header');
        }
      } else if(part.ref==='J2'){
        box(xmin+2.85,(ymin+ymax)/2,z,9.5,ymax-ymin+5,6,'keyed');
        box(xmin+7.62,(ymin+ymax)/2,z+1.1,.1,ymax-ymin+2,3.7,'header');
      } else if(part.ref==='J3'){
        const [ox,oy]=pads.find(p=>p.num==='1').xy;
        box(ox,(ymin+ymax)/2,z,2.54,ymax-ymin+2.54,5,'header');
        box(ox+8.89,oy+10.16,z+5,22.86,25.4,1.2,'pcb');
        box(ox+12.6,oy+10.16,z+6.2,15.6,15,1.8,'metal');
      } else if(part.ref.startsWith('J')){
        box((xmin+xmax)/2,(ymin+ymax)/2,z,xmax-xmin+2.54,ymax-ymin+2.54,2.2,'header');
        for(const pad of pads)box(...pad.xy,z+2.2,.62,.62,3,'gold');
      } else if(part.ref.startsWith('R')){
        box((xmin+xmax)/2,(ymin+ymax)/2,z+.9,Math.max(xmax-xmin,.45),Math.max(ymax-ymin,.45),.45,'metal');
        box((xmin+xmax)/2,(ymin+ymax)/2,z+.4,Math.max(xmax-xmin-2,2),Math.max(ymax-ymin-2,2),1.8,'tube');
      } else if(part.ref.startsWith('C')){
        box((xmin+xmax)/2,(ymin+ymax)/2,z+.6,3.1,1.6,3.5,'ochre');
      }
    }
    board.parts.forEach(componentData);
    if(modelsToggle){bodies.visible=modelsToggle.checked;modelsToggle.addEventListener('change',()=>{bodies.visible=modelsToggle.checked;render();});}
    scene.add(new THREE.HemisphereLight(0xfff9e9,0xd6e4ed,1.15));
    const key=new THREE.DirectionalLight(0xffffff,.75);
    key.position.set(-60,60,150); scene.add(key);
    const extent=Math.max(size.x,size.y);
    const camera=new THREE.PerspectiveCamera(33,1,.1,extent*30);
    controls=new THREE.OrbitControls(camera,canvas);
    controls.minDistance=extent*.12;
    controls.maxDistance=extent*12;
    function render(){renderer.render(scene,camera);}
    function home(){
      const reach=Math.max(size.y,size.x/camera.aspect)*2.25;
      camera.up.set(0,1,0);
      camera.position.set(.14*reach,-.44*reach,reach);
      controls.target.set(0,0,0); controls.update(); render();
    }
    function resize(){
      const w=host.clientWidth,h=host.clientHeight;
      if(!w||!h)return;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();
    }
    controls.addEventListener('change',render);
    resize();home();new ResizeObserver(resize).observe(host);
    reset?.addEventListener('click',home);
    canvas.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();home();}});
    const picker=new THREE.Raycaster();
    let down;
    canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
    canvas.addEventListener('pointerup',e=>{
      if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4||!status||!bodies.visible)return;
      const r=canvas.getBoundingClientRect();
      picker.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);
      const part=picker.intersectObjects(bodies.children)[0]?.object.userData.part;
      if(part)status.textContent=part.ref+' · '+part.name+' · approximate component envelope';
    });
    if(status)status.textContent='KiCad placement · component heights are illustrative';
  } catch(error) {
    controls?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
    if(status)status.textContent='3D view unavailable. Use the 2D board drawing.';
    host.dataset.failed='true';
    host.dispatchEvent(new Event('board-view-failed'));
    console.warn('Kestrel PCB viewer:',error);
  }
})();
