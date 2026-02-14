import { backendFrameToThree } from "./threejs-objects/pose-map-converter.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "./threejs-objects/setup-scene.js"
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./utils/consts.js";
import { buffer } from "./provider/socket-provider.js";
import { SKELETON_COLORS } from "./utils/colors.js";
import { createSkeletonMP } from "./threejs-objects/skeleton.js";
import {update_canvas} from "./config.js";
import {renderPresetViews} from "./preview/present-preview.js";

const skel = createSkeletonMP({
  excluded: EXCLUDED_JOINTS,
  bones: MP_BONES_BODY,
  color: SKELETON_COLORS[0],
  rotationOffset: 45,
});
scene.add(skel.group);

export function animateSocket() {
  requestAnimationFrame(animateSocket);

  if (skel && skel.tick) skel.tick();

  controls.update();
  renderer.render(scene, camera);
  if (update_canvas){
    renderPresetViews(scene)
  }

  const raw_data = buffer.get();

  if (raw_data) {
    // skeleton update
    const convertedFrame = backendFrameToThree(raw_data.pose_estimate, (x, y) =>
      floor.patchWorld(x, y),
    );
    skel.setPose(convertedFrame.poseWorld);

    // Floor update...
    const activated_patch = raw_data.activations;
    floor.animatePatch(
      activated_patch.positions,
      activated_patch.signals,
      (x, y) => floor.patchWorld(x, y),
    );
  }
}
