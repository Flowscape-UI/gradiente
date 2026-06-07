import {
    interpolate,
    formatRgb,
    fixupHueShorter,
    fixupHueLonger,
    fixupHueIncreasing,
    fixupHueDecreasing,
    converter,
} from "culori";
import type {
    GradientInterpolation,
    GradientStop,
    GradientWithStopsJSONExtra,
    IGradientWithStops,
} from "../../../kind/base";
import type {
    GradientColorSpace,
    GradientHueInterpolation,
} from "../../../kind/hue";
import {
    isRenderableColorStop,
    type GradientRenderableColorStop,
} from "./color-stops";
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

type GradientRenderableColorHint = Extract<
    GradientStop,
    { type: "color-hint" }
>;

type GradientColorSegment = {
    from: GradientRenderableColorStop;
    to: GradientRenderableColorStop;
    hint?: GradientRenderableColorHint;
};

const DEFAULT_INTERPOLATION: GradientInterpolation = {
    colorSpace: "srgb",
};

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

function isColorHint(stop: GradientStop): stop is GradientRenderableColorHint {
    return stop.type === "color-hint";
}

function getColorStopsWithPositions(
    stops: GradientStop[],
): GradientRenderableColorStop[] {
    const colorStops = stops.filter(
        isRenderableColorStop,
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

function getColorSegments(stops: GradientStop[]): GradientColorSegment[] {
    const segments: GradientColorSegment[] = [];
    let from: GradientRenderableColorStop | undefined;
    let hint: GradientRenderableColorHint | undefined;

    for (const stop of stops) {
        if (isRenderableColorStop(stop)) {
            if (from !== undefined) {
                segments.push({
                    from,
                    to: stop,
                    hint,
                });
            }

            from = stop;
            hint = undefined;
            continue;
        }

        if (isColorHint(stop) && from !== undefined) {
            hint = stop;
        }
    }

    return segments;
}

function hasColorHints(stops: GradientStop[]): boolean {
    return stops.some(isColorHint);
}

function getHintedColorProgress(
    positionProgress: number,
    hint?: GradientRenderableColorHint,
    startPosition: number = 0,
    endPosition: number = 1,
): number {
    if (hint === undefined) {
        return positionProgress;
    }

    const range = endPosition - startPosition;

    if (range === 0) {
        return positionProgress;
    }

    const hintProgress = (hint.position - startPosition) / range;

    if (hintProgress <= 0) {
        return positionProgress <= 0 ? 0 : 1;
    }

    if (hintProgress >= 1) {
        return positionProgress >= 1 ? 1 : 0;
    }

    if (Math.abs(hintProgress - 0.5) < 1e-6) {
        return positionProgress;
    }

    return Math.pow(
        positionProgress,
        Math.log(0.5) / Math.log(hintProgress),
    );
}

function getSegmentSamplePositions(
    sampleCount: number,
    segment: GradientColorSegment,
): number[] {
    const samples = Array.from(
        { length: sampleCount + 1 },
        (_, index) => index / sampleCount,
    );

    if (segment.hint === undefined) {
        return samples;
    }

    const range = segment.to.position - segment.from.position;

    if (range === 0) {
        return samples;
    }

    const hintProgress =
        (segment.hint.position - segment.from.position) / range;

    if (hintProgress <= 0 || hintProgress >= 1) {
        return samples;
    }

    const nearestIndex = Math.round(hintProgress * sampleCount);

    samples[nearestIndex] = hintProgress;

    return samples;
}

function formatColorForCanvas(input: unknown): string {
    const color = toRgb(input as never);

    if (!color) {
        throw new Error("Failed to convert interpolated color to rgb.");
    }

    const formatted = formatRgb(color);

    if (formatted === undefined) {
        throw new Error("Failed to format interpolated color to rgb.");
    }

    return formatted;
}



const DEFAULT_SAMPLE_COUNT = 64;
const toRgb = converter("rgb");


export function resolveRenderableGradientStops(
    gradient: IGradientWithStops<
        GradientStop,
        GradientWithStopsJSONExtra & { interpolation: GradientInterpolation }
    >,
    sampleCount: number = DEFAULT_SAMPLE_COUNT,
): GradientStop[] {
    const sourceStops = gradient.getStops();
    const colorStops = getColorStopsWithPositions(sourceStops);
    const interpolation = gradient.getConfig().interpolation;
    const shouldSample = interpolation !== undefined || hasColorHints(sourceStops);

    if (colorStops.length < 2) {
        return colorStops;
    }

    if (!shouldSample) {
        return gradient.isRepeating()
            ? expandRepeatingStops(colorStops)
            : colorStops;
    }

    const sampledStops: GradientStop[] = [];

    const resolvedInterpolation = interpolation ?? DEFAULT_INTERPOLATION;
    const mode = colorSpaceToCuloriMode(resolvedInterpolation.colorSpace);
    const overrides = createCuloriInterpolationOverrides(resolvedInterpolation);
    const segments = getColorSegments(sourceStops);

    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const current = segment.from;
        const next = segment.to;

        const startPosition = current.position;
        const endPosition = next.position;

        if (startPosition === endPosition) {
            if (index === 0) {
                sampledStops.push(current);
            }

            sampledStops.push(next);
            continue;
        }

        const colorInterpolator = interpolate(
            [current.value, next.value],
            mode as any,
            overrides as any,
        );

        const samplePositions = getSegmentSamplePositions(sampleCount, segment);

        for (
            let sampleIndex = 0;
            sampleIndex < samplePositions.length;
            sampleIndex += 1
        ) {
            if (index > 0 && sampleIndex === 0) {
                continue;
            }

            const localT = samplePositions[sampleIndex];
            const colorT = getHintedColorProgress(
                localT,
                segment.hint,
                startPosition,
                endPosition,
            );

            const position =
                startPosition + (endPosition - startPosition) * localT;

            const color = colorInterpolator(colorT);

            sampledStops.push({
                type: "color-stop",
                value: formatColorForCanvas(color),
                position,
            });
        }
    }

    return gradient.isRepeating()
        ? expandRepeatingStops(sampledStops)
        : sampledStops;
}
