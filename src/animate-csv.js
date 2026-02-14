import { createSkeletonMP } from "./threejs-objects/skeleton.js";
import { backendFrameToThree } from "./threejs-objects/pose-map-converter.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./utils/consts.js";
import { create_buffer } from "./utils/buffer.js";
import { streamMultipleCsvsToBuffer } from "./provider/csv-provider.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "./threejs-objects/setup-scene.js";

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
      rotationOffset: cfg.rotationOffset,
    });
    scene.add(skel.group);
    return skel;
  });
}

export function animate_csv() {
  requestAnimationFrame(animate_csv);

  controls.update();
  renderer.render(scene, camera);

  const raw_data_frames = buffer.get();

  skeletons.forEach((skel, index) => {
    if (skel && skel.tick) {
      skel.tick();
    }
  });

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
