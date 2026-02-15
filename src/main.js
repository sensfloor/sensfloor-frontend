import { animateCSV, setupCSVAnimate } from "./controller/animate-csv.js";
import { animateSocket } from "./controller/animate-socket.js";
import { CSV_SKELETON_CONFIGS, use_socket } from "./config.js";
import { setupGui } from "./controller/gui-controller.js";
import { setupSocketProvider } from "./provider/socket-provider.js";

setupGui();

if (use_socket) {
  setupSocketProvider();
  animateSocket();
} else {
  setupCSVAnimate(CSV_SKELETON_CONFIGS);
  animateCSV();
}
