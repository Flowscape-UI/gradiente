import type {
    GradientInterpolation,
    GradientStop,
    GradientWithStopsJSONExtra,
    IGradientWithStops,
} from "../../../kind/base";
import {
    clamp01 as clamp01Value,
    formatNumber,
    getRenderableColorStops,
    mixRgbaByteColor,
    parseColorToRgbaByte,
    type GradientRenderableColorStop,
    type RgbaByteColor,
    resolveRenderableGradientStops,
} from "../helpers";

export { clamp01 } from "../helpers";
export { encodeSvgDataUrl } from "../helpers";

export const SVG_GRADIENT_SAMPLE_COUNT = 128;
export const SVG_RASTER_SAMPLE_SIZE = 96;

export type SvgRgbaColor = RgbaByteColor;

export function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function toPercent(value: number): string {
    return `${Number((value * 100).toFixed(3))}%`;
}

export function formatPoint(value: number): string {
    return `${formatNumber(value)}%`;
}

export function normalizeSvgStops(
    stops: GradientStop[],
): GradientRenderableColorStop[] {
    return getRenderableColorStops(stops);
}

export function parseSvgColor(input: string): SvgRgbaColor {
    return parseColorToRgbaByte(input);
}

export function formatSvgColor(color: SvgRgbaColor): string {
    if (color.a >= 255) {
        return `rgb(${color.r} ${color.g} ${color.b})`;
    }

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${Number((color.a / 255).toFixed(4))})`;
}

export function mixSvgColor(
    from: SvgRgbaColor,
    to: SvgRgbaColor,
    t: number,
): SvgRgbaColor {
    return mixRgbaByteColor(from, to, t);
}

export function sampleSvgStops(
    stops: GradientStop[],
    position: number,
): SvgRgbaColor {
    const colorStops = normalizeSvgStops(stops);

    if (colorStops.length === 0) {
        throw new Error("Cannot sample color from empty gradient stops.");
    }

    if (colorStops.length === 1) {
        return parseSvgColor(colorStops[0].value);
    }

    const first = colorStops[0];
    const extendedStops = [
        ...colorStops,
        {
            ...first,
            position: first.position + 1,
        },
    ];

    let samplePosition = position;

    if (samplePosition < first.position) {
        samplePosition += 1;
    }

    for (let index = 0; index < extendedStops.length - 1; index += 1) {
        const current = extendedStops[index];
        const next = extendedStops[index + 1];

        if (
            samplePosition >= current.position &&
            samplePosition <= next.position
        ) {
            const span = next.position - current.position || 1;
            const localT = (samplePosition - current.position) / span;

            return mixSvgColor(
                parseSvgColor(current.value),
                parseSvgColor(next.value),
                localT,
            );
        }
    }

    return parseSvgColor(colorStops[colorStops.length - 1].value);
}

export function buildSvgStops(
    gradient: IGradientWithStops<
        GradientStop,
        GradientWithStopsJSONExtra & { interpolation: GradientInterpolation }
    >,
): string {
    return normalizeSvgStops(
        resolveRenderableGradientStops(gradient, SVG_GRADIENT_SAMPLE_COUNT),
    )
        .map((stop) =>
            `<stop offset="${toPercent(clamp01Value(stop.position))}" stop-color="${escapeXml(stop.value)}"/>`,
        )
        .join("");
}

export function buildSvgGradientResult(input: {
    id: string;
    type: "linearGradient" | "radialGradient" | "pattern";
    gradient: string;
}) {
    const defs = `<defs>${input.gradient}</defs>`;

    return {
        id: input.id,
        href: `#${input.id}`,
        url: `url(#${input.id})`,
        type: input.type,
        gradient: input.gradient,
        defs,
        svg: `<svg xmlns="http://www.w3.org/2000/svg">${defs}</svg>`,
    };
}
