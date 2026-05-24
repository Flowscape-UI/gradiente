import { converter } from "culori";
import type { GradientStop, IGradientBase } from "../../../gradients";
import { resolveRenderableGradientStops } from "../helpers";

export const SVG_GRADIENT_SAMPLE_COUNT = 128;
export const SVG_RASTER_SAMPLE_SIZE = 96;

const toRgb = converter("rgb");

export type SvgRgbaColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
}

export function toPercent(value: number): string {
    return `${Number((value * 100).toFixed(3))}%`;
}

export function formatPoint(value: number): string {
    return `${Number(value.toFixed(3))}%`;
}

export function normalizeSvgStops(stops: GradientStop[]): GradientStop[] {
    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);
}

export function parseSvgColor(input: string): SvgRgbaColor {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    return {
        r: Math.round((color.r ?? 0) * 255),
        g: Math.round((color.g ?? 0) * 255),
        b: Math.round((color.b ?? 0) * 255),
        a: Math.round((color.alpha ?? 1) * 255),
    };
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
    return {
        r: Math.round(from.r + (to.r - from.r) * t),
        g: Math.round(from.g + (to.g - from.g) * t),
        b: Math.round(from.b + (to.b - from.b) * t),
        a: Math.round(from.a + (to.a - from.a) * t),
    };
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

export function encodeSvgDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildSvgStops(gradient: IGradientBase<any>): string {
    return normalizeSvgStops(
        resolveRenderableGradientStops(gradient, SVG_GRADIENT_SAMPLE_COUNT),
    )
        .map((stop) =>
            `<stop offset="${toPercent(clamp01(stop.position))}" stop-color="${escapeXml(stop.value)}"/>`,
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
