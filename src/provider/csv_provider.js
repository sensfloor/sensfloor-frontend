import { POSE_LANDMARKS } from "../utils/consts.js";

function parse_csv_row(rowObject) {
  const poseData = [];

  // Iterate through all defined landmarks to find matching columns in the row
  for (const [jointName, index] of Object.entries(POSE_LANDMARKS)) {
    const xKey = `x${index}`;
    const yKey = `y${index}`;
    const zKey = `z${index}`;

    // Only add the joint if the data exists in the row
    if (rowObject[xKey] !== undefined) {
      poseData.push({
        joint: jointName,
        x: rowObject[xKey],
        y: rowObject[yKey],
        z: rowObject[zKey],
      });
    }
  }

  return {
    // These are placeholders as the CSV does not contain root position data
    position_x: 0,
    position_y: 0,
    pose: poseData,
  };
}
/**
 * Streams multiple CSV files in parallel.
 * Each 'tick' pushes an array containing one frame from EACH file.
 */
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

      const headers = lines[0].split(",").map((h) => h.trim());

      // Start from 1 to skip headers
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",");
        const rowObject = {};

        headers.forEach((header, colIndex) => {
          const val = columns[colIndex];
          rowObject[header] = isNaN(Number(val)) ? val : Number(val);
        });

        // Process the row through your existing parser
        const processedRow = parse_csv_row(rowObject);

        // Initialize the frame array if it doesn't exist yet
        const frameIndex = i - 1;
        if (!synchronizedFrames[frameIndex]) {
          synchronizedFrames[frameIndex] = [];
        }

        // Place this file's data into the correct "time slot"
        synchronizedFrames[frameIndex].push(processedRow);
      }
    }

    if (synchronizedFrames.length === 0) return;

    console.log(
      `Sync complete. Streaming ${synchronizedFrames.length} multi-pose frames.`,
    );

    // 2. Playback Loop
    let frameIndex = 0;
    const intervalMs = 1000 / fps;

    const pushFrame = () => {
      if (frameIndex >= synchronizedFrames.length) {
        console.log("Parallel stream finished.");
        return;
      }

      // Pushes an ARRAY of poses to the buffer
      buffer.push(synchronizedFrames[frameIndex]);

      frameIndex++;
      setTimeout(pushFrame, intervalMs);
    };

    pushFrame();
  } catch (err) {
    console.error("Error in parallel sync:", err);
  }
}
