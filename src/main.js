import { animate_csv } from "./animate_csv";
import { animate_socket } from "./animate_socket";

const use_socket = true;

if (use_socket) {
  animate_socket();
} else {
  animate_csv();
}
