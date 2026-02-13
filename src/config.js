import * as THREE from 'three';
import {SKELETON_COLORS} from "./utils/colors.js";


export const use_socket = false;

export const CSV_SKELETON_CONFIGS = [
  { path: "../video_poses.csv", color: SKELETON_COLORS[2], rotationOffset: 45 },
];

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
