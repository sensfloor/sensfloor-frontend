import { appSettings } from "../config.js";

class SimpleGUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  // Add a Slider
  addSlider(label, min, max, initialValue, step, onChange) {
    const wrapper = document.createElement("div");
    wrapper.className = "gui-control";

    // Header with Label and Value display
    const header = document.createElement("div");
    header.className = "gui-label";
    header.innerHTML = `<span>${label}</span> <span class="gui-value">${initialValue}</span>`;

    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = initialValue;

    input.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      header.querySelector(".gui-value").innerText = val; // Update number text
      onChange(val); // Trigger callback
    });

    wrapper.appendChild(header);
    wrapper.appendChild(input);
    this.container.appendChild(wrapper);
  }

  addToggle(label, initialValue, onChange) {
    const wrapper = document.createElement("div");
    wrapper.className = "gui-control gui-toggle-row";

    // Label Text
    const span = document.createElement("span");
    span.className = "gui-label";
    span.innerText = label;

    // Create Switch Container
    const switchLabel = document.createElement("label");
    switchLabel.className = "gui-switch";

    // The hidden checkbox
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = initialValue;
    input.addEventListener("change", (e) => {
      onChange(e.target.checked);
    });

    // The visual slider
    const slider = document.createElement("span");
    slider.className = "gui-slider";

    // Assemble: switchLabel -> input + slider
    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);

    // Add to wrapper
    wrapper.appendChild(span);
    wrapper.appendChild(switchLabel);
    this.container.appendChild(wrapper);
  }
  // Add a Button
  addButton(label, onClick) {
    const btn = document.createElement("button");
    btn.className = "gui-btn";
    btn.innerText = label;
    btn.addEventListener("click", onClick);
    this.container.appendChild(btn);
  }
}

// Initialize the GUI
const gui = new SimpleGUI("gui-container");

export function setupGui() {
  gui.addSlider("Smoothing", 0, 1, appSettings.smoothingFactor, 0.01, (val) => {
    appSettings.smoothingFactor = val;
  });

  gui.addButton("Pause / Play", () => {
    appSettings.isPaused = !appSettings.isPaused;
  });

  gui.addToggle("show / hide signals", appSettings.signalVisible, (val) => {
    appSettings.signalVisible = val;
  });
  
}
