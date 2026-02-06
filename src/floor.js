import * as THREE from 'three'


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
  return group

}