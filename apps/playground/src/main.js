import "./style.css";
import { setupThemeToggle } from "./theme-toggle";
import { setupFormController } from "./form-controller";

import iconReload from "./assets/icon-reload.svg";
import iconSend from "./assets/icon-send.svg";

document.documentElement.style.setProperty(
  "--icon-reload",
  `url("${iconReload}")`
);

document.documentElement.style.setProperty(
  "--icon-send",
  `url("${iconSend}")`
);

document.querySelector("#app").innerHTML = `
  <header>
    <button type="button" class="theme-toggle" aria-label="Toggle theme">
      <span class="theme-toggle-icon"></span>
    </button>
  </header>

  <div class="container playground">
    <form class="form">
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

    <div class="container content">
      <div class="gradient-container" data-target="css-original">
        <h2 class="title">CSS Original View</h2>
        <div class="draw-area"></div>
      </div>

      <div class="container transformer-content">
        <div class="gradient-container" data-target="css">
          <h2 class="title">CSS View</h2>
          <div class="draw-area"></div>
        </div>
        <div class="gradient-container" data-target="canvas2d">
          <h2 class="title">Canvas 2D view</h2>
          <canvas class="draw-area canvas-2d-area"></canvas>
        </div>
        <div class="gradient-container" data-target="canvasWebGL">
          <h2 class="title">Canvas WebGL view</h2>
          <canvas class="draw-area canvas-webgl-area"></canvas>
        </div>
      </div>
    </div>
  </div>
`;

setupThemeToggle();
setupFormController();