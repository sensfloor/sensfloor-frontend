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
  // ---- build “true” 8 triangles inside ONE patch (local coords) ----
  // Local patch coords: center=(0,0), square boundary at [-0.5, +0.5] in (u,v)
  // here it creates 8 triangles with angle ranges:
  // [22.5..67.5] (NE), [-22.5..22.5] (E), ... etc.

  const triGeoms = make8TriangleGeometries(); // / Create geometries for 8 triangular sub-patches within one floor patch

  // materials (one per triangle so we can change opacity)
  // // Loop over all patch rows and colums to create trinngles
  const triMeshes = []; 
  for (let py = 0; py < rows; py++) {
    for (let px = 0; px < cols; px++) {
      // patch center in world
      const c = patchWorld(px + 0.5, py + 0.5);

      for (let k = 0; k < 8; k++) {  // floor sensor color change here
        const mat = new THREE.MeshBasicMaterial({
          color:0xffffff,   
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
          depthTest: true,
        });

        // Create a mesh for the k-th triangle geometry
        const m = new THREE.Mesh(triGeoms[k], mat);
        // scale local patch [1.1] to meters
        m.scale.set(patchSize, 1, patchSize);
         // Position the triangle at the patch center (slightly above the floor)
        m.position.set(c.x, 0.002, c.z);

        group.add(m);

        
              // to visualize triangle boundaries
        const edges = new THREE.EdgesGeometry(triGeoms[k]);
        const edgeLine = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            })
        );
        edgeLine.scale.copy(m.scale);
        edgeLine.position.copy(m.position);
        group.add(edgeLine);

        triMeshes.push({ px, py, k, mesh: m });
      }
    }
  }

  // // Build a lookup table (LUT) to access a triangle mesh by [y][x][k]
  const lut = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Array.from({ length: 8 }, () => null))
  );
  // Fill LUT: for each triangle mesh, store it at lut[patchY][patchX][triangleIndex]
  for (const t of triMeshes) lut[t.py][t.px][t.k] = t.mesh;
  /**
 * frameMessages: array of {x, y, sig8}
 * - x, y: 0-based patch indices
 * - sig8: length=8 array of triangle signals (k=0..7)
 */

    return { group, patchWorld, setMarkerByPatch, cols, rows, patchSize };

}

/**
 * Create 8 triangle geometries in local patch coordinates.
 * Local plane: XZ (y=0). Square boundary is x,z in [-0.5, +0.5].
 * Each triangle: center + two intersection points with square boundary.
 */
function make8TriangleGeometries() {
  // local XZ plane, center at (0,0), square boundary at ±0.5
  const C  = new THREE.Vector3(0, 0, 0);
  // Midpoints of each edge of the square boundary
  const N  = new THREE.Vector3( 0.0, 0,  0.5);
  const E  = new THREE.Vector3( 0.5, 0,  0.0);
  const S  = new THREE.Vector3( 0.0, 0, -0.5);
  const W  = new THREE.Vector3(-0.5, 0,  0.0);
  // Corners of the square boundary
  const NE = new THREE.Vector3( 0.5, 0,  0.5);
  const SE = new THREE.Vector3( 0.5, 0, -0.5);
  const SW = new THREE.Vector3(-0.5, 0, -0.5);
  const NW = new THREE.Vector3(-0.5, 0,  0.5);

  // triangles 1..8 in your diagram (clockwise)
  // Define 8 triangles around the center (clockwise order)
  const tris = [
    [C, N,  NE], // 1
    [C, NE, E ], // 2
    [C, E,  SE], // 3
    [C, SE, S ], // 4
    [C, S,  SW], // 5
    [C, SW, W ], // 6
    [C, W,  NW], // 7
    [C, NW, N ], // 8
  ];

  const geoms = [];
  for (const [a,b,c] of tris) {
    const geom = new THREE.BufferGeometry().setFromPoints([a,b,c]);
    geom.setIndex([0,1,2]);
    geom.computeVertexNormals();
    geoms.push(geom);
  }
  return geoms;
}

