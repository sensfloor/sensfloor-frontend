import { create_buffer } from "../utils/buffer";

const ws = new WebSocket("ws://127.0.0.1:8765");

export const buffer = create_buffer();

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
  console.debug("Full raw data:", JSON.stringify(raw, null, 2));

  // if (raw.pose.length != 0) {
  //   floor.setMarkerByPatch(raw.position_x, raw.position_y, true);
  // }else{
  //   floor.setMarkerByPatch(raw.position_x, raw.position_y, false);
  // }

  buffer.push(raw);
};
