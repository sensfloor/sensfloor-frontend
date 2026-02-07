import { createSkeletonMP } from "./skeleton.js";
import { backendFrameToThree } from "./pose_map_converter.js";
import { MP_BONES_BODY, EXCLUDED_JOINTS } from "./consts.js";
import { SKELETON_COLORS } from "./colors.js";
import { create_buffer } from "./buffer.js";
import { streamMultipleCsvsToBuffer } from "./csv_provider.js";
import {
  scene,
  camera,
  controls,
  renderer,
  floor,
} from "./three_js_scene_setup.js";

const CSV_SKELETON_CONFIGS = [
  { path: "../video_poses.csv", color: SKELETON_COLORS[5] },
  //{ path: "../predicted_poses_model_71.csv", color: SKELETON_COLORS[2] },
  {
    path: "../landmark_weighted_feet_predictions.csv",
    color: SKELETON_COLORS[0],
  },
];

const buffer = create_buffer();
const csvPaths = CSV_SKELETON_CONFIGS.map((cfg) => cfg.path);
streamMultipleCsvsToBuffer(csvPaths, 15, buffer);

// Create skeletons dynamically based on config
const skeletons = CSV_SKELETON_CONFIGS.map((cfg) => {
  const skel = createSkeletonMP({
    excluded: EXCLUDED_JOINTS,
    bones: MP_BONES_BODY,
    color: cfg.color,
  });
  scene.add(skel.group);
  return skel;
});

export function animate_csv() {
  requestAnimationFrame(animate_csv);
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
