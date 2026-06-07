import {
    GradientTransformer,
} from "gradiente";
import { randomGradient } from "./random-gradient";

export function setupFormController() {
    const form = document.querySelector(".form");
    const input = document.querySelector(".gradient-input");
    const containers = document.querySelectorAll(".gradient-container");
    const undoButton = document.querySelector(".history-undo");
    const redoButton = document.querySelector(".history-redo");
    const historyList = document.querySelector(".history-list");

    if (!form || !input || !undoButton || !redoButton || !historyList) {
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

    const history = [];
    let historyIndex = -1;

    randomButton.addEventListener("click", () => {
        const gradient = randomGradient();

        input.value = gradient;
        applyGradient(gradient);
    });

    function setRedoVisibility() {
        const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

        redoButton.hidden = !canRedo;
        redoButton.disabled = !canRedo;
    }

    function updateHistoryControls() {
        undoButton.disabled = historyIndex <= 0;
        setRedoVisibility();
    }

    function clearHistoryList() {
        while (historyList.firstChild) {
            historyList.firstChild.remove();
        }
    }

    function renderHistory() {
        clearHistoryList();

        history.forEach((entry, index) => {
            const item = document.createElement("li");
            const button = document.createElement("button");
            const text = document.createElement("span");
            const preview = document.createElement("span");

            button.type = "button";
            button.className = "history-item";
            button.dataset.historyIndex = String(index);
            button.setAttribute(
                "aria-current",
                index === historyIndex ? "true" : "false",
            );
            text.className = "history-gradient-text";
            text.textContent = entry.source;
            preview.className = "history-gradient-preview";
            preview.style.background = entry.preview;

            button.append(text, preview);
            item.append(button);
            historyList.append(item);
        });
    }

    function resolveHistoryPreview(source, context) {
        const cachedCss = context.transforms.get("css");

        if (typeof cachedCss === "string") {
            return cachedCss;
        }

        try {
            return GradientTransformer.to("css", source);
        } catch {
            return source;
        }
    }

    function pushHistory(source, context) {
        if (history[historyIndex]?.source === source) {
            updateHistoryControls();
            renderHistory();
            return;
        }

        if (historyIndex < history.length - 1) {
            history.splice(historyIndex + 1);
        }

        history.push({
            source,
            preview: resolveHistoryPreview(source, context),
        });
        historyIndex = history.length - 1;

        updateHistoryControls();
        renderHistory();
    }

    function canRecordHistory(context) {
        return context.transforms.has("css");
    }

    function moveToHistoryIndex(nextIndex) {
        if (
            nextIndex < 0 ||
            nextIndex >= history.length ||
            nextIndex === historyIndex
        ) {
            return;
        }

        historyIndex = nextIndex;
        input.value = history[historyIndex].source;
        applyGradient(input.value, { record: false });
        updateHistoryControls();
        renderHistory();
    }

    function undoHistory() {
        moveToHistoryIndex(historyIndex - 1);
    }

    function redoHistory() {
        moveToHistoryIndex(historyIndex + 1);
    }

    function getErrorMessage(error) {
        return error instanceof Error
            ? error.message
            : String(error);
    }

    function setContainerError(container, message = "") {
        const error = container.querySelector(".gradient-error");

        if (error) {
            error.textContent = message;
        }

        container.dataset.state = message ? "error" : "ready";
    }

    function clearTarget(container) {
        const target = container.dataset.target;
        const drawArea = container.querySelector(".draw-area");

        if (!drawArea) {
            throw new Error("Draw area not found.");
        }

        if (target === "css" || target === "css-original") {
            drawArea.style.background = "";
            setContainerError(container);
            return;
        }

        if (target === "canvas2d" && drawArea instanceof HTMLCanvasElement) {
            const ctx = drawArea.getContext("2d");

            if (ctx) {
                ctx.clearRect(0, 0, drawArea.width, drawArea.height);
            }

            setContainerError(container);
            return;
        }

        if (target === "canvasWebGL" && drawArea instanceof HTMLCanvasElement) {
            // Do not request a 2D context here: canvas context type is sticky,
            // and a prior 2D context makes getContext("webgl") return null.
            drawArea.width = drawArea.clientWidth;
            drawArea.height = drawArea.clientHeight;
            setContainerError(container);
            return;
        }

        if (target?.startsWith("svg-") && drawArea instanceof SVGElement) {
            clearSvgGradient(drawArea);
            setContainerError(container);
        }
    }

    function applyToOriginalCss(container, source) {
        const drawArea = container.querySelector(".draw-area");
        if (!drawArea) {
            throw new Error("Original CSS draw area not found.");
        }
        drawArea.style.background = source;
    }

    function getTransform(context, target) {
        if (!context.transforms.has(target)) {
            context.transforms.set(
                target,
                GradientTransformer.to(target, context.source),
            );
        }

        return context.transforms.get(target);
    }

    function applyToCss(container, context) {
        const drawArea = container.querySelector(".draw-area");

        if (!drawArea) {
            throw new Error("CSS draw area not found.");
        }

        const cssGradient = getTransform(context, "css");
        drawArea.style.background = cssGradient;
    }

    function applyToCanvas2D(container, context) {
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

        const result = getTransform(context, "canvas-2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        result.draw(ctx, canvas.width, canvas.height);
    }

    function replaceCanvas(canvas) {
        const nextCanvas = canvas.cloneNode(false);

        canvas.replaceWith(nextCanvas);

        return nextCanvas;
    }

    function drawWebGL(canvas, context) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const result = getTransform(context, "canvas-webgl");
        result.draw(canvas, canvas.width, canvas.height);
    }

    function applyToWebGL(container, context) {
        let canvas = container.querySelector(".draw-area");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("WebGL draw area not found.");
        }

        try {
            drawWebGL(canvas, context);
        } catch (error) {
            canvas = replaceCanvas(canvas);
            drawWebGL(canvas, context);
        }
    }

    function clearSvgGradient(svg) {
        svg.querySelector('[data-gradiente-svg-defs="true"]')?.remove();
        svg.querySelectorAll("[data-gradiente-svg-target]").forEach((element) => {
            element.removeAttribute("data-gradiente-svg-target");
            element.removeAttribute("fill");
            element.removeAttribute("stroke");
            element.style.removeProperty("fill");
            element.style.removeProperty("stroke");
        });
    }

    function createSvgPaintServerId(container, id, mode) {
        const target = container.dataset.target ?? "svg";

        return `${id}-${target}-${mode}`;
    }

    function applyToSvg(container, context, mode) {
        const svg = container.querySelector("svg.draw-area");

        if (!(svg instanceof SVGElement)) {
            throw new Error("SVG draw area not found.");
        }

        const result = getTransform(context, "svg");
        const template = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
        );

        template.innerHTML = result.defs;

        const defs = template.querySelector("defs");

        if (!defs) {
            throw new Error("SVG transformer did not return defs.");
        }

        const paintServerId = createSvgPaintServerId(
            container,
            result.id,
            mode,
        );
        const paintServer = Array
            .from(defs.querySelectorAll("[id]"))
            .find((element) => element.id === result.id);

        if (!paintServer) {
            throw new Error("SVG transformer did not return a paint server.");
        }

        paintServer.id = paintServerId;

        clearSvgGradient(svg);

        defs.dataset.gradienteSvgDefs = "true";
        svg.prepend(defs);

        const paintUrl = `url(#${paintServerId})`;

        if (mode === "string") {
            const path = svg.querySelector("path");

            if (!path) {
                throw new Error("SVG string path not found.");
            }

            path.setAttribute("stroke", paintUrl);
            path.setAttribute("fill", "none");
            path.style.stroke = paintUrl;
            path.style.fill = "none";
            path.setAttribute("data-gradiente-svg-target", "true");
            return;
        }

        const shape = mode === "text"
            ? svg.querySelector("text")
            : svg.querySelector("rect");

        if (!shape) {
            throw new Error(`SVG ${mode} target not found.`);
        }

        shape.setAttribute("fill", paintUrl);
        shape.style.fill = paintUrl;
        shape.setAttribute("data-gradiente-svg-target", "true");
    }

    function applyGradientToContainer(container, context) {
        const target = container.dataset.target;

        if (target === "css-original") {
            applyToOriginalCss(container, context.source);
            return;
        }

        if (target === "css") {
            applyToCss(container, context);
            return;
        }

        if (target === "canvas2d") {
            applyToCanvas2D(container, context);
            return;
        }

        if (target === "canvasWebGL") {
            applyToWebGL(container, context);
            return;
        }

        if (target === "svg-text") {
            applyToSvg(container, context, "text");
            return;
        }

        if (target === "svg-square") {
            applyToSvg(container, context, "square");
            return;
        }

        if (target === "svg-string") {
            applyToSvg(container, context, "string");
            return;
        }

        throw new Error(`Unknown playground target: "${target}"`);
    }

    function applyGradient(value, options = {}) {
        const shouldRecord = options.record !== false;
        const source = value.trim();

        if (!source) {
            containers.forEach(clearTarget);
            return;
        }

        const context = {
            source,
            transforms: new Map(),
        };

        containers.forEach((container) => {
            clearTarget(container);

            try {
                applyGradientToContainer(container, context);
                setContainerError(container);
            } catch (error) {
                const message = getErrorMessage(error);

                clearTarget(container);
                setContainerError(container, message);
                console.error(
                    `Failed to apply ${container.dataset.target}:`,
                    error,
                );
            }
        });

        if (shouldRecord && canRecordHistory(context)) {
            pushHistory(source, context);
        }
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

    undoButton.addEventListener("click", undoHistory);
    redoButton.addEventListener("click", redoHistory);

    historyList.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const button = event.target.closest("[data-history-index]");

        if (!button) {
            return;
        }

        moveToHistoryIndex(Number(button.dataset.historyIndex));
    });

    document.addEventListener("keydown", (event) => {
        const isUndoRedo =
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "z";

        if (!isUndoRedo) {
            return;
        }

        event.preventDefault();

        if (event.shiftKey) {
            redoHistory();
            return;
        }

        undoHistory();
    });

    try {
        const initialGradient = randomGradient();
        input.value = initialGradient;
        applyGradient(initialGradient);
    } catch (error) {
        console.error("Failed to apply random gradient:", error);
    }
}
