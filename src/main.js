import { animate_csv, setup_csv_animate } from "./animate_csv";
import { animate_socket } from "./animate_socket";
import { SKELETON_COLORS } from "./utils/colors";
import './styles.css';
const use_socket = true;
const CSV_SKELETON_CONFIGS = [
  { path: "../video_poses.csv", color: SKELETON_COLORS[2], rotationOffset: 45 },
];

if (use_socket) {
  animate_socket(); // TODO disable socket when it's not being used (it spams the log)

} else {
  setup_csv_animate(CSV_SKELETON_CONFIGS);
  animate_csv();
}
