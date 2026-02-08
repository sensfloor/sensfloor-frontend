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

const skel = createSkeletonMP({
  excluded: EXCLUDED_JOINTS,
  bones: MP_BONES_BODY,
  color: SKELETON_COLORS[0],
  rotationOffset: 45,
});
scene.add(skel.group);

export function animate_socket() {
  requestAnimationFrame(animate_socket);
  controls.update();
  renderer.render(scene, camera);

  const raw_data = buffer.get();

  if (raw_data) {
      // update skelton
      const convertedFrame = backendFrameToThree(raw_data.pose_estimate, (x, y) =>
        floor.patchWorld(x, y),
      );
      skel.setPose(convertedFrame.poseWorld);   // convertedFrame.poseWorld = dictionary of joints idx to world coordinates of joints

      // update floor signals
      const activated_pathch = raw_data.activations;
      //console.log("activated patch:", activated_pathch.positions);
      floor.animatePatch(activated_pathch.positions,(x, y) => floor.patchWorld(x, y));
  }
}
