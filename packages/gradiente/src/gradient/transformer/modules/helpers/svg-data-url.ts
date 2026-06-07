/**
 * RU: Кодирует SVG-строку в data URL без CSS-обертки.
 * EN: Encodes an SVG string into a data URL without a CSS wrapper.
 */
export function encodeSvgDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * RU: Кодирует SVG-строку в CSS url("data:image/svg+xml,...").
 * EN: Encodes an SVG string into CSS url("data:image/svg+xml,...").
 */
export function encodeSvgDataUrlCss(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
