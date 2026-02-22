import * as THREE from "three";

export function createTriSensorFloor({ cols, rows, patchSize }) {
  const group = new THREE.Group();
  const width = cols * patchSize;
  const height = rows * patchSize;
  // base plane
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: 0xaba59c, // 0xffffff
      roughness: 0.95,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0,
    }),
  );
  base.rotation.x = -Math.PI / 2;
  group.add(base);

  // ---- custom grid lines (6×4) ----
  const grid = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x29292c,
    transparent: false,
    opacity: 1.0,
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
  const s = patchSize / 2;
  const edge_pairs = [
    [
      [0, 0, -s],
      [s, 0, -s],
    ], // top right tringle   index: 1
    [
      [s, 0, -s],
      [s, 0, 0],
    ], // top right below  index: 2
    [
      [s, 0, 0],
      [s, 0, s],
    ], // bottom top right  index:3
    [
      [s, 0, s],
      [0, 0, s],
    ], //bottm right   index : 4
    [
      [0, 0, s],
      [-s, 0, s],
    ], // bottom  bottom left ..
    [
      [-s, 0, s],
      [-s, 0, 0],
    ], // bottm top left ..
    [
      [-s, 0, 0],
      [-s, 0, -s],
    ], //top below left ..
    [
      [-s, 0, -s],
      [0, 0, -s],
    ],
  ]; // top top left ..

  for (let i = 0; i < cols; i++) {
    patchMarkers[i] = [];
    for (let j = 0; j < rows; j++) {
      const center = patchWorld(i, j);
      const x = center.x + patchSize / 2;
      const z = center.z - patchSize / 2;

      const patchGroup = new THREE.Group();
      const patchTriangles = [];

      for (let k = 0; k < 8; k++) {
        const c = new THREE.Vector3(x, 0.01, z);
        const A = new THREE.Vector3(
          x + edge_pairs[k][0][0],
          0.01,
          z + edge_pairs[k][0][2],
        );
        const B = new THREE.Vector3(
          x + edge_pairs[k][1][0],
          0.01,
          z + edge_pairs[k][1][2],
        );
        const g = new THREE.BufferGeometry().setFromPoints([c, A, B]);
        const m = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color: 0xff0000 ,//   0x808080 
            transparent: true,
            side: THREE.DoubleSide,
            opacity: 0.0,
          }),
        );

        const lineMat = new THREE.LineBasicMaterial({
          color: 0x29292c,
          transparent: false,
        });
        const lineA = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([c, A]),
          lineMat,
        );
        const lineB = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([c, B]),
          lineMat,
        );

        patchGroup.add(m);
        patchGroup.add(lineA);
        patchGroup.add(lineB);
        patchTriangles.push(m);
      }

      group.add(patchGroup);
      patchMarkers[i][j] = patchTriangles; // data structure = [x][y][8 triagnles]
    }
  }

  // Convert grid x,y index to world X coordinate, centered at the grid origin
  function patchWorld(x, y) {
    const worldX = (x - cols / 2) * patchSize;
    const worldZ = -(y - rows / 2) * patchSize;
    return new THREE.Vector3(worldX, 0, worldZ);
  }

  let memory_index = [];

  function animatePatch(activated_patch, signals, visible_signal,threshold) {
    for (let i = 0; i < memory_index.length; i++) {
      const [x, y] = memory_index[i];
      for (let k = 0; k < 8; k++) {
        patchMarkers[x][y][k].material.opacity = 0.0;
      }
    }
    if (activated_patch.length !== signals.length) {
      return;
    }
    if (visible_signal){
      for (let i = 0; i < activated_patch.length; i++) {
      const x = activated_patch[i][0];
      const y = activated_patch[i][1];
      const sig = signals[i];
      memory_index.push(activated_patch[i]);
      for (let k = 0; k < 8; k++) {
        const value = sig[k];
        const intensity = Math.max(value - threshold, 0) / (255 - threshold);
        const tri = patchMarkers[x][y][k];
        tri.material.opacity = intensity *10;
        }
      }
    }
    
    memory_index = activated_patch.map(([x, y]) => [x, y]);
  }

  return { group, patchWorld, animatePatch, cols, rows, patchSize };
}
