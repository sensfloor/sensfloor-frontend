import { createSkeletonMP } from "../threejs/skeleton.js";
import { backendFrameToThree } from "../threejs/pose-map-converter.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "../utils/landmark.js";
import { createBuffer } from "../utils/buffer.js";
import { streamMultipleCsvsToBuffer } from "../provider/csv-provider.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "../threejs/scene-provider.js";
import { renderPresetViews } from "../provider/canvas-provider.js";
import { appSettings } from "../config.js";

let buffer = null;
let skeletons = null;
export function setupCSVAnimate(config) {
  buffer = createBuffer();
  const csvPaths = config.map((cfg) => cfg.path);
  streamMultipleCsvsToBuffer(csvPaths, 15, buffer);

  skeletons = config.map((cfg) => {
    const skel = createSkeletonMP({
      excluded: EXCLUDED_JOINTS,
      bones: MP_BONES_BODY,
      color: cfg.color,
      rotationOffset: cfg.rotationOffset,
    });
    scene.add(skel.group);
    return skel;
  });
}

export function animateCSV() {
  requestAnimationFrame(animateCSV);

  controls.update();
  renderer.render(scene, camera);
  if (appSettings.renderPoseInCanvas) {
    renderPresetViews(scene);
  }
 
  // adjust toggle skelton visibility here and tick if it's visible 
  // smooth transition to new current target pose

  skeletons.forEach((skel, index) => {
    if(appSettings.landmarks) {
      skel.group.visible = true;
      if (skel && skel.tick) {
        skel.tick();  
      }
    }else{
      skel.group.visible = false;
    }
  });

  // get new target points for each sekelton from csv buffer
  const raw_data_frames = buffer.get();
  if (raw_data_frames && raw_data_frames.length > 0) {
    skeletons.forEach((skel, index) => {
      const frameData = raw_data_frames[index];
      if (frameData) {
        const convertedFrame = backendFrameToThree(frameData, (x, y) =>
          floor.patchWorld(x, y),
        );
        skel.setPose(convertedFrame.poseWorld);
      }
    });
  }
}
