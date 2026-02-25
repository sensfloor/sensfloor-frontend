import * as THREE from "three";
import { SKELETON_COLORS } from "./utils/colors.js";

export const use_socket = true;

export const appSettings = {
  smoothingFactor: 0.3,
  signalThreshold: 128,
  signalIntensityMultiplier: 2,
  isPaused: false,
  signalVisible: true,
  renderPoseInCanvas: true,
  showLandmarks: true,
};

export const CSV_SKELETON_CONFIGS = [
  {
    path: "../data/video_poses.csv",
    color: SKELETON_COLORS[2],
    rotationOffset: 45,
  },
];

export const presetViews = [
  {
    id: "presetView1",
    position: new THREE.Vector3(0, 5, 0), // top down view
    lookAt: new THREE.Vector3(0, 0, 0),
  },
 /*  {
    id: "presetView2",
    position: new THREE.Vector3(0.7, 0.7, 1.7), // comparison view for two poses
    lookAt: new THREE.Vector3(0, 0.7, 0),
  },
  */
  {
    id: "presetView3",
    position: new THREE.Vector3(0, 3, 3), //main view
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  {
    id: "presetView4",
    position: new THREE.Vector3(3.8, 1.7, 0), //main view
    lookAt: new THREE.Vector3(0, 0, 0),
  },
];

export const MAX_SIGNAL_VALUE = 255;
