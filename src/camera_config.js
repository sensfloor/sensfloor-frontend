// src/config/camera_config.js

export const CAMERA_CONFIGS = {
  main: {
    type: "perspective",
    role: "main",
    position: [0, 3, 3],
    lookAt: [0, 0, 0],
    viewport: "full",
  },

  present: {
    type: "perspective",
    role: "comparison",
    position: [-3.2, 1.5, 3.0],
    lookAt: [-1.5, 1.0, 1.0],
    viewport: {
      width: 220,
      height: 220,
      margin: 20,
      corner: "bottom-right"
    }
  },

  top: {
    type: "perspective",
    role: "top",
    position: [0, 5, 0],
    lookAt: [0, 0, 0],
    viewport: {
      width: 220,
      height: 220,
      margin: 20,
      corner: "bottom-left"
    }
  }
};
