import { createBuffer } from "../utils/buffer";

let ws = null;

export let buffer = null;

export function setupSocketProvider() {
  ws = new WebSocket("ws://127.0.0.1:8765");

  buffer = createBuffer();
  ws.onopen = () => {
    console.log(" WebSocket connected");
  };
  ws.onerror = (e) => {
    console.error(" WebSocket error", e);
  };

  ws.onclose = () => {
    console.warn(" WebSocket closed");
  };

  ws.onmessage = (e) => {
    const raw = JSON.parse(e.data);
    console.debug("Full raw data:", raw);
    buffer.push(raw);
  };
}
