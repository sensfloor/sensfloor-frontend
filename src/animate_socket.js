import { backendFrameToThree } from "./threejs_objects/pose_map_converter.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "./threejs_objects/three_js_scene_setup.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./utils/consts.js";
import { buffer } from "./provider/socket_provider.js";
import { SKELETON_COLORS } from "./utils/colors.js";
import { createSkeletonMP } from "./threejs_objects/skeleton.js";
import { initial_Previews, renderPresetViews }  from "./preview/present_preview.js";

const skel = createSkeletonMP({
  excluded: EXCLUDED_JOINTS,
  bones: MP_BONES_BODY,
  color: SKELETON_COLORS[0],
  rotationOffset: 45,
});
scene.add(skel.group);

export function animate_socket() {
  requestAnimationFrame(animate_socket);
  
  if (skel && skel.tick) skel.tick(); 

  controls.update();
  renderer.render(scene, camera);
  renderPresetViews(scene,camera, controls);

  const raw_data = buffer.get();

  if (raw_data) {
    
    // skeleton update
    const convertedFrame = backendFrameToThree(raw_data.pose_estimate, (x, y) =>
        floor.patchWorld(x, y),
      );
      skel.setPose(convertedFrame.poseWorld); 

      // Floor update...
      const activated_patch = raw_data.activations;
      floor.animatePatch(activated_patch.positions, activated_patch.signals, (x, y) => floor.patchWorld(x, y));
  }
}
