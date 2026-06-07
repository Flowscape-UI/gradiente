import type { GradientStop } from "../../../kind/base";
import { formatRgb, interpolate } from "culori";

export type GradientRenderableColorStop = Extract<
    GradientStop,
    { type: "color-stop" }
>;

export function isRenderableColorStop(
    stop: GradientStop,
): stop is GradientRenderableColorStop {
    return stop.type === "color-stop" && stop.position != null;
}

export function getRenderableColorStops(
    stops: GradientStop[],
): GradientRenderableColorStop[] {
    return stops
        .filter(isRenderableColorStop)
        .sort((a, b) => a.position - b.position);
}

export function getRenderableColorStopCount(stops: GradientStop[]): number {
    return getRenderableColorStops(stops).length;
}

export function normalizeRenderableStops(
    stops: GradientStop[],
    min: number,
    max: number,
): GradientRenderableColorStop[] {
    const range = max - min || 1;

    return getRenderableColorStops(stops).map((stop) => ({
        ...stop,
        position: (stop.position - min) / range,
    }));
}

export function sampleColorStopAtPosition(
    stops: GradientStop[],
    position: number,
): string {
    const colorStops = getRenderableColorStops(stops);

    if (colorStops.length === 0) {
        throw new Error("Cannot sample color from empty gradient stops.");
    }

    if (position <= colorStops[0].position) {
        return colorStops[0].value;
    }

    const lastStop = colorStops[colorStops.length - 1];

    if (position >= lastStop.position) {
        return lastStop.value;
    }

    for (let index = 0; index < colorStops.length - 1; index += 1) {
        const current = colorStops[index];
        const next = colorStops[index + 1];

        if (position >= current.position && position <= next.position) {
            const range = next.position - current.position || 1;
            const localT = (position - current.position) / range;
            const colorInterpolator = interpolate(
                [current.value, next.value],
                "rgb",
            );
            const formatted = formatRgb(colorInterpolator(localT));

            if (formatted === undefined) {
                throw new Error("Failed to format sampled gradient color.");
            }

            return formatted;
        }
    }

    return lastStop.value;
}

export function fitRenderableStopsToLimit(
    stops: GradientStop[],
    maxStops: number,
): GradientRenderableColorStop[] {
    const colorStops = getRenderableColorStops(stops);

    if (colorStops.length <= maxStops) {
        return colorStops;
    }

    const sampledStops: GradientRenderableColorStop[] = [];

    for (let index = 0; index < maxStops; index += 1) {
        const position = index / (maxStops - 1);

        sampledStops.push({
            type: "color-stop",
            value: sampleColorStopAtPosition(colorStops, position),
            position,
        });
    }

    return sampledStops;
}
