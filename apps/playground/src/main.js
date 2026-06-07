import "./style.css";
import { setupThemeToggle } from "./theme-toggle";
import { setupFormController } from "./form-controller";

import iconReload from "./assets/icon-reload.svg";
import iconSend from "./assets/icon-send.svg";
import iconUndo from "./assets/icon-undo.svg";

document.documentElement.style.setProperty(
  "--icon-reload",
  `url("${iconReload}")`
);

document.documentElement.style.setProperty(
  "--icon-send",
  `url("${iconSend}")`
);

document.documentElement.style.setProperty(
  "--icon-undo",
  `url("${iconUndo}")`
);

const SVG_PREVIEWS = {
  text: `
    <text
      x="50%"
      y="20%"
      dominant-baseline="middle"
      text-anchor="middle"
      class="svg text"
    >Gradiente</text>
  `,
  square: `
    <rect
      x="70"
      y="0"
      width="180"
      height="180"
      rx="8"
      class="svg"
    />
  `,
  string: `
    <path
      class="svg svg-string"
      fill="none"
      stroke="currentColor"
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M24 120 C 72 28, 118 154, 160 88 S 246 24, 296 104"
    />
  `,
};

function renderCard({ target, title, content }) {
  return `
    <div class="gradient-container" data-target="${target}">
      <h3 class="title">${title}</h3>
      ${content}
      <p class="gradient-error" aria-live="polite"></p>
    </div>
  `;
}

function renderCssCard() {
  return renderCard({
    target: "css",
    title: "CSS",
    content: `<div class="draw-area"></div>`,
  });
}

function renderCanvasCard(target, title, className) {
  return renderCard({
    target,
    title,
    content: `<canvas class="draw-area ${className}"></canvas>`,
  });
}

function renderSvgCard(target, title, preview) {
  return renderCard({
    target,
    title,
    content: `
      <svg
        class="draw-area"
        data-svg-example="${preview}"
        viewBox="0 0 320 180"
        role="img"
        aria-label="${title} SVG gradient preview"
      >
        ${SVG_PREVIEWS[preview]}
      </svg>
    `,
  });
}

document.querySelector("#app").innerHTML = `
  <header>
    <button type="button" class="theme-toggle" aria-label="Toggle theme">
      <span class="theme-toggle-icon"></span>
    </button>
  </header>

  <div class="container playground">
    <form class="form">
      <button
        type="button"
        class="history-control history-undo"
        aria-label="Undo gradient"
        disabled
      >
        <img width="24px" height="24px" src="${iconUndo}" alt="" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="history-control history-redo"
        aria-label="Redo gradient"
        hidden
      >
        <img class="history-redo-icon" width="24px" height="24px" src="${iconUndo}" alt="" aria-hidden="true" />
      </button>
      <input
        class="gradient-input"
        placeholder="Write gradient here..."
      />
      <button type="submit">
        <img width="30px" height="30px" src="${iconSend}" alt="Send" />
      </button>
      <button type="button" class="generate-random-gradient">
        <img width="30px" height="30px" src="${iconReload}" alt="Reload" />
      </button>
    </form>

    <aside class="history-panel" aria-label="Gradient session history">
      <h2 class="history-title">History</h2>
      <ol class="history-list"></ol>
    </aside>

    <div class="container content">
      <div class="gradient-container" data-target="css-original">
        <h3 class="title">CSS Original</h3>
        <div class="draw-area"></div>
        <p class="gradient-error" aria-live="polite"></p>
      </div>

      <div class="container transformer-content">
        ${renderCssCard()}
        ${renderCanvasCard("canvas2d", "Canvas 2D", "canvas-2d-area")}
        ${renderCanvasCard("canvasWebGL", "Canvas WebGL", "canvas-webgl-area")}
      </div>

      <div class="container transformer-content svg-content">
        ${renderSvgCard("svg-text", "SVG Text", "text")}
        ${renderSvgCard("svg-square", "SVG Square", "square")}
        ${renderSvgCard("svg-string", "SVG String", "string")}
      </div>
    </div>
  </div>
`;

setupThemeToggle();
setupFormController();
