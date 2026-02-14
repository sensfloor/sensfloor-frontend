import { animateCSV, setupCSVAnimate } from "./animate-csv";
import { animateSocket } from "./animate-socket";
import "./styles.css";
import { CSV_SKELETON_CONFIGS, use_socket } from "./config.js";

if (use_socket) {
  animateSocket(); // TODO disable socket when it's not being used (it spams the log)
} else {
  setupCSVAnimate(CSV_SKELETON_CONFIGS);
  animateCSV();
}
