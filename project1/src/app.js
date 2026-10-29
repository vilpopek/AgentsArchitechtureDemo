// Covers: REQ-FUNC-002
import { IMAGES } from "./images.js";

export function pickRandomImage(images) {
  if (!images || images.length === 0) {
    throw new Error("pickRandomImage: images pool must not be empty");
  }
  const index = Math.floor(Math.random() * images.length);
  return images[index];
}

// Covers: REQ-FUNC-003
export function pickRandomColor() {
  const channel = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  return `#${channel()}${channel()}${channel()}`;
}

// Exported so tests can drive the click → random-image → DOM-update orchestration directly.
export function wireUpPage() {
  const button = document.getElementById("reveal-button");
  const display = document.getElementById("image-display");
  if (button && display) {
    button.addEventListener("click", () => {
      const image = pickRandomImage(IMAGES);
      display.innerHTML = "";
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.name;
      display.appendChild(img);
    });
  }

  // Covers: REQ-FUNC-003 — independent handler, no shared state with image reveal.
  const colorButton = document.getElementById("color-button");
  if (colorButton) {
    colorButton.addEventListener("click", () => {
      document.body.style.backgroundColor = pickRandomColor();
    });
  }
}

if (typeof document !== "undefined") {
  wireUpPage();
}
