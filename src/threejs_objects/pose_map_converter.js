import * as THREE from "three";
import { POSE_LANDMARKS } from "../utils/consts";

export function backendFrameToThree(data, patchToWorld) {
  //  position_x, position_y (patch coordinates of hip)
  const hipPatch = { x: data.position_x, y: data.position_y };
  const T = patchToWorld(hipPatch.x, hipPatch.y); // TODO: refactor this patchToWorl logic

  const poseWorld = new Map();

  // array of joints  {joint: str, x, y, z}
  const joints = data.pose;
  let lowestJoint = joints[0];
  for (const j of joints) {
    if (j.y > lowestJoint.y) {
      lowestJoint = j;
    }
  }

  // assume the lowest (probably foot) joint is touching the floor
  const LIFT = new THREE.Vector3(0, lowestJoint.y, 0);

  for (const j of joints) {
    const idx = POSE_LANDMARKS[j.joint];
    if (idx === undefined) continue;
    const p = new THREE.Vector3(j.x, -j.y, -j.z);
    poseWorld.set(idx, p.add(T).add(LIFT));
  }

  return {
    frame: data.frame ?? null,
    patchXY: hipPatch,
    poseWorld,
    floorWorld: T,
    readoutMessages: [],
  };
}
