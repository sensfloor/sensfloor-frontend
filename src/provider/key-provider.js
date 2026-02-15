let pauseButton = document.getElementById("pauseButton");
export let isPaused = false;
// add event for pause and resume buttun
const handleKeyDown = () => {
  // Check for Space bar
 // event.preventDefault(); // Prevent page scrolling
  isPaused = !isPaused;
  if (isPaused) {
    pauseButton.textContent = "Resume";
  } else {
    pauseButton.textContent = "Pause";
  }
  console.log(isPaused ? "Stream Paused" : "Stream Resumed");
};

document.addEventListener("DOMContentLoaded", () => {
    pauseButton = document.getElementById("pauseButton");
    if (pauseButton) {
        pauseButton.addEventListener("click", handleKeyDown);
    }
});