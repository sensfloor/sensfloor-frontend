import * as THREE from "three";

export function createTriSensorFloor({
  cols = 6,
  rows = 4,
  patchSize = 0.5,
}) {
  const group = new THREE.Group();
  const width  = cols * patchSize;
  const height = rows * patchSize;
  // base plane
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: 0x202020,
      roughness: 0.95,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    })
  );
  base.rotation.x =-Math.PI / 2;
  group.add(base);

  // ---- custom grid lines (6×4) ----
  const grid = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.7 });
  // vertical lines (x)
  for (let i = 0; i <= cols; i++) {
    const x = (i - cols / 2) * patchSize;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.002, -height / 2),
      new THREE.Vector3(x, 0.002,  height / 2),
    ]);
    grid.add(new THREE.Line(g, lineMat));
  }
  // horizontal lines (z)
  for (let j = 0; j <= rows; j++) {
    const z = (j - rows / 2) * patchSize;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-width / 2, 0.002, z),
      new THREE.Vector3( width / 2, 0.002, z),
    ]);
    grid.add(new THREE.Line(g, lineMat));
  }
  group.add(grid);
  // continuous patch coordinate -> world (XZ)
  // Convert grid x,y index to world X coordinate, centered at the grid origin
  function patchWorld(x, y) {
    const worldX = (x - cols / 2) * patchSize;
    const worldZ = -(y - rows / 2) * patchSize;
    return new THREE.Vector3(worldX, 0, worldZ);
  }
    // marker
  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(patchSize * 0.22, 32),
    new THREE.MeshBasicMaterial({ color: 0x00000000, opacity: 1.0 })
  );
  marker.rotation.x = 0;
  marker.position.y = 0;
  marker.visible = false;
  group.add(marker);

  function setMarkerByPatch(x, y, visible = true) {
    const p = patchWorld(x, y);
    marker.position.x = p.x;
    marker.position.z = p.z;
    if (visible == true){
      marker.material.color.set(0x00000000);
      marker.visible = true; 
    } else {
      marker.visible = false;
    }
   
    //make8TriangleGeometries.material.color = 0xff0000;
    
  }

    return { group, patchWorld, setMarkerByPatch, cols, rows, patchSize };

}
