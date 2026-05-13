import { formatRgb, interpolate } from "culori";
import type { GradientStop } from "../../../gradients";

function positiveModulo(value: number, modulo: number): number {
    return ((value % modulo) + modulo) % modulo;
}

function sampleColorAtPosition(
    stops: GradientStop[],
    position: number,
): string {
    const colorStops = stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);

    if (colorStops.length === 0) {
        throw new Error("Cannot sample color from empty stops.");
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

            return formatRgb(colorInterpolator(localT));
        }
    }

    return lastStop.value;
}

function sampleRepeatingColorAtPosition(
    stops: GradientStop[],
    position: number,
    firstPosition: number,
    period: number,
): string {
    const localPosition =
        firstPosition + positiveModulo(position - firstPosition, period);

    return sampleColorAtPosition(stops, localPosition);
}

export function expandRepeatingStops(stops: GradientStop[]): GradientStop[] {
    const colorStops = stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);

    if (colorStops.length < 2) {
        return colorStops;
    }

    const firstPosition = colorStops[0].position;
    const lastPosition = colorStops[colorStops.length - 1].position;
    const period = lastPosition - firstPosition;

    if (period <= 0) {
        return colorStops;
    }

    const result: Array<GradientStop & { _order: number }> = [];

    let order = 0;

    result.push({
        type: "color-stop",
        value: sampleRepeatingColorAtPosition(
            colorStops,
            0,
            firstPosition,
            period,
        ),
        position: 0,
        _order: order,
    });

    order += 1;

    const startRepeat = Math.floor((0 - firstPosition) / period) - 1;
    const endRepeat = Math.ceil((1 - firstPosition) / period) + 1;

    for (
        let repeatIndex = startRepeat;
        repeatIndex <= endRepeat;
        repeatIndex += 1
    ) {
        const offset = repeatIndex * period;

        for (const stop of colorStops) {
            const position = stop.position + offset;
            if (position <= 0 || position >= 1) {
                continue;
            }
            result.push({
                ...stop,
                position,
                _order: order,
            });
            order += 1;
        }
    }

    result.push({
        type: "color-stop",
        value: sampleRepeatingColorAtPosition(
            colorStops,
            1,
            firstPosition,
            period,
        ),
        position: 1,
        _order: order,
    });

    return result
        .sort((a, b) => {
            if (a.position === b.position) {
                return a._order - b._order;
            }
            return a.position - b.position;
        })
        .map(({ _order, ...stop }) => stop);
}