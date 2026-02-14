import * as THREE from "three";

export function createSkeletonMP({ excluded, bones, color, rotationOffset }) {
  const group = new THREE.Group();
  
  // Apply rotation
  group.rotation.y = rotationOffset * (Math.PI / 180);

  const jointGeom = new THREE.SphereGeometry(0.025, 16, 16);
  const jointMat = new THREE.MeshStandardMaterial({ color: color.jointColor, depthTest: false });
  const joints = new Map(); 

  const boneGeom = new THREE.BufferGeometry();
  const boneMat = new THREE.LineBasicMaterial({ color: color.boneColor, depthTest: false });
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

  // 1. DATA RECEIVER: Only calculates where things SHOULD go
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
        // Calculate the target local position (Absolute - Center)
        // We do NOT move the mesh here, just update the target
        joint.userData.target.copy(p).sub(center);
      }
    }
  }

  // 2. VISUAL UPDATER: Moves things smoothly every frame
  function tick() {
    const smoothingFactor = 0.2; // 0.1 = slow/smooth, 0.5 = fast/snappy

    // Smoothly move the entire group (Nose)
    group.position.lerp(group.userData.target, smoothingFactor);

    // Smoothly move all joints
    joints.forEach((joint) => {
        joint.position.lerp(joint.userData.target, smoothingFactor);
    });

    // Rebuild bones based on the CURRENT SMOOTHED positions
    // (We read from joint.position, not the raw data map)
    const pts = []; 
    for (const [a, b] of bones) {
      if (excluded.has(a) || excluded.has(b)) continue;
      
      const jointA = joints.get(a);
      const jointB = joints.get(b);
      
      if (!jointA || !jointB) continue;

      // Because joints are already local to the group, we just use their positions directly
      pts.push(
        jointA.position.x, jointA.position.y, jointA.position.z,
        jointB.position.x, jointB.position.y, jointB.position.z
      );
    }
    
    if (pts.length > 0) {
        boneGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        boneGeom.attributes.position.needsUpdate = true; // Important!
        boneGeom.computeBoundingSphere();
    }
  }

  // Return the new tick function alongside setPose
  return { group, setPose, tick };
}