import type { GradientStop } from "../../../kind/base";
import {
    getRenderableColorStops,
    sampleColorStopAtPosition,
} from "./color-stops";

function positiveModulo(value: number, modulo: number): number {
    return ((value % modulo) + modulo) % modulo;
}

function sampleRepeatingColorAtPosition(
    stops: GradientStop[],
    position: number,
    firstPosition: number,
    period: number,
): string {
    const localPosition =
        firstPosition + positiveModulo(position - firstPosition, period);

    return sampleColorStopAtPosition(stops, localPosition);
}

/**
 * RU: Раскрывает repeating stops в заданный видимый диапазон.
 * EN: Expands repeating stops into a requested visible range.
 */
export function expandRepeatingStopsTo(
    stops: GradientStop[],
    from: number,
    to: number,
): GradientStop[] {
    const colorStops = getRenderableColorStops(stops);

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
            from,
            firstPosition,
            period,
        ),
        position: from,
        _order: order,
    });

    order += 1;

    const startRepeat = Math.floor((from - firstPosition) / period) - 1;
    const endRepeat = Math.ceil((to - firstPosition) / period) + 1;

    for (
        let repeatIndex = startRepeat;
        repeatIndex <= endRepeat;
        repeatIndex += 1
    ) {
        const offset = repeatIndex * period;

        for (const stop of colorStops) {
            const position = stop.position + offset;

            if (position <= from || position >= to) {
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
            to,
            firstPosition,
            period,
        ),
        position: to,
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

/**
 * RU: Раскрывает repeating stops в стандартный диапазон 0..1.
 * EN: Expands repeating stops into the default 0..1 range.
 */
export function expandRepeatingStops(stops: GradientStop[]): GradientStop[] {
    return expandRepeatingStopsTo(stops, 0, 1);
}

/**
 * RU: Считает максимальный видимый параметр t для radial-gradient.
 * EN: Computes the maximum visible t value for a radial-gradient.
 */
export function getMaxVisibleRadialT(
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
        ...corners.map((corner) => {
            const dx = (corner.x - center.x) / Math.max(radii.x, 0.0001);
            const dy = (corner.y - center.y) / Math.max(radii.y, 0.0001);

            return Math.sqrt(dx * dx + dy * dy);
        }),
    );
}
