import { animateCSV, setupCSVAnimate } from "./controller/animate-csv.js";
import { animateSocket } from "./controller/animate-socket.js";
import { CSV_SKELETON_CONFIGS, use_socket } from "./config.js";

if (use_socket) {
  animateSocket(); // TODO disable socket when it's not being used (it spams the log)
} else {
  setupCSVAnimate(CSV_SKELETON_CONFIGS);
  animateCSV();
}
