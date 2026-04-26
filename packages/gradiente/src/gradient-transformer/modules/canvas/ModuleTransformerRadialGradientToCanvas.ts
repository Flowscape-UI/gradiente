import { converter, formatRgb } from "culori";
import type { GradientBase, GradientLengthPercentage, GradientStop, RadialGradient } from "../../../gradients";
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

    return stops.map((stop) => ({
        ...stop,
        position: (stop.position - min) / range,
    }));
}

export class ModuleTransformerRadialGradientToCanvas
    implements IGradientTransformerModule<ICanvasPaintResult> {
    public readonly target = "canvas";
    public readonly gradientType = "radial-gradient";

    public to(input: GradientBase<any>): ICanvasPaintResult {
        const gradient = input as RadialGradient;

        return {
            draw: (ctx, width, height) => {
                const pos = gradient.config.position;

                let x = width / 2;
                let y = height / 2;

                if (pos.kind === "values") {
                    x = this._resolve(pos.x, width);
                    y = this._resolve(pos.y, height);
                }

                const dx = Math.max(x, width - x);
                const dy = Math.max(y, height - y);
                const radius = Math.sqrt(dx * dx + dy * dy);

                const { min, max, stops } = getStopRange(gradient.stops);

                let innerRadius = 0;
                let outerRadius = radius;
                let normalizedStops = stops;

                if (min >= 0 && (min < 0 || max > 1)) {
                    innerRadius = radius * min;
                    outerRadius = radius * max;
                    normalizedStops = normalizeStops(stops, min, max);
                } else if (max > 1) {
                    outerRadius = radius * max;
                    normalizedStops = normalizeStops(stops, min, max);
                }

                const g = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);

                for (const stop of normalizedStops) {
                    g.addColorStop(stop.position, toCanvasColor(stop.value));
                }

                ctx.fillStyle = g;
                ctx.fillRect(0, 0, width, height);
            },
        };
    }

    private _resolve(value: GradientLengthPercentage, size: number): number {
        if (value.kind === "percent") {
            return (value.value / 100) * size;
        }

        if (value.unit === "px") {
            return value.value;
        }

        return value.value;
    }
}