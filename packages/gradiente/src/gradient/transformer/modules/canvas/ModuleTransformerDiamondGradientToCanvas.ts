import { GradientDiamond } from "../../../kind/diamond";
import {
    getRenderableColorStops,
    type GradientRenderableColorStop,
    expandRepeatingStopsTo,
    getMaxVisibleDiamondT,
    parseColorToRgbaTuple,
    resolveDiamondRadii,
    resolveGradientPosition,
    resolveRenderableGradientStops,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ICanvasPaintResult } from "../types";

const DIAMOND_GRADIENT_SAMPLE_COUNT = 128;
const DIAMOND_COLOR_LOOKUP_SIZE = 1024;

function sampleColorAtPosition(
    stops: GradientRenderableColorStop[],
    position: number,
): [number, number, number, number] {
    if (stops.length === 0) {
        throw new Error("Cannot sample color from empty diamond gradient stops.");
    }

    if (stops.length === 1 || position <= stops[0].position) {
        return parseColorToRgbaTuple(stops[0].value);
    }

    const lastStop = stops[stops.length - 1];

    if (position >= lastStop.position) {
        return parseColorToRgbaTuple(lastStop.value);
    }

    for (let index = 0; index < stops.length - 1; index += 1) {
        const current = stops[index];
        const next = stops[index + 1];

        if (position >= current.position && position <= next.position) {
            const range = next.position - current.position || 1;
            const localT = (position - current.position) / range;
            const currentColor = parseColorToRgbaTuple(current.value);
            const nextColor = parseColorToRgbaTuple(next.value);

            return [
                Math.round(currentColor[0] + (nextColor[0] - currentColor[0]) * localT),
                Math.round(currentColor[1] + (nextColor[1] - currentColor[1]) * localT),
                Math.round(currentColor[2] + (nextColor[2] - currentColor[2]) * localT),
                Math.round(currentColor[3] + (nextColor[3] - currentColor[3]) * localT),
            ];
        }
    }

    return parseColorToRgbaTuple(lastStop.value);
}

function buildColorLookup(
    stops: GradientRenderableColorStop[],
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

export class ModuleTransformerDiamondGradientToCanvas
extends GradientTransformerModule<GradientDiamond, ICanvasPaintResult> {
    constructor() {
        super({
            target: "canvas-2d",
            gradientType: "diamond-gradient",
            gradientClass: GradientDiamond,
            expectedName: "GradientDiamond",
        });
    }

    protected transform(gradient: GradientDiamond): ICanvasPaintResult {
        return {
            draw: (ctx, width, height) => {
                const config = gradient.getConfig();
                const isRepeating = gradient.isRepeating();
                const center = resolveGradientPosition(
                    config.position,
                    width,
                    height,
                    {
                        context: "Canvas diamond gradient",
                    },
                );
                const radii = resolveDiamondRadii(
                    config.size,
                    config.shape,
                    center,
                    width,
                    height,
                    {
                        context: "Canvas diamond gradient",
                    },
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
                const renderStops = getRenderableColorStops(
                    isRepeating
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
}
