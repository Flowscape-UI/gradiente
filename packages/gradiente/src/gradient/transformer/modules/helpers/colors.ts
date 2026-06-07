import { converter, formatRgb } from "culori";

const toRgb = converter("rgb");

export type RgbaByteColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type RgbaTuple = [number, number, number, number];

/**
 * RU: Преобразует CSS-цвет в RGBA с каналами 0..255.
 * EN: Converts a CSS color to RGBA channels in the 0..255 range.
 */
export function parseColorToRgbaByte(input: string): RgbaByteColor {
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

/**
 * RU: Преобразует CSS-цвет в RGBA tuple с каналами 0..255.
 * EN: Converts a CSS color to an RGBA tuple in the 0..255 range.
 */
export function parseColorToRgbaTuple(input: string): RgbaTuple {
    const color = parseColorToRgbaByte(input);

    return [
        color.r,
        color.g,
        color.b,
        color.a,
    ];
}

/**
 * RU: Приводит CSS-цвет к RGB/RGBA строке, пригодной для Canvas color stops.
 * EN: Normalizes a CSS color into an RGB/RGBA string suitable for Canvas stops.
 */
export function formatColorForCanvas(input: string): string {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    const formatted = formatRgb(color);

    if (formatted === undefined) {
        throw new Error(`Failed to format color: ${input}`);
    }

    return formatted;
}

/**
 * RU: Линейно смешивает два RGBA-цвета с каналами 0..255.
 * EN: Linearly mixes two RGBA colors whose channels are in the 0..255 range.
 */
export function mixRgbaByteColor(
    from: RgbaByteColor,
    to: RgbaByteColor,
    t: number,
): RgbaByteColor {
    return {
        r: Math.round(from.r + (to.r - from.r) * t),
        g: Math.round(from.g + (to.g - from.g) * t),
        b: Math.round(from.b + (to.b - from.b) * t),
        a: Math.round(from.a + (to.a - from.a) * t),
    };
}

/**
 * RU: Форматирует RGBA tuple в CSS rgba(...), ожидая RGB 0..255 и alpha 0..1.
 * EN: Formats an RGBA tuple as CSS rgba(...), expecting RGB 0..255 and alpha 0..1.
 */
export function formatRgbaTupleAsCss(
    color: RgbaTuple,
    alphaPrecision: number = 4,
    separator: string = ", ",
): string {
    return `rgba(${[
        color[0],
        color[1],
        color[2],
        Number(color[3].toFixed(alphaPrecision)),
    ].join(separator)})`;
}
