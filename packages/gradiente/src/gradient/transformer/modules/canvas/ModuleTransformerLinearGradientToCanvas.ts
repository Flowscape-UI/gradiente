import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ICanvasPaintResult } from "../types";
import {
    formatColorForCanvas,
    getRenderableStopRange,
    normalizeRenderableStops,
    resolveLinearGradientLine,
    resolveRenderableGradientStops,
} from "../helpers";

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
                const line = resolveLinearGradientLine(angle, width, height);
                let startX = line.start.x;
                let startY = line.start.y;
                let endX = line.end.x;
                let endY = line.end.y;

                const renderStops = resolveRenderableGradientStops(gradient);
                const { min, max, stops } = getRenderableStopRange(renderStops);

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

                    normalizedStops = normalizeRenderableStops(stops, min, max);
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
                        formatColorForCanvas(stop.value),
                    );
                }

                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = canvasGradient;
                ctx.fillRect(0, 0, width, height);
            }
        };
    }
}
