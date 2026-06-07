import { converter, formatRgb } from "culori";
import type { GradientStop } from "../../../kind/base";
import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ICanvasPaintResult } from "../types";
import {
    getRenderableColorStops,
    type GradientRenderableColorStop,
    resolveRenderableGradientStops,
} from "../helpers";

const toRgb = converter("rgb");

function toCanvasColor(input: string): string {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    const formatted = formatRgb(color);

    if (formatted === undefined) {
        throw new Error(`Failed to format color: ${input}`);
    }

    return formatted;
}

function getStopRange(stops: GradientStop[]) {
    const colorStops = getRenderableColorStops(stops);

    if (!colorStops.length) {
        return { min: 0, max: 1, stops: [] };
    }

    const min = Math.min(...colorStops.map((stop) => stop.position));
    const max = Math.max(...colorStops.map((stop) => stop.position));

    return { min, max, stops: colorStops };
}

function normalizeStops(
    stops: GradientRenderableColorStop[],
    min: number,
    max: number,
) {
    const range = max - min || 1;

    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .map((stop) => ({
            ...stop,
            position: (stop.position - min) / range,
        }));
}

export class ModuleTransformerLinearGradientToCanvas
extends GradientTransformerModule<GradientLinear, ICanvasPaintResult> {
    constructor() {
        super({
            target: "canvas-2d",
            gradientType: "linear-gradient",
            gradientClass: GradientLinear,
            expectedName: "GradientLinear",
        });
    }

    protected transform(gradient: GradientLinear): ICanvasPaintResult {
        return {
            draw: (ctx, width, height) => {
                const angle = gradient.getConfig().angle;

                const dirX = Math.sin(angle);
                const dirY = -Math.cos(angle);

                const centerX = width / 2;
                const centerY = height / 2;

                const lineLength =
                    Math.abs(width * dirX) +
                    Math.abs(height * dirY);

                let startX = centerX - (dirX * lineLength) / 2;
                let startY = centerY - (dirY * lineLength) / 2;
                let endX = centerX + (dirX * lineLength) / 2;
                let endY = centerY + (dirY * lineLength) / 2;

                const renderStops = resolveRenderableGradientStops(gradient);
                const { min, max, stops } = getStopRange(renderStops);

                let normalizedStops = stops;

                if (min < 0 || max > 1) {
                    const vx = endX - startX;
                    const vy = endY - startY;

                    const baseStartX = startX;
                    const baseStartY = startY;

                    startX = baseStartX + vx * min;
                    startY = baseStartY + vy * min;
                    endX = baseStartX + vx * max;
                    endY = baseStartY + vy * max;

                    normalizedStops = normalizeStops(stops, min, max);
                }

                const canvasGradient = ctx.createLinearGradient(
                    startX,
                    startY,
                    endX,
                    endY,
                );

                for (const stop of normalizedStops) {
                    canvasGradient.addColorStop(
                        stop.position,
                        toCanvasColor(stop.value),
                    );
                }

                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = canvasGradient;
                ctx.fillRect(0, 0, width, height);
            }
        };
    }
}
