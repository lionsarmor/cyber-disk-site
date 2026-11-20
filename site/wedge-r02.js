(async function inspectWedge() {
  const viewport = document.querySelector('#wedge-viewport');
  const status = document.querySelector('#wedge-status');
  const variant = document.querySelector('#wedge-variant');
  const lid = document.querySelector('#wedge-lid');
  const download = document.querySelector('#wedge-file');
  const cartridge = document.querySelector('#wedge-cartridge');
  const size = document.querySelector('#wedge-size');
  let renderer;

  try {
    const variants = await Promise.all(['drive', 'plain'].map(async name => {
      const response = await fetch(`models/wedge-r02-${name}.json`);
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
        color: new THREE.Color(...part.color),
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
      assembled: [650, 480, 760],
      inside: [170, 890, 535],
      side: [1030, 145, -55],
      disk: [-1030, 145, -55],
      rear: [340, 300, -990]
    };
    let viewName = 'assembled';

    function setView(name) {
      viewName = name;
      controls.target.set(0, 25, 0);
      const distanceScale = Math.max(1, 1 / camera.aspect);
      const direction = new THREE.Vector3(...cameraViews[name]).multiplyScalar(distanceScale);
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
      for (const { mesh, part } of pieces) {
        mesh.visible = part.variant === variant.value
          && !(part.lid && lid.checked) && (!part.cartridge || cartridge.checked);
      }
      const suffix = variant.value === 'drive' ? '' : '-No-Drive';
      size.textContent = variant.value === 'drive' ? '464 × 410 mm' : '388 × 410 mm';
      download.href = `downloads/wedge-r02/Commander-X16-Wedge${suffix}-R02.FCStd`;
      draw();
    }

    variant.addEventListener('change', updateModel);
    cartridge.addEventListener('change', updateModel);
    lid.addEventListener('change', updateModel);
    controls.addEventListener('change', draw);
    document.querySelectorAll('[data-camera]').forEach(button => {
      button.addEventListener('click', () => {
        lid.checked = button.dataset.camera === 'inside';
        updateModel();
        setView(button.dataset.camera);
      });
    });

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
