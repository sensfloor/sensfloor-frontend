import { POSE_LANDMARKS } from "../utils/landmark.js";
import { appSettings } from "../config.js";

function parseCSVRow(rowObject) {
  const poseData = [];

  for (const [jointName, index] of Object.entries(POSE_LANDMARKS)) {
    const xKey = `x${index}`;
    const yKey = `y${index}`;
    const zKey = `z${index}`;

    if (rowObject[xKey]) {
      poseData.push({
        joint: jointName,
        x: rowObject[xKey],
        y: rowObject[yKey],
        z: rowObject[zKey],
      });
    }
  }

  return {
    position_x: 3,
    position_y: 2,
    pose: poseData,
  };
}
export async function streamMultipleCsvsToBuffer(filePaths, fps, buffer) {
  // This will be an array of arrays: [ [frame0_fileA, frame0_fileB], [frame1_fileA, frame1_fileB], ... ]
  let synchronizedFrames = [];

  console.log(`Fetching and synchronizing ${filePaths.length} files...`);

  try {
    for (let fileIdx = 0; fileIdx < filePaths.length; fileIdx++) {
      const path = filePaths[fileIdx];
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);

      const text = await response.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== ""); // Skip empty lines
      if (lines.length < 2) continue;

      console.log("text with length", lines.length);
      const headers = lines[0].split(",").map((h) => h.trim());

      // Start from 1 to skip headers
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",");
        const rowObject = {};

        headers.forEach((header, colIndex) => {
          const val = columns[colIndex];
          rowObject[header] = val === "" ? null : Number(val);
        });

        const processedRow = parseCSVRow(rowObject);

        const frameIndex = rowObject["frame"];
        if (!synchronizedFrames[frameIndex]) {
          synchronizedFrames[frameIndex] = [];
        }

        synchronizedFrames[frameIndex].push(processedRow);
      }
    }

    if (synchronizedFrames.length === 0) return;

    console.log(
      `Sync complete. Streaming ${synchronizedFrames.length} multi-pose frames.`,
    );

    let frameIndex = 0;
    const intervalMs = 1000 / fps;

    const pushFrame = () => {
      if (frameIndex >= synchronizedFrames.length) {
        return;
      }

      if (appSettings.isPaused) {
        setTimeout(pushFrame, 500);
        return;
      }

      const poses_from_frame = synchronizedFrames[frameIndex];
      if (poses_from_frame && poses_from_frame.length >= filePaths.length) {
        buffer.push(synchronizedFrames[frameIndex]);
      } else {
        console.log(
          "not all files have a pose for this one, skipping",
          poses_from_frame,
        );
      }

      frameIndex++;
      setTimeout(pushFrame, intervalMs);
    };

    pushFrame();
  } catch (err) {
    console.error("Error in parallel sync:", err);
  }
}
