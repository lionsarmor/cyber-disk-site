(async function inspectWedge() {
  const viewport = document.querySelector('#wedge-viewport');
  const status = document.querySelector('#wedge-status');
  const lid = document.querySelector('#wedge-lid');
  const clearances = document.querySelector('#wedge-clearances');
  const cartridge = document.querySelector('#wedge-cartridge');
  const size = document.querySelector('#wedge-size');
  const keyboard = document.querySelector('#wedge-keyboard');
  const viewNote = document.querySelector('#wedge-view-note');
  const viewButtons = [...document.querySelectorAll('[data-camera]')];
  const width = Number(size.dataset.width);
  const depth = Number(size.dataset.depth);
  let renderer;

  try {
    const response = await fetch('models/wedge-r09.json');
    if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
    const parts = await response.json();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xece8df, 0);
    renderer.domElement.setAttribute('aria-label', 'Drag to rotate, scroll to zoom');
    viewport.append(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a596, 0.78));
    const key = new THREE.DirectionalLight(0xfff6eb, 0.65);
    key.position.set(-110, 710, 460);
    const fill = new THREE.DirectionalLight(0xe6efff, 0.32);
    fill.position.set(650, 180, 420);
    const rim = new THREE.DirectionalLight(0xffefbf, 0.23);
    rim.position.set(460, 350, -640);
    scene.add(key, fill, rim);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowContext = shadowCanvas.getContext('2d');
    const shade = shadowContext.createRadialGradient(64, 64, 18, 64, 64, 64);
    shade.addColorStop(0, 'rgba(56, 42, 27, 0.28)');
    shade.addColorStop(0.55, 'rgba(56, 42, 27, 0.17)');
    shade.addColorStop(1, 'rgba(56, 42, 27, 0)');
    shadowContext.fillStyle = shade;
    shadowContext.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -3;
    scene.add(shadow);
    const camera = new THREE.PerspectiveCamera(34, 1, 2, 8000);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 145;
    controls.maxDistance = 2400;

    const pieces = parts.map(part => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.vertices, 3));
      geometry.setIndex(part.faces);
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: part.reserve ? 0x4994bb : new THREE.Color(...part.color),
        transparent: Boolean(part.reserve),
        opacity: part.reserve ? 0.27 : 1,
        depthWrite: !part.reserve,
        roughness: 0.72,
        flatShading: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = part.name;
      scene.add(mesh);
      return { mesh, part };
    });

    function draw() {
      renderer.render(scene, camera);
    }

    const cameraViews = {
      assembled: { position: [488, 320, 715], target: [0, 32, 12], note: 'Drag to rotate. Scroll or pinch to zoom.' },
      front: { position: [185, 107, 783], target: [0, 20, 118], note: 'Inspect the full-width front brace, angled corners, and the recessed vent band.' },
      keywell: { position: [155, 872, 470], target: [0, 28, 86], note: 'The keyboard is hidden to reveal its printed stands and the through-cut opening.' },
      seam: { position: [152, 195, 276], target: [145, 57, 38], note: 'Inspect the direct seam between the F87 housing and deck. The nominal gap is 0.6 mm per edge.' },
      inside: { position: [245, 850, 610], note: 'Inspect the hardware with the rear lid removed.' },
      cover: { position: [590, 438, 748], target: [0, 74, -18], note: 'The magnetic cover and its attached parts are lifted 90 mm for inspection.' },
      side: { position: [-940, 175, 60], note: 'Cartridge access on the left as seen from the typing position.' },
      rear: { position: [0, 21, -448], edge: 'left', rearTarget: true, target: [128, 31, 2], note: 'The short X16-P V2 layout informed the individual cutouts. The horizontal DE9/SMA adapter is on the right.' },
      rearProfile: { position: [405, 130, -605], rearTarget: true, target: [0, 38, 20], note: 'Inspect the short rear ledge and the faceted corners together.' },
      riser: { position: [-239, 281, -294], edge: 'left', target: [64, 46, -112], note: 'The cover is hidden to reveal the separate right-angle riser and flat Wi-Fi card.' },
      rail: { position: [332, 201, -242], edge: 'right', target: [-7, 60, -91], note: 'Look for the 10 mm chamfer, tapered side rail and amber diagonal joint.' },
      packaging: { position: [270, 1050, 460], note: 'Printed stands and other mounts are highlighted in amber. Turn on clearance zones to inspect the fit.' }
    };
    let viewName = 'assembled';

    function setView(name) {
      viewName = name;
      const view = cameraViews[name];
      const [x, y, z] = view.target || [0, 25, 0];
      const halfWidth = width / 2;
      const targetX = view.edge === 'left' ? x - halfWidth : view.edge === 'right' ? x + halfWidth : x;
      controls.target.set(targetX, y, view.rearTarget ? z - depth / 2 : z);
      const distanceScale = Math.max(1, 1 / camera.aspect);
      const direction = new THREE.Vector3(...view.position).multiplyScalar(distanceScale);
      camera.position.copy(controls.target).add(direction);
      controls.update();
      draw();
    }

    function resize() {
      const { clientWidth, clientHeight } = viewport;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      setView(viewName);
    }

    function updateModel() {
      const packaging = viewName === 'packaging';
      const coverLifted = viewName === 'cover';
      for (const { mesh, part } of pieces) {
        mesh.position.y = part.liftable && coverLifted ? 90 : 0;
        mesh.visible = !((part.lid || part.liftable) && lid.checked && !coverLifted)
          && !(part.roof && packaging)
          && !(part.keyboard && keyboard.checked)
          && (!part.cartridge || cartridge.checked)
          && (!part.reserve || clearances.checked);
        if (part.bracket) mesh.material.emissive.setHex(packaging ? 0x5a2804 : 0x000000);
      }
      shadow.visible = !packaging && !clearances.checked;
      viewNote.textContent = cameraViews[viewName].note;
      for (const button of viewButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.camera === viewName));
      }
      draw();
    }

    shadow.scale.set(width * 1.53, depth * 1.53, 1);
    clearances.addEventListener('change', updateModel);
    cartridge.addEventListener('change', updateModel);
    lid.addEventListener('change', updateModel);
    keyboard.addEventListener('change', updateModel);
    controls.addEventListener('change', draw);
    for (const button of viewButtons) {
      button.addEventListener('click', () => {
        const name = button.dataset.camera;
        lid.checked = name === 'inside' || name === 'packaging' || name === 'riser';
        lid.disabled = name === 'cover';
        keyboard.checked = name === 'packaging' || name === 'keywell';
        setView(name);
        updateModel();
      });
    }

    resize();
    updateModel();
    new ResizeObserver(resize).observe(viewport);
    const startView = new URLSearchParams(location.search).get('view');
    viewButtons.find(button => button.dataset.camera === startView)?.click();
    status.hidden = true;
  } catch (error) {
    renderer?.domElement.remove();
    status.textContent = 'This browser could not load the 3D preview. The FreeCAD model is available to download.';
    console.error(error);
  }
})();
