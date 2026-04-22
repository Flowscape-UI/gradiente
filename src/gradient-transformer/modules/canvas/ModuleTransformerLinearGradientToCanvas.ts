import { converter, formatRgb } from "culori";
import type { GradientBase, GradientStop, LinearGradient } from "../../../gradients";
import type { ICanvasPaintResult, IGradientTransformerModule } from "../types";

const toRgb = converter("rgb");

function toCanvasColor(input: string): string {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    return formatRgb(color);
}

function getStopRange(stops: GradientStop[]) {
    const colorStops = stops.filter(
        (stop) => stop.type === "color-stop" && stop.position != null,
    );

    if (!colorStops.length) {
        return { min: 0, max: 1, stops: [] };
    }

    const min = Math.min(...colorStops.map((stop) => stop.position));
    const max = Math.max(...colorStops.map((stop) => stop.position));

    return { min, max, stops: colorStops };
}

function normalizeStops(stops: GradientStop[], min: number, max: number) {
    const range = max - min || 1;

    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .map((stop) => ({
            ...stop,
            position: (stop.position - min) / range,
        }));
}

export class ModuleTransformerLinearGradientToCanvas
    implements IGradientTransformerModule<ICanvasPaintResult> {
    public readonly target = "canvas";
    public readonly gradientType = "linear-gradient";

    public to(input: GradientBase<any>): ICanvasPaintResult {
        const gradient = input as LinearGradient;

        return {
            draw: (ctx, width, height) => {
                const angle = gradient.config.angle;
                const cx = width / 2;
                const cy = height / 2;
                const half = Math.max(width, height) / 2;

                const dx = Math.sin(angle) * half;
                const dy = Math.cos(angle) * half;

                const x0 = cx - dx;
                const y0 = cy - dy;
                const x1 = cx + dx;
                const y1 = cy + dy;

                const { min, max, stops } = getStopRange(gradient.stops);

                let startX = x0;
                let startY = y0;
                let endX = x1;
                let endY = y1;
                let normalizedStops = stops;

                if (min < 0 || max > 1) {
                    const vx = x1 - x0;
                    const vy = y1 - y0;

                    startX = x0 + vx * min;
                    startY = y0 + vy * min;
                    endX = x0 + vx * max;
                    endY = y0 + vy * max;

                    normalizedStops = normalizeStops(stops, min, max);
                }

                const canvasGradient = ctx.createLinearGradient(
                    startX,
                    startY,
                    endX,
                    endY,
                );

                for (const stop of normalizedStops) {
                    canvasGradient.addColorStop(stop.position, toCanvasColor(stop.value));
                }

                ctx.fillStyle = canvasGradient;
                ctx.fillRect(0, 0, width, height);
            }
        };
    }
}