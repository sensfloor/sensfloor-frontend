export let isPaused = false;

const handleKeyDown = (event) => {
  // Check for Space bar
  if (event.code === "Space") {
    event.preventDefault(); // Prevent page scrolling
    isPaused = !isPaused;
    console.log(isPaused ? "Stream Paused" : "Stream Resumed");
  }
};

document.addEventListener("keydown", handleKeyDown);
