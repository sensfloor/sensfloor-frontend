import { createSkeletonMP } from "./threejs_objects/skeleton.js";
import { backendFrameToThree } from "./threejs_objects/pose_map_converter.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./utils/consts.js";
import { create_buffer } from "./utils/buffer.js";
import { streamMultipleCsvsToBuffer } from "./provider/csv_provider.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
  keys
} from "./threejs_objects/three_js_scene_setup.js";

let buffer = null;
let skeletons = null;
export function setup_csv_animate(config) {
  buffer = create_buffer();
  const csvPaths = config.map((cfg) => cfg.path);
  streamMultipleCsvsToBuffer(csvPaths, 15, buffer);

  // Create skeletons dynamically based on config
  skeletons = config.map((cfg) => {
    const skel = createSkeletonMP({
      excluded: EXCLUDED_JOINTS,
      bones: MP_BONES_BODY,
      color: cfg.color,
      rotationOffset: cfg.rotationOffset
    });
    scene.add(skel.group);
    return skel;
  });
}

export function animate_csv() {
  requestAnimationFrame(animate_csv);

  const moveSpeed = 0.1;
  if (keys['ArrowUp']) {
    camera.position.y += moveSpeed;
    controls.target.y += moveSpeed;
  }
  if (keys['ArrowDown']) {
    camera.position.y -= moveSpeed;
    controls.target.y -= moveSpeed;
  }
  if (keys['ArrowLeft']) {
    camera.position.x -= moveSpeed;
    controls.target.x -= moveSpeed;
  }
  if (keys['ArrowRight']) {
    camera.position.x += moveSpeed;
    controls.target.x += moveSpeed;
  }

  controls.update();
  renderer.render(scene, camera);

  const raw_data_frames = buffer.get(); // Assuming this returns an array of frames [frame1, frame2, ...]

  if (raw_data_frames && raw_data_frames.length > 0) {
    // Loop through the skeletons and update each with its corresponding frame data
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
