import { converter } from "culori";
import {
    DiamondGradient,
    type GradientBase,
    type GradientLengthPercentage,
    type GradientPosition,
    type GradientStop,
    type RadialGradientSize,
} from "../../../gradients";
import { expandRepeatingStopsTo, resolveRenderableGradientStops } from "../helpers";
import type {
    ICanvasPaintResult,
    IGradientTransformerModule,
} from "../types";

const toRgb = converter("rgb");
const DIAMOND_GRADIENT_SAMPLE_COUNT = 128;
const DIAMOND_COLOR_LOOKUP_SIZE = 1024;

function toCanvasColor(input: string): [number, number, number, number] {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    return [
        Math.round((color.r ?? 0) * 255),
        Math.round((color.g ?? 0) * 255),
        Math.round((color.b ?? 0) * 255),
        Math.round((color.alpha ?? 1) * 255),
    ];
}

function getColorStops(stops: GradientStop[]): GradientStop[] {
    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);
}

function sampleColorAtPosition(
    stops: GradientStop[],
    position: number,
): [number, number, number, number] {
    if (stops.length === 0) {
        throw new Error("Cannot sample color from empty diamond gradient stops.");
    }

    if (stops.length === 1 || position <= stops[0].position) {
        return toCanvasColor(stops[0].value);
    }

    const lastStop = stops[stops.length - 1];

    if (position >= lastStop.position) {
        return toCanvasColor(lastStop.value);
    }

    for (let index = 0; index < stops.length - 1; index += 1) {
        const current = stops[index];
        const next = stops[index + 1];

        if (position >= current.position && position <= next.position) {
            const range = next.position - current.position || 1;
            const localT = (position - current.position) / range;
            const currentColor = toCanvasColor(current.value);
            const nextColor = toCanvasColor(next.value);

            return [
                Math.round(currentColor[0] + (nextColor[0] - currentColor[0]) * localT),
                Math.round(currentColor[1] + (nextColor[1] - currentColor[1]) * localT),
                Math.round(currentColor[2] + (nextColor[2] - currentColor[2]) * localT),
                Math.round(currentColor[3] + (nextColor[3] - currentColor[3]) * localT),
            ];
        }
    }

    return toCanvasColor(lastStop.value);
}

function buildColorLookup(
    stops: GradientStop[],
    maxT: number,
): Uint8ClampedArray {
    const lookup = new Uint8ClampedArray(DIAMOND_COLOR_LOOKUP_SIZE * 4);

    for (let index = 0; index < DIAMOND_COLOR_LOOKUP_SIZE; index += 1) {
        const position =
            (index / (DIAMOND_COLOR_LOOKUP_SIZE - 1)) * maxT;
        const color = sampleColorAtPosition(stops, position);
        const offset = index * 4;

        lookup[offset] = color[0];
        lookup[offset + 1] = color[1];
        lookup[offset + 2] = color[2];
        lookup[offset + 3] = color[3];
    }

    return lookup;
}

function getMaxVisibleDiamondT(
    center: { x: number; y: number },
    radii: { x: number; y: number },
    width: number,
    height: number,
): number {
    const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
    ];

    return Math.max(
        ...corners.map((corner) =>
            Math.abs(corner.x - center.x) / Math.max(radii.x, 0.0001) +
            Math.abs(corner.y - center.y) / Math.max(radii.y, 0.0001),
        ),
    );
}

function getDistanceToCorner(
    center: { x: number; y: number },
    corner: { x: number; y: number },
): number {
    return Math.abs(corner.x - center.x) + Math.abs(corner.y - center.y);
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

function scaleDiamondRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): { x: number; y: number } {
    const safeRadiusX = Math.max(radiusX, 0.0001);
    const safeRadiusY = Math.max(radiusY, 0.0001);
    const scale =
        Math.abs(dx) / safeRadiusX + Math.abs(dy) / safeRadiusY;

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

export class ModuleTransformerDiamondGradientToCanvas
    implements IGradientTransformerModule<ICanvasPaintResult> {
    public readonly target = "canvas-2d";
    public readonly gradientType = "diamond-gradient";

    public to(input: GradientBase<any>): ICanvasPaintResult {
        if (!(input instanceof DiamondGradient)) {
            throw new Error("Expected DiamondGradient");
        }

        const gradient = input;

        return {
            draw: (ctx, width, height) => {
                const center = this._resolveCenter(
                    gradient.config.position,
                    width,
                    height,
                );
                const radii = this._resolveDiamondRadii(
                    gradient.config.size,
                    gradient.config.shape,
                    center,
                    width,
                    height,
                );
                const maxVisibleT = getMaxVisibleDiamondT(
                    center,
                    radii,
                    width,
                    height,
                );
                const baseStops = resolveRenderableGradientStops(
                    gradient,
                    DIAMOND_GRADIENT_SAMPLE_COUNT,
                );
                const renderStops = getColorStops(
                    gradient.isRepeating
                        ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                        : baseStops,
                );
                const colorLookup = buildColorLookup(renderStops, maxVisibleT);
                const imageData = ctx.createImageData(width, height);
                const data = imageData.data;

                for (let y = 0; y < height; y += 1) {
                    for (let x = 0; x < width; x += 1) {
                        const t =
                            Math.abs(x - center.x) / Math.max(radii.x, 0.0001) +
                            Math.abs(y - center.y) / Math.max(radii.y, 0.0001);
                        const lookupIndex = Math.min(
                            DIAMOND_COLOR_LOOKUP_SIZE - 1,
                            Math.max(
                                0,
                                Math.round(
                                    (t / Math.max(maxVisibleT, 0.0001)) *
                                    (DIAMOND_COLOR_LOOKUP_SIZE - 1),
                                ),
                            ),
                        );
                        const lookupOffset = lookupIndex * 4;
                        const offset = (y * width + x) * 4;

                        data[offset] = colorLookup[lookupOffset];
                        data[offset + 1] = colorLookup[lookupOffset + 1];
                        data[offset + 2] = colorLookup[lookupOffset + 2];
                        data[offset + 3] = colorLookup[lookupOffset + 3];
                    }
                }

                ctx.putImageData(imageData, 0, 0);
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

    private _resolveDiamondRadii(
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

        const left = center.x;
        const right = width - center.x;
        const top = center.y;
        const bottom = height - center.y;

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
                const radius = Math.max(Math.min(left, right, top, bottom), 0.0001);
                return { x: radius, y: radius };
            }

            if (size.value === "farthest-side") {
                const radius = Math.max(Math.max(left, right, top, bottom), 0.0001);
                return { x: radius, y: radius };
            }

            if (size.value === "closest-corner") {
                const radius = Math.max(Math.min(...cornerDistances), 0.0001);
                return { x: radius, y: radius };
            }

            const radius = Math.max(Math.max(...cornerDistances), 0.0001);
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
            return corners
                .map((corner) =>
                    scaleDiamondRadiiToCorner(
                        closestSideRadiusX,
                        closestSideRadiusY,
                        corner.dx,
                        corner.dy,
                    ),
                )
                .reduce((closest, current) =>
                    current.x * current.y < closest.x * closest.y
                        ? current
                        : closest,
                );
        }

        return corners
            .map((corner) =>
                scaleDiamondRadiiToCorner(
                    farthestSideRadiusX,
                    farthestSideRadiusY,
                    corner.dx,
                    corner.dy,
                ),
            )
            .reduce((farthest, current) =>
                current.x * current.y > farthest.x * farthest.y
                    ? current
                    : farthest,
            );
    }

    private _resolve(value: GradientLengthPercentage, size: number): number {
        if (value.kind === "percent") {
            return (value.value / 100) * size;
        }

        if (value.unit === "px") {
            return value.value;
        }

        throw new Error(
            `Unsupported diamond-gradient length unit for Canvas transformer: ${value.unit}`,
        );
    }
}
