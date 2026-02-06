import * as THREE from "three";

export function createSkeletonMP({ excluded, bones, color }) {
  // Root group that contains everything (joints + bone lines)
  const group = new THREE.Group();
  // Geometry/material shared by all joint spheres (efficient reuse)

  const jointGeom = new THREE.SphereGeometry(0.025, 16, 16);
  const jointMat = new THREE.MeshStandardMaterial({
    color: color.jointColor,
    depthTest: false,
  });
  // Map from MediaPipe joint index -> joint Mesh instance
  const joints = new Map(); // mpIndex -> Mesh

  // Single line geometry/material for all bones (updated every frame)
  const boneGeom = new THREE.BufferGeometry();
  const boneMat = new THREE.LineBasicMaterial({
    color: color.boneColor,
    depthTest: false,
  });
  // LineSegments expects pairs of vertices: (a->b) for each bone
  const boneLine = new THREE.LineSegments(boneGeom, boneMat);
  group.add(boneLine);

  // Ensure a joint mesh exists for the given mpIndex (unless excluded)
  function ensureJoint(mpIndex) {
    // Skip joints that we do not want to render
    if (excluded.has(mpIndex)) return null;
    if (!joints.has(mpIndex)) {
      const m = new THREE.Mesh(jointGeom, jointMat);
      joints.set(mpIndex, m);
      group.add(m);
    }
    return joints.get(mpIndex);
  }

  // Update the skeleton pose for this frame
  // poseMap: Map<mpIndex, THREE.Vector3> (or any object with x,y,z and copy-able)
  function setPose(poseMap) {
    // joints
    for (const [idx, p] of poseMap.entries()) {
      const joint = ensureJoint(idx);
      if (joint) joint.position.copy(p);
    }

    // ----- Update bone line segments -----
    const pts = []; // flat float array: [ax,ay,az, bx,by,bz, ax2,ay2,az2, bx2,by2,bz2, ...]
    for (const [a, b] of bones) {
      // Skip bones if either endpoint is excluded
      if (excluded.has(a) || excluded.has(b)) {
        continue;
      }
      // Get endpoint positions from poseMap
      const pa = poseMap.get(a);
      const pb = poseMap.get(b);
      if (!pa || !pb) continue;
      // Push the two endpoints for this line segment
      pts.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
    }
    boneGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    boneGeom.computeBoundingSphere();
  }

  return { group, setPose };
}
