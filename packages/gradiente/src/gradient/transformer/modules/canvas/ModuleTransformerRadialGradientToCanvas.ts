import { GradientRadial } from "../../../kind/radial";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ICanvasPaintResult } from "../types";
import {
    expandRepeatingStopsTo,
    formatColorForCanvas,
    getMaxVisibleRadialT,
    getRenderableStopRange,
    normalizeRenderableStops,
    resolveGradientPosition,
    resolveRadialRadii,
    resolveRenderableGradientStops,
} from "../helpers";

const RADIAL_GRADIENT_SAMPLE_COUNT = 128;

export class ModuleTransformerRadialGradientToCanvas
extends GradientTransformerModule<GradientRadial, ICanvasPaintResult> {
    constructor() {
        super({
            target: "canvas-2d",
            gradientType: "radial-gradient",
            gradientClass: GradientRadial,
            expectedName: "GradientRadial",
        });
    }

    protected transform(gradient: GradientRadial): ICanvasPaintResult {
        return {
            draw: (ctx, width, height) => {
                const config = gradient.getConfig();
                const isRepeating = gradient.isRepeating();
                const center = resolveGradientPosition(
                    config.position,
                    width,
                    height,
                    {
                        context: "Canvas radial gradient",
                        allowUnsupportedUnitAsRaw: true,
                    },
                );

                const radii = resolveRadialRadii(
                    config.size,
                    config.shape,
                    center,
                    width,
                    height,
                    {
                        context: "Canvas radial gradient",
                        allowUnsupportedUnitAsRaw: true,
                    },
                );

                const maxVisibleT = getMaxVisibleRadialT(
                    center,
                    radii,
                    width,
                    height,
                );

                const baseStops = resolveRenderableGradientStops(
                    gradient,
                    RADIAL_GRADIENT_SAMPLE_COUNT,
                );

                const renderStops = isRepeating
                    ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                    : baseStops;

                const { min, max, stops } = getRenderableStopRange(renderStops);

                let normalizedStops = stops;
                let innerFactor = 0;
                let outerFactor = isRepeating ? maxVisibleT : 1;

                if (isRepeating) {
                    normalizedStops = normalizeRenderableStops(stops, 0, maxVisibleT);
                } else if (min < 0 || max > 1) {
                    normalizedStops = normalizeRenderableStops(stops, min, max);
                    innerFactor = min;
                    outerFactor = max;
                }

                if (config.shape === "circle") {
                    const baseRadius = radii.x;

                    const innerRadius = Math.max(0, baseRadius * innerFactor);
                    const outerRadius = Math.max(
                        innerRadius + 0.0001,
                        baseRadius * outerFactor,
                    );

                    const g = ctx.createRadialGradient(
                        center.x,
                        center.y,
                        innerRadius,
                        center.x,
                        center.y,
                        outerRadius,
                    );

                    for (const stop of normalizedStops) {
                        g.addColorStop(
                            stop.position,
                            formatColorForCanvas(stop.value),
                        );
                    }

                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, width, height);
                    return;
                }

                // ellipse
                const outerRadius = Math.max(radii.x, radii.y);
                const scaleX = radii.x / outerRadius;
                const scaleY = radii.y / outerRadius;

                const innerRadius = Math.max(0, outerRadius * innerFactor);
                const scaledOuterRadius = Math.max(
                    innerRadius + 0.0001,
                    outerRadius * outerFactor,
                );

                ctx.save();
                ctx.translate(center.x, center.y);
                ctx.scale(scaleX, scaleY);

                const g = ctx.createRadialGradient(
                    0,
                    0,
                    innerRadius,
                    0,
                    0,
                    scaledOuterRadius,
                );

                for (const stop of normalizedStops) {
                    g.addColorStop(
                        stop.position,
                        formatColorForCanvas(stop.value),
                    );
                }

                ctx.fillStyle = g;

                // Рисуем в локальных координатах после scale
                const drawRadius = scaledOuterRadius + 2;
                ctx.fillRect(
                    -drawRadius / scaleX * 2,
                    -drawRadius / scaleY * 2,
                    (drawRadius / scaleX) * 4,
                    (drawRadius / scaleY) * 4,
                );

                ctx.restore();
            },
        };
    }
}
