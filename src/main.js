import { animate_csv, setup_csv_animate } from "./animate_csv";
import { animate_socket } from "./animate_socket";
import { SKELETON_COLORS } from "./utils/colors";

const use_socket = false;

const CSV_SKELETON_CONFIGS = [
  { path: "../video_poses.csv", color: SKELETON_COLORS[5] },
  //{ path: "../predicted_poses_model_71.csv", color: SKELETON_COLORS[2] },
  //{path: "../landmark_weighted_feet_predictions.csv",  color: SKELETON_COLORS[0],},
];

if (use_socket) {
  animate_socket();
} else {
  setup_csv_animate(CSV_SKELETON_CONFIGS);
  animate_csv();
}
