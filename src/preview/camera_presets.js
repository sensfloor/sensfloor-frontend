import * as THREE from 'three';

export const presetViews = [
  {
    position: new THREE.Vector3(0, 5, 0),   // top down view 
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  {
    position: new THREE.Vector3(-1.5, 1, 3.5),   // comparison view for two poses 
    lookAt: new THREE.Vector3(-1.5, 1, 0),
  },
  {
    position: new THREE.Vector3(0, 3, 3),   //main view 
    lookAt: new THREE.Vector3(0, 0, 0),
  },
];
