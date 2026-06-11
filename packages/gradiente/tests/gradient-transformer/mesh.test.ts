import { describe, expect, it } from "vitest";
import { transformTo } from "../../src";

const hueMesh = "mesh-gradient(grid 2 2 method bilinear in hsl longer hue, vertex v00 0% 0% hsl(10, 100%, 50%), vertex v10 100% 0% hsl(350, 100%, 50%), vertex v01 0% 100% hsl(10, 100%, 50%), vertex v11 100% 100% hsl(350, 100%, 50%), patch p00 v00 v10 v11 v01)";

function decodeCssDataUrl(input: string): string {
    const prefix = 'url("data:image/svg+xml,';
    const suffix = '")';

    expect(input.startsWith(prefix)).toBe(true);
    expect(input.endsWith(suffix)).toBe(true);

    return decodeURIComponent(input.slice(prefix.length, -suffix.length));
}

function extractRgbTuples(input: string): Array<[number, number, number]> {
    return Array.from(
        input.matchAll(/rgba\((\d+),(\d+),(\d+),[0-9.]+\)/g),
        (match) => [
            Number(match[1]),
            Number(match[2]),
            Number(match[3]),
        ],
    );
}

describe("mesh gradient transformers", () => {
    it("samples bilinear mesh colors before CSS rasterization", () => {
        const css = transformTo<string>(
            "css",
            hueMesh,
        );
        const svg = decodeCssDataUrl(css);
        const colors = extractRgbTuples(svg);

        expect(colors.some(([r, g, b]) => r < 80 && g > 180 && b > 180))
            .toBe(true);
    });

    it("does not draw visible SVG mesh triangle strokes", () => {
        const result = transformTo<{ gradient: string }>("svg", hueMesh);
        const svg = decodeURIComponent(result.gradient);

        expect(svg).toContain("<polygon");
        expect(svg).not.toContain("stroke=");
        expect(svg).not.toContain("stroke-width");
    });
});
