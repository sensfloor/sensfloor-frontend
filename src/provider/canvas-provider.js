import * as THREE from "three";
import { presetViews } from "../config.js";
import { copyTemplate } from "../utils/create-html-element.js";

let presetCameras = [];
let presetRenderers = [];

export function initiatePreviews(scene, camera, controls) {
  presetCameras = presetViews.map((view) => {
    const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 500);
    cam.position.copy(view.position);
    cam.lookAt(view.lookAt);
    return cam;
  });

  const presetCanvases = presetViews.map((view) => {
    return copyTemplate("preset-view-template", view.id);
  });

  presetRenderers = presetCanvases.map((canvas) => {
    if (!canvas) return null;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true });
    r.setSize(canvas.width, canvas.height, false);
    r.setClearColor(0x111111);
    return r;
  });

  presetCanvases.forEach((canvas, i) => {
    if (!canvas) return;
    canvas.addEventListener("click", () => {
      camera.position.copy(presetViews[i].position);
      camera.lookAt(presetViews[i].lookAt);
      controls.target.copy(presetViews[i].lookAt);
      controls.update();
    });
  });
}

export function renderPresetViews(scene) {
  for (let i = 0; i < presetRenderers.length; i++) {
    if (presetRenderers[i]) {
      presetRenderers[i].render(scene, presetCameras[i]);
    }
  }
}
