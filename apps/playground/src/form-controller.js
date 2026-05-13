import {
    parse,
    isGradient,
    format,
    GradientTransformer,
    parseStringToAbi
} from "gradiente";
import { randomGradient } from "./random-gradient";

export function setupFormController() {
    const form = document.querySelector(".form");
    const input = document.querySelector(".gradient-input");
    const containers = document.querySelectorAll(".gradient-container");

    if (!form || !input) {
        throw new Error("Playground form elements not found.");
    }

    if (!containers.length) {
        throw new Error("Playground containers not found.");
    }

    // Generate random gradient by clicking the button
    const randomButton = document.querySelector(
        ".generate-random-gradient"
    );

    if (!randomButton) {
        throw new Error("Random gradient button not found.");
    }

    randomButton.addEventListener("click", () => {
        const gradient = randomGradient();

        input.value = gradient;
        applyGradient(gradient);
    });

    function clearTarget(container) {
        const target = container.dataset.target;
        const drawArea = container.querySelector(".draw-area");

        if (!drawArea) {
            throw new Error("Draw area not found.");
        }

        if (target === "css") {
            drawArea.style.background = "";
            return;
        }

        if (
            (target === "canvas2d" || target === "canvasWebGL") &&
            drawArea instanceof HTMLCanvasElement
        ) {
            const ctx = drawArea.getContext("2d");

            if (ctx) {
                ctx.clearRect(0, 0, drawArea.width, drawArea.height);
            }
        }
    }

    function applyToOriginalCss(container, source) {
        const drawArea = container.querySelector(".draw-area");
        if (!drawArea) {
            throw new Error("Original CSS draw area not found.");
        }
        drawArea.style.background = source;
    }

    function applyToCss(container, gradient) {
        const drawArea = container.querySelector(".draw-area");

        if (!drawArea) {
            throw new Error("CSS draw area not found.");
        }

        const cssGradient = GradientTransformer.to("css", gradient);
        drawArea.style.background = cssGradient;
    }

    function applyToCanvas2D(container, gradient) {
        const canvas = container.querySelector(".draw-area");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Canvas 2D draw area not found.");
        }

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Canvas 2D context not found.");
        }

        const result = GradientTransformer.to("canvas-2d", gradient);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        result.draw(ctx, canvas.width, canvas.height);
    }

    function applyToWebGL(container, gradient) {
        const canvas = container.querySelector(".draw-area");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("WebGL draw area not found.");
        }

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const result = GradientTransformer.to("canvas-webgl", gradient);
        result.draw(canvas, canvas.width, canvas.height);
    }

    function applyGradientToContainer(container, gradient) {
        const target = container.dataset.target;

        if (target === "css-original") {
            applyToOriginalCss(container, gradient);
            return;
        }

        if (target === "css") {
            applyToCss(container, gradient);
            return;
        }

        if (target === "canvas2d") {
            applyToCanvas2D(container, gradient);
            return;
        }

        if (target === "canvasWebGL") {
            applyToWebGL(container, gradient);
            return;
        }

        throw new Error(`Unknown playground target: "${target}"`);
    }

    function applyGradient(value) {
        const source = value.trim();

        if (!source) {
            containers.forEach(clearTarget);
            return;
        }

        if (!isGradient(source)) {
            console.error("Invalid gradient:", source);
            return;
        }

        const gradient = parse(source);
        const formatted = format(gradient);

        input.value = formatted;

        containers.forEach((container) => {
            applyGradientToContainer(container, gradient);
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        applyGradient(input.value);
    });

    input.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            applyGradient(input.value);
        }
    });

    try {
        const initialGradient = randomGradient();
        input.value = initialGradient;
        applyGradient(initialGradient);
    } catch (error) {
        console.error("Failed to apply random gradient:", error);
    }
}