import * as THREE from "three";

// Added 'rotationOffset' to the destructuring (defaults to 0 if not provided)
export function createSkeletonMP({ excluded, bones, color, rotationOffset }) {
  const group = new THREE.Group();

  console.debug(rotationOffset)
  
  // 1. Apply the fixed rotation axis immediately
  // We convert degrees to radians (Deg * PI / 180)
  // Rotating Y axis is usually the vertical "up/down" axis (pirouette)
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

  function ensureJoint(mpIndex) {
    if (excluded.has(mpIndex)) return null;
    if (!joints.has(mpIndex)) {
      const m = new THREE.Mesh(jointGeom, jointMat);
      joints.set(mpIndex, m);
      group.add(m);
    }
    return joints.get(mpIndex);
  }

 function setPose(poseMap) {
    // 1. Find the "Nose" (Index 0) to use as the pivot point
    const noseRaw = poseMap.get(0);
    // Fallback to (0,0,0) if nose isn't found, to prevent crash
    const center = noseRaw ? noseRaw : new THREE.Vector3(0, 0, 0);

    // 2. Move the entire Group container to the Nose's world position.
    // This ensures the skeleton visually appears in the correct spot.
    if (noseRaw) {
        group.position.copy(noseRaw);
    }

    // 3. Update Joints: Subtract 'center' so the Nose is always at local (0,0,0)
    for (const [idx, p] of poseMap.entries()) {
      const joint = ensureJoint(idx);
      if (joint) {
        // Local Pos = Absolute Pos - Nose Pos
        joint.position.copy(p).sub(center);
      }
    }

    // 4. Update Bone Lines: Subtract 'center' from these coords too
    const pts = []; 
    for (const [a, b] of bones) {
      if (excluded.has(a) || excluded.has(b)) continue;
      
      const pa = poseMap.get(a);
      const pb = poseMap.get(b);
      if (!pa || !pb) continue;

      // We push (Position - Center)
      pts.push(
        pa.x - center.x, pa.y - center.y, pa.z - center.z,
        pb.x - center.x, pb.y - center.y, pb.z - center.z
      );
    }
    
    boneGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    boneGeom.computeBoundingSphere();
  }

  return { group, setPose };
}