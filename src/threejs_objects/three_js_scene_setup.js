import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createTriSensorFloor } from "./floor.js";


export const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 500);
camera.position.set(0, 5, 0);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);


scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const dir = new THREE.DirectionalLight(0xffffff, 0.65);
dir.position.set(3, 6, 0);
scene.add(dir);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export const floor = createTriSensorFloor({ cols: 6, rows: 4, patchSize: 0.5 });
scene.add(floor.group);
