let pauseButton = document.getElementById("pauseButton");
export let isPaused = false;
const handleKeyDown = () => {
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