import {
    interpolate,
    formatRgb,
    fixupHueShorter,
    fixupHueLonger,
    fixupHueIncreasing,
    fixupHueDecreasing,
    converter,
} from "culori";
import type { GradientInterpolation, GradientStop, LinearGradient } from "../../../gradients";
import type { GradientColorSpace, GradientHueInterpolation } from "../../../gradients/helpers";
import { expandRepeatingStops } from "./expand-repeating-stops";

type CuloriInterpolationMode =
    | "rgb"
    | "oklab"
    | "lch"
    | "oklch"
    | "hsl"
    | "hwb"
    | "lab"
    | "rec2020"
    | "a98"
    | "p3"
    | "prophoto"
    | "xyz65";


function getHueFixup(hue?: GradientHueInterpolation) {
    switch (hue) {
        case "longer":
            return fixupHueLonger;
        case "increasing":
            return fixupHueIncreasing;
        case "decreasing":
            return fixupHueDecreasing;
        default:
            return fixupHueShorter;
    }
}

function colorSpaceToCuloriMode(
    colorSpace: GradientColorSpace,
): CuloriInterpolationMode {
    switch (colorSpace) {
        case "a98-rgb":
            return "a98";
        case "display-p3":
            return "p3";
        case "prophoto-rgb":
            return "prophoto";
        case "xyz":
            return "xyz65";
        case "srgb":
        case "srgb-linear":
            // Culori may not accept CSS name "srgb-linear" as mode for interpolate.
            // Better use fallback to `rgb`, or check available mode.
            return "rgb";
        default:
            return colorSpace;
    }
}


function createCuloriInterpolationOverrides(
    interpolation: GradientInterpolation,
) {
    if (interpolation.hue === undefined) {
        return undefined;
    }

    return {
        h: {
            fixup: getHueFixup(interpolation.hue),
        },
    };
}
function getColorStopsWithPositions(stops: GradientStop[]): GradientStop[] {
    const colorStops = stops.filter(
        (stop) => stop.type === "color-stop",
    );

    if (colorStops.length === 0) {
        return [];
    }

    if (colorStops.length === 1) {
        return [
            {
                ...colorStops[0],
                position: colorStops[0].position ?? 0,
            },
        ];
    }

    return colorStops.map((stop, index) => {
        if (stop.position != null) {
            return stop;
        }

        if (index === 0) {
            return {
                ...stop,
                position: 0,
            };
        }

        if (index === colorStops.length - 1) {
            return {
                ...stop,
                position: 1,
            };
        }

        return {
            ...stop,
            position: index / (colorStops.length - 1),
        };
    });
}

function formatColorForCanvas(input: unknown): string {
    const color = toRgb(input as any);
    if (!color) {
        throw new Error("Failed to convert interpolated color to rgb.");
    }
    return formatRgb(color)!;
}



const DEFAULT_SAMPLE_COUNT = 64;
const toRgb = converter("rgb");


export function resolveRenderableLinearGradientStops(
    gradient: LinearGradient,
    sampleCount: number = DEFAULT_SAMPLE_COUNT,
): GradientStop[] {
    const colorStops = getColorStopsWithPositions(gradient.stops);
    const interpolation = gradient.config.interpolation;

    if (colorStops.length < 2) {
        return colorStops;
    }

    if (interpolation === undefined) {
        return gradient.isRepeating
            ? expandRepeatingStops(colorStops)
            : colorStops;
    }

    const sampledStops: GradientStop[] = [];

    const mode = colorSpaceToCuloriMode(interpolation.colorSpace);
    const overrides = createCuloriInterpolationOverrides(interpolation);

    for (let index = 0; index < colorStops.length - 1; index += 1) {
        const current = colorStops[index];
        const next = colorStops[index + 1];

        const startPosition = current.position;
        const endPosition = next.position;

        const colorInterpolator = interpolate(
            [current.value, next.value],
            mode as any,
            overrides as any,
        );

        for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex += 1) {
            if (index > 0 && sampleIndex === 0) {
                continue;
            }

            const localT = sampleIndex / sampleCount;

            const position =
                startPosition + (endPosition - startPosition) * localT;

            const color = colorInterpolator(localT);

            sampledStops.push({
                type: "color-stop",
                value: formatColorForCanvas(color),
                position,
            });
        }
    }

    return gradient.isRepeating
        ? expandRepeatingStops(sampledStops)
        : sampledStops;
}