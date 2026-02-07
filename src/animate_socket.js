import { backendFrameToThree } from "./pose_map_converter.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "./three_js_scene_setup.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./consts.js";
import { buffer } from "./socket_provider.js";
import { SKELETON_COLORS } from "./colors.js";
import { createSkeletonMP } from "./skeleton.js";

const skel = createSkeletonMP({
  excluded: EXCLUDED_JOINTS,
  bones: MP_BONES_BODY,
  color: SKELETON_COLORS[0],
});
scene.add(skel.group);

export function animate_socket() {
  requestAnimationFrame(animate_socket);
  controls.update();
  renderer.render(scene, camera);

  const raw_data = buffer.get();
  const convertedFrame = backendFrameToThree(raw_data, (x, y) =>
    floor.patchWorld(x, y),
  );
  skel.setPose(convertedFrame.poseWorld);
}
