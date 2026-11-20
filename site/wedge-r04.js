(async function inspectWedge() {
  const viewport = document.querySelector('#wedge-viewport');
  const status = document.querySelector('#wedge-status');
  const variant = document.querySelector('#wedge-variant');
  const lid = document.querySelector('#wedge-lid');
  const download = document.querySelector('#wedge-file');
  const clearances = document.querySelector('#wedge-clearances');
  const cartridge = document.querySelector('#wedge-cartridge');
  const size = document.querySelector('#wedge-size');
  const height = document.querySelector('#wedge-height');
  const keyboard = document.querySelector('#wedge-keyboard');
  const viewNote = document.querySelector('#wedge-view-note');
  const viewButtons = [...document.querySelectorAll('[data-camera]')];
  const specs = {
    drive: { footprint: '462 × 374 mm', height: '22–84 mm', suffix: '' },
    plain: { footprint: '388 × 374 mm', height: '22–78 mm', suffix: '-No-Drive' }
  };
  let renderer;

  try {
    const variants = await Promise.all(['drive', 'plain'].map(async name => {
      const response = await fetch(`models/wedge-r04-${name}.json`);
      if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
      const parts = await response.json();
      return parts.map(part => ({ ...part, variant: name }));
    }));
    const parts = variants.flat();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xece8df);
    renderer.domElement.setAttribute('aria-label', 'Drag to rotate, scroll to zoom');
    viewport.append(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xaaa095, 0.69));
    const key = new THREE.DirectionalLight(0xfff4e5, 0.47);
    key.position.set(300, 650, 450);
    scene.add(key);
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
      assembled: { position: [650, 440, 725], note: 'Drag to rotate. Scroll or pinch to zoom.' },
      inside: { position: [245, 850, 610], note: 'Inspect the hardware with the rear lid removed.' },
      side: { position: [-940, 175, 60], note: 'Cartridge access on the left as seen from the typing position.' },
      disk: { position: [940, 175, 60], note: '' },
      rear: { position: [340, 300, -990], note: 'The rear I/O plate is replaceable. Port locations are provisional.' },
      packaging: { position: [270, 1050, 460], note: 'The top and keyboard are hidden. Printed mounts are highlighted in amber.' }
    };
    let viewName = 'assembled';

    function setView(name) {
      viewName = name;
      controls.target.set(0, 25, 0);
      const distanceScale = Math.max(1, 1 / camera.aspect);
      const direction = new THREE.Vector3(...cameraViews[name].position).multiplyScalar(distanceScale);
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
      for (const { mesh, part } of pieces) {
        mesh.visible = part.variant === variant.value
          && !(part.lid && lid.checked)
          && !(part.roof && packaging)
          && !(part.keyboard && keyboard.checked)
          && (!part.cartridge || cartridge.checked)
          && (!part.reserve || clearances.checked);
        if (part.bracket) mesh.material.emissive.setHex(packaging ? 0x5a2804 : 0x000000);
      }
      const selected = specs[variant.value];
      size.textContent = selected.footprint;
      height.textContent = selected.height;
      download.href = `downloads/wedge-r04/Commander-X16-Wedge${selected.suffix}-R04.FCStd`;
      viewNote.textContent = viewName === 'disk'
        ? (variant.value === 'drive' ? 'Cyber Disk insertion and ejection on the right.' : 'Solid right cheek on the no-drive case.')
        : cameraViews[viewName].note;
      for (const button of viewButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.camera === viewName));
      }
      draw();
    }

    variant.addEventListener('change', updateModel);
    clearances.addEventListener('change', updateModel);
    cartridge.addEventListener('change', updateModel);
    lid.addEventListener('change', updateModel);
    keyboard.addEventListener('change', updateModel);
    controls.addEventListener('change', draw);
    for (const button of viewButtons) {
      button.addEventListener('click', () => {
        const name = button.dataset.camera;
        lid.checked = name === 'inside' || name === 'packaging';
        keyboard.checked = name === 'packaging';
        setView(name);
        updateModel();
      });
    }

    resize();
    updateModel();
    new ResizeObserver(resize).observe(viewport);
    status.hidden = true;
  } catch (error) {
    renderer?.domElement.remove();
    status.textContent = 'This browser could not load the 3D preview. The FreeCAD model is available to download.';
    console.error(error);
  }
})();
