(async () => {
    "use strict";
    const el = id => document.getElementById(id);
    const canvas = el('scene');
    const stage = canvas.parentElement;
    const status = el('status');
    const buttons = [...document.querySelectorAll('[data-view]')];
    const viewNames = {
        rear: ['Rear', 'The receiver covers 48 mm of the seated Cyber Disk. Its upper half remains visible between the guides.'],
        front: ['Front', 'The display, game controls and replaceable keyboard insert sit on the front. The raised side buttons release the disk.'],
        modules: ['Module bay', 'The Mars CM and Tang Nano 20K sit on the front face of the carrier. This view isolates their module envelopes and mounting hardware.'],
        pico: ['Pico sockets', 'The Pico H sits beneath the lower rear service cover. Lift the module to expose the two through-hole 20-pin female header strips.']
    };
    try {
        const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .86;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32,1,.25,2200);
        const controls = new THREE.OrbitControls(camera,canvas);
        controls.enablePan = false;
        controls.minDistance = 32;
        controls.maxDistance = 800;
        scene.add(new THREE.HemisphereLight(0xfffcf1,0xd5daca,1.45));
        for (const [x,y,z,power] of [[-100,200,-250, .8],[100,140,250,.9]]) {
            const light = new THREE.DirectionalLight(0xfff9e7,power);
            light.position.set(x,y,z);
            scene.add(light);
        }
        const fetchOk = async name => {
            const r = await fetch(name);
            if (!r.ok) throw Error('Assembly request failed');
            return r;
        };
        const [index,buffer] = await Promise.all([
            fetchOk('./assembly.json').then(r=>r.json()), fetchOk('./assembly.bin').then(r=>r.arrayBuffer())
        ]);
        const materialByColor = new Map();
        const parts = index.parts.map(part => {
            const q = new Int16Array(buffer,part.p,part.v*3);
            const normal = new Int8Array(buffer,part.n,part.v*3);
            const p = new Float32Array(q.length);
            const n = new Float32Array(q.length);
            for (let v=0;v<q.length;v+=3) {
                p[v]=q[v]/100-52; p[v+1]=107.5-q[v+1]/100; p[v+2]=-q[v+2]/100;
                n[v]=normal[v]/127; n[v+1]=-normal[v+1]/127; n[v+2]=-normal[v+2]/127;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position',new THREE.BufferAttribute(p,3));
            geometry.setAttribute('normal',new THREE.BufferAttribute(n,3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer,part.i,part.t*3),1));
            const key=part.color.join(',');
            if(!materialByColor.has(key)) materialByColor.set(key,new THREE.MeshStandardMaterial({
                color:new THREE.Color().fromArray(part.color), roughness:.83, metalness:.03
            }));
            const mesh = new THREE.Mesh(geometry,materialByColor.get(key));
            mesh.name = part.name;
            scene.add(mesh);
            return mesh;
        });
        const render = () => renderer.render(scene,camera);
        controls.addEventListener('change',render);
        let active;
        const poses = {
            rear: {center:[0,1,-1],dir:[.26,.21,-1],h:258,w:146},
            front:{center:[0,1,0],dir:[.18,.13,1],h:253,w:143},
            modules:{center:[0,-29,0],dir:[.30,.27,1],h:198,w:129},
            pico:{center:[-11,-76,-6],dir:[-.55,.48,-1],h:79,w:105}
        };
        function applyPose(){
            const def = poses[active];
            const scale = Math.max(def.h,def.w/camera.aspect) / (2*Math.tan(camera.fov*Math.PI/360));
            controls.target.set(...def.center);
            if (active==='rear') controls.target.y += Number(el('slide').value)*.4;
            const dir = new THREE.Vector3(...def.dir).normalize();
            camera.position.copy(controls.target).addScaledVector(dir,scale);
            controls.update();
            render();
        }
        function moveParts() {
            const travel = Number(el('slide').value), lift = Number(el('lift').value);
            el('travel-value').textContent = travel+' mm';
            el('lift-value').textContent = lift+' mm';
            for(const mesh of parts) {
                const name = mesh.name;
                mesh.visible = active === 'modules' ? /^(Carrier_FR4|Mars_|M2p5_CM|Tang_)/.test(name)
                            : active === 'pico' ? /^(Carrier_FR4|Pico_)/.test(name)
                            : !/^Battery_reserved/.test(name);
                mesh.position.y = name.startsWith('Disk_') ? travel : 0;
                mesh.position.z = active==='pico' && /^Pico_(supervisor|component)/.test(name) ? -lift : 0;
            }
            render();
        }
        function choose(id) {
            active = Object.hasOwn(poses,id) ? id : 'rear';
            for(const b of buttons) b.setAttribute('aria-pressed',String(b.dataset.view===active));
            el('view-tag').textContent=viewNames[active][0];
            el('detail').textContent=viewNames[active][1];
            el('travel').hidden=active!=='rear'; el('service').hidden=active!=='pico';
            moveParts(); applyPose();
        }
        function zoom(factor) {
            const off = camera.position.clone().sub(controls.target);
            off.setLength(Math.max(controls.minDistance,Math.min(controls.maxDistance,off.length()*factor)));
            camera.position.copy(controls.target).add(off); controls.update(); render();
        }
        function resize() {
            const w=stage.clientWidth, h=stage.clientHeight;
            if(!w || !h)return;
            renderer.setSize(w,h,false);camera.aspect=w/h; camera.updateProjectionMatrix();
            if(active)applyPose();
        }
        for(const b of buttons)b.addEventListener('click',()=>{
            history.replaceState(null,'','#'+b.dataset.view);choose(b.dataset.view);
        });
        addEventListener('hashchange',()=>choose(location.hash.slice(1)));
        el('slide').addEventListener('input',() => {
            const y=1+Number(el('slide').value)*.4;
            camera.position.y+=y-controls.target.y;controls.target.y=y;controls.update();moveParts();
        });
        el('lift').addEventListener('input',moveParts);
        el('in').addEventListener('click',()=>zoom(.8));
        el('out').addEventListener('click',()=>zoom(1.25));
        el('reset').addEventListener('click',()=>{el('slide').value=0;el('lift').value=0;choose(active);});
        canvas.addEventListener('keydown',e=>{
            if(e.key==='Home'){e.preventDefault();applyPose();return;}
            if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1.2:.83);return;}
            if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
            e.preventDefault();
            const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
            if(e.key==='ArrowLeft')orbit.theta-=.14;
            if(e.key==='ArrowRight')orbit.theta+=.14;
            if(e.key==='ArrowUp')orbit.phi-=.14;
            if(e.key==='ArrowDown')orbit.phi+=.14;
            orbit.makeSafe();
            camera.position.setFromSpherical(orbit).add(controls.target);controls.update();render();
        });
        if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);
        else window.addEventListener('resize',resize);
        resize(); choose(location.hash.slice(1));status.hidden=true;
    } catch(error) {
        console.error(error);
        status.replaceChildren('3D viewing is unavailable here. ');
        const fallback=document.createElement('a');fallback.href='../assets/Kestrel-A1-assembly.png';
        fallback.textContent='Open the assembly drawing';status.append(fallback);
        for(const b of document.querySelectorAll('button,input'))b.disabled=true;
    }
})();
