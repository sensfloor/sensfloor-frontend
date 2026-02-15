import * as THREE from "three";
import { appSettings } from "../config.js";

export function createSkeletonMP({ excluded, bones, color, rotationOffset }) {
  const group = new THREE.Group();

  group.rotation.y = rotationOffset * (Math.PI / 180);

  const jointGeom = new THREE.SphereGeometry(0.025, 16, 16);
  const jointMat = new THREE.MeshStandardMaterial({
    color: color.jointColor,
    depthTest: false,
  });
  const joints = new Map();

  const boneGeom = new THREE.BufferGeometry();
  const boneMat = new THREE.LineBasicMaterial({
    color: color.boneColor,
    depthTest: false,
  });
  const boneLine = new THREE.LineSegments(boneGeom, boneMat);
  group.add(boneLine);

  // Initialize a target for the group itself (the nose position)
  group.userData.target = new THREE.Vector3();

  function ensureJoint(mpIndex) {
    if (excluded.has(mpIndex)) return null;
    if (!joints.has(mpIndex)) {
      const m = new THREE.Mesh(jointGeom, jointMat);
      // Initialize a target for this specific joint
      m.userData.target = new THREE.Vector3();
      joints.set(mpIndex, m);
      group.add(m);
    }
    return joints.get(mpIndex);
  }

  function setPose(poseMap) {
    const noseRaw = poseMap.get(0);
    const center = noseRaw ? noseRaw : new THREE.Vector3(0, 0, 0);

    // Update Group Target (Nose)
    if (noseRaw) {
      group.userData.target.copy(noseRaw);
    }

    // Update Joint Targets
    for (const [idx, p] of poseMap.entries()) {
      const joint = ensureJoint(idx);
      if (joint) {
        joint.userData.target.copy(p).sub(center);
      }
    }
  }

  function tick() {
    // Smoothly move the entire group (Nose)
    group.position.lerp(group.userData.target, appSettings.smoothingFactor);

    // Smoothly move all joints
    joints.forEach((joint) => {
      joint.position.lerp(joint.userData.target, appSettings.smoothingFactor);
    });

    // Rebuild bones
    const pts = [];
    for (const [a, b] of bones) {
      if (excluded.has(a) || excluded.has(b)) continue;

      const jointA = joints.get(a);
      const jointB = joints.get(b);

      if (!jointA || !jointB) continue;

      pts.push(
        jointA.position.x,
        jointA.position.y,
        jointA.position.z,
        jointB.position.x,
        jointB.position.y,
        jointB.position.z,
      );
    }

    if (pts.length > 0) {
      boneGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pts, 3),
      );
      boneGeom.attributes.position.needsUpdate = true; // Important!
      boneGeom.computeBoundingSphere();
    }
  }

  return { group, setPose, tick };
}
