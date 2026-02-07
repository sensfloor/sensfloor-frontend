import * as THREE from "three";
import { POSE_LANDMARKS } from "../utils/consts";

export function backendFrameToThree(data, patchToWorld) {
  const poseEstimate = data.pose_estimate
  //  position_x, position_y (patch coordinates of hip)
  const hipPatch = { x: poseEstimate.position_x, y: poseEstimate.position_y };
  const T = patchToWorld(hipPatch.x, hipPatch.y); // TODO: refactor this patchToWorl logic

  const poseWorld = new Map();

  // array of joints  {joint: str, x, y, z}
  const joints = poseEstimate.pose;
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
