import { converter, formatRgb } from "culori";
import type {
    GradientBase,
    GradientLengthPercentage,
    GradientPosition,
    GradientStop,
    RadialGradient,
    RadialGradientSize,
} from "../../../gradients";
import type {
    ICanvasPaintResult,
    IGradientTransformerModule
} from "../types";
import { expandRepeatingStopsTo, getMaxVisibleRadialT, resolveRenderableGradientStops } from "../helpers";

const toRgb = converter("rgb");
const RADIAL_GRADIENT_SAMPLE_COUNT = 128;

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

function getDistanceToSide(
    center: { x: number; y: number },
    width: number,
    height: number,
    side: "left" | "right" | "top" | "bottom",
): number {
    if (side === "left") return center.x;
    if (side === "right") return width - center.x;
    if (side === "top") return center.y;
    return height - center.y;
}

function getDistanceToCorner(
    center: { x: number; y: number },
    corner: { x: number; y: number },
): number {
    const dx = corner.x - center.x;
    const dy = corner.y - center.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function getCornerDeltas(
    center: { x: number; y: number },
    width: number,
    height: number,
): Array<{ dx: number; dy: number }> {
    return [
        { dx: -center.x, dy: -center.y },
        { dx: width - center.x, dy: -center.y },
        { dx: -center.x, dy: height - center.y },
        { dx: width - center.x, dy: height - center.y },
    ];
}

function scaleEllipseRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): { x: number; y: number } {
    const safeRadiusX = Math.max(radiusX, 0.0001);
    const safeRadiusY = Math.max(radiusY, 0.0001);

    const scale = Math.sqrt(
        (dx * dx) / (safeRadiusX * safeRadiusX) +
        (dy * dy) / (safeRadiusY * safeRadiusY),
    );

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

export class ModuleTransformerRadialGradientToCanvas
    implements IGradientTransformerModule<ICanvasPaintResult> {
    public readonly target = "canvas-2d";
    public readonly gradientType = "radial-gradient";

    public to(input: GradientBase<any>): ICanvasPaintResult {
        const gradient = input as RadialGradient;

        return {
            draw: (ctx, width, height) => {
                const center = this._resolveCenter(
                    gradient.config.position,
                    width,
                    height,
                );

                const radii = this._resolveRadialRadii(
                    gradient.config.size,
                    gradient.config.shape,
                    center,
                    width,
                    height,
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

                const renderStops = gradient.isRepeating
                    ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                    : baseStops;

                const { min, max, stops } = getStopRange(renderStops);

                let normalizedStops = stops;
                let innerFactor = 0;
                let outerFactor = gradient.isRepeating ? maxVisibleT : 1;

                if (gradient.isRepeating) {
                    normalizedStops = normalizeStops(stops, 0, maxVisibleT);
                } else if (min < 0 || max > 1) {
                    normalizedStops = normalizeStops(stops, min, max);
                    innerFactor = min;
                    outerFactor = max;
                }

                if (gradient.config.shape === "circle") {
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
                        g.addColorStop(stop.position, toCanvasColor(stop.value));
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
                    g.addColorStop(stop.position, toCanvasColor(stop.value));
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

    private _resolveCenter(
        position: GradientPosition,
        width: number,
        height: number,
    ): { x: number; y: number } {
        if (position.kind === "keywords") {
            return {
                x: this._resolveKeywordX(position.x, width),
                y: this._resolveKeywordY(position.y, height),
            };
        }

        return {
            x: this._resolve(position.x, width),
            y: this._resolve(position.y, height),
        };
    }

    private _resolveKeywordX(value: "left" | "center" | "right", width: number): number {
        if (value === "left") return 0;
        if (value === "center") return width / 2;
        return width;
    }

    private _resolveKeywordY(value: "top" | "center" | "bottom", height: number): number {
        if (value === "top") return 0;
        if (value === "center") return height / 2;
        return height;
    }

    private _resolveRadialRadii(
        size: RadialGradientSize,
        shape: "circle" | "ellipse",
        center: { x: number; y: number },
        width: number,
        height: number,
    ): { x: number; y: number } {
        if (size.kind === "explicit") {
            const radiusX = this._resolve(size.x, width);
            const radiusY = size.y
                ? this._resolve(size.y, height)
                : radiusX;

            return {
                x: Math.max(radiusX, 0.0001),
                y: Math.max(shape === "circle" ? radiusX : radiusY, 0.0001),
            };
        }

        const left = getDistanceToSide(center, width, height, "left");
        const right = getDistanceToSide(center, width, height, "right");
        const top = getDistanceToSide(center, width, height, "top");
        const bottom = getDistanceToSide(center, width, height, "bottom");

        if (shape === "circle") {
            const corners = [
                { x: 0, y: 0 },
                { x: width, y: 0 },
                { x: 0, y: height },
                { x: width, y: height },
            ];

            const cornerDistances = corners.map((corner) =>
                getDistanceToCorner(center, corner),
            );

            if (size.value === "closest-side") {
                const radius = Math.min(left, right, top, bottom);
                return { x: radius, y: radius };
            }

            if (size.value === "farthest-side") {
                const radius = Math.max(left, right, top, bottom);
                return { x: radius, y: radius };
            }

            if (size.value === "closest-corner") {
                const radius = Math.min(...cornerDistances);
                return { x: radius, y: radius };
            }

            const radius = Math.max(...cornerDistances);
            return { x: radius, y: radius };
        }

        const closestSideRadiusX = Math.min(left, right);
        const closestSideRadiusY = Math.min(top, bottom);

        const farthestSideRadiusX = Math.max(left, right);
        const farthestSideRadiusY = Math.max(top, bottom);

        if (size.value === "closest-side") {
            return {
                x: Math.max(closestSideRadiusX, 0.0001),
                y: Math.max(closestSideRadiusY, 0.0001),
            };
        }

        if (size.value === "farthest-side") {
            return {
                x: Math.max(farthestSideRadiusX, 0.0001),
                y: Math.max(farthestSideRadiusY, 0.0001),
            };
        }

        const corners = getCornerDeltas(center, width, height);

        if (size.value === "closest-corner") {
            const scaledRadii = corners.map((corner) =>
                scaleEllipseRadiiToCorner(
                    closestSideRadiusX,
                    closestSideRadiusY,
                    corner.dx,
                    corner.dy,
                ),
            );

            return scaledRadii.reduce((closest, current) => {
                const closestArea = closest.x * closest.y;
                const currentArea = current.x * current.y;

                return currentArea < closestArea ? current : closest;
            });
        }

        const scaledRadii = corners.map((corner) =>
            scaleEllipseRadiiToCorner(
                farthestSideRadiusX,
                farthestSideRadiusY,
                corner.dx,
                corner.dy,
            ),
        );

        return scaledRadii.reduce((farthest, current) => {
            const farthestArea = farthest.x * farthest.y;
            const currentArea = current.x * current.y;

            return currentArea > farthestArea ? current : farthest;
        });
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