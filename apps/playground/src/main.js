import "./style.css";
import { randomGradient } from "./random-gradient";
import {
  parse,
  isGradient,
  format,
  GradientTransformer,
  parseStringToAbi
} from "gradiente";

document.querySelector("#app").innerHTML = `
  <div class="gradient-container" data-target="css">
    <h2>CSS gradients</h2>
    <div class="draw-area"></div>
    <form>
      <textarea
        class="gradient-input"
        placeholder="Write gradient here..."
      ></textarea>
      <button type="submit">Test</button>
    </form>
  </div>

  <div class="gradient-container" data-target="canvas">
    <h2>Canvas gradients</h2>
    <canvas class="draw-area canvas-area" width="300" height="300"></canvas>
    <form>
      <textarea
        class="gradient-input"
        placeholder="Write gradient here..."
      ></textarea>
      <button type="submit">Test</button>
    </form>
  </div>
`;


const containers = document.querySelectorAll(".gradient-container");

if (!containers.length) {
  throw new Error("Playground containers not found.");
}

function applyGradient(container, value) {
  const input = value.trim();
  const target = container.dataset.target;
  const textarea = container.querySelector(".gradient-input");
  const drawArea = container.querySelector(".draw-area");

  if (!textarea || !drawArea) {
    throw new Error("Container elements not found.");
  }

  if (!input) {
    if (target === "css") {
      drawArea.style.background = "";
    }

    if (target === "canvas" && drawArea instanceof HTMLCanvasElement) {
      const ctx = drawArea.getContext("2d");
      ctx.clearRect(0, 0, drawArea.width, drawArea.height);
    }

    return;
  }

  if (!isGradient(input)) {
    console.error("Invalid gradient:", input);
    return;
  }

  const gradient = parse(input);
  textarea.value = format(gradient);

  if (target === "css") {
    const cssGradient = GradientTransformer.to("css", gradient);
    drawArea.style.background = cssGradient;
    return;
  }

  if (target === "canvas" && drawArea instanceof HTMLCanvasElement) {
    const ctx = drawArea.getContext("2d");
    const result = GradientTransformer.to("canvas", gradient);

    ctx.clearRect(0, 0, drawArea.width, drawArea.height);
    result.draw(ctx, drawArea.width, drawArea.height);
  }
}

containers.forEach((container) => {
  const form = container.querySelector("form");
  const textarea = container.querySelector(".gradient-input");

  if (!form || !textarea) {
    throw new Error("Form or textarea not found.");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyGradient(container, textarea.value);
  });

  textarea.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      applyGradient(container, textarea.value);
    }
  });

  const initial = randomGradient();
  textarea.value = initial;
  applyGradient(container, initial);
});