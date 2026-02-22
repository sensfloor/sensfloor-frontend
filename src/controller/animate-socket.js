import { backendFrameToThree } from "../threejs/pose-map-converter.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "../threejs/scene-provider.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "../utils/landmark.js";
import { buffer } from "../provider/socket-provider.js";
import { SKELETON_COLORS } from "../utils/colors.js";
import { createSkeletonMP } from "../threejs/skeleton.js";
import { appSettings } from "../config.js";
import { renderPresetViews } from "../provider/canvas-provider.js";

const skel = createSkeletonMP({
  excluded: EXCLUDED_JOINTS,
  bones: MP_BONES_BODY,
  color: SKELETON_COLORS[0],
  rotationOffset: 45,
});
scene.add(skel.group);

export function animateSocket() {
  requestAnimationFrame(animateSocket);

  
  
  if(appSettings.landmarks) {
    skel.group.visible = true;
    if (skel && skel.tick) skel.tick();

  } else {
    skel.group.visible = false;
  }

  controls.update();
  renderer.render(scene, camera);
  if (appSettings.renderPoseInCanvas) {
    renderPresetViews(scene);
  }

  const raw_data = buffer.get();

  if (raw_data && !appSettings.isPaused) {
    // skeleton update
    const convertedFrame = backendFrameToThree(raw_data.pose_estimate, (x, y) =>
      floor.patchWorld(x, y),
    );
    skel.setPose(convertedFrame.poseWorld);

    // Floor update
    const activated_patch = raw_data.activations;
    floor.animatePatch(
      activated_patch.positions,
      activated_patch.signals,
      appSettings.signalVisible,
      appSettings.threshold,
      (x, y) => floor.patchWorld(x, y),
    );
  }
}
