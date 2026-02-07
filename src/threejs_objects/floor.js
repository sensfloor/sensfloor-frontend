import * as THREE from "three";

export function createTriSensorFloor({ cols, rows, patchSize }) {
  const group = new THREE.Group();
  const width = cols * patchSize;
  const height = rows * patchSize;
  // base plane
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    }),
  );
  base.rotation.x = -Math.PI / 2;
  group.add(base);

  // ---- custom grid lines (6×4) ----
  const grid = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.7,
  });
  // vertical lines (x)
  for (let i = 0; i <= cols; i++) {
    const x = (i - cols / 2) * patchSize;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.002, -height / 2),
      new THREE.Vector3(x, 0.002, height / 2),
    ]);
    grid.add(new THREE.Line(g, lineMat));
  }
  // horizontal lines (z)
  for (let j = 0; j <= rows; j++) {
    const z = (j - rows / 2) * patchSize;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-width / 2, 0.002, z),
      new THREE.Vector3(width / 2, 0.002, z),
    ]);
    grid.add(new THREE.Line(g, lineMat));
  }
  group.add(grid);

   // make 4x6 number of patch meshes to visualize activated patches but they are hidden in the intial setup
  const patchMarkers = [];
  for (let i = 0; i < cols * rows; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(patchSize, patchSize),
      new THREE.MeshStandardMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9 }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.001;
    m.visible = false;
    group.add(m);
    patchMarkers.push(m)
   
  }


  // continuous patch coordinate -> world (XZ)
  // Convert grid x,y index to world X coordinate, centered at the grid origin
  function patchWorld(x, y) {
    const worldX = (x - cols / 2) * patchSize; // TODO: Change coordinate system to match backend coordinate system. Possibly backend needs to adapt coordinates?
    const worldZ = -(y - rows / 2) * patchSize;
    return new THREE.Vector3(worldX, 0, worldZ);
  }

  function animatePatch(activated_patch, patchToWorld){
    if (!Array.isArray(activated_patch)) return;
    for (const m of patchMarkers) m.visible = false;
        
    // display only activated patches
    for (let i = 0; i < activated_patch.length; i++) {
      const [x, y] = activated_patch[i];
      const worldPos = patchToWorld(x, y);
      patchMarkers[i].position.set(worldPos.x+patchSize/2, 0.002, worldPos.z+patchSize/2);
      patchMarkers[i].visible = true;
    }
  }

  function setMarkerByPatch(x, y, visible = true) {
    const p = patchWorld(x, y);
    marker.position.x = p.x;
    marker.position.z = p.z;
    if (visible == true) {
      marker.material.color.set(0x00000000);
      marker.visible = true;
    } else {
      marker.visible = false;
    }
  

    //make8TriangleGeometries.material.color = 0xff0000;
  }

  return { group, patchWorld, animatePatch, cols, rows, patchSize};
}
