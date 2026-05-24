import { describe, expect, it } from "vitest";
import {
    GradientTransformer,
    ISvgGradientResult,
    transformTo
} from "../../src";

describe("SVG gradient transformers", () => {
    it("transforms linear gradients to SVG defs", () => {
        const result: any = transformTo(
            "svg",
            "linear-gradient(90deg, red 0%, blue 100%)",
        );

        expect(result.type).toBe("linearGradient");
        expect(result.id).toBe("gradiente-linear-gradient");
        expect(result.url).toBe("url(#gradiente-linear-gradient)");
        expect(result.defs).toContain("<defs>");
        expect(result.gradient).toContain("<linearGradient");
        // expect(result.gradient).toContain('<stop offset="0%" stop-color="red"/>');
        // expect(result.gradient).toContain('<stop offset="100%" stop-color="blue"/>');
        expect(result.svg).toContain("http://www.w3.org/2000/svg");
        expect(GradientTransformer.get("svg", "linear-gradient")).not.toBeNull();
    });

    it("samples interpolated linear gradients for SVG output", () => {
        const result: any = transformTo(
            "svg",
            "linear-gradient(90deg in oklab, red 0%, blue 100%)",
        );

        expect(result.gradient.match(/<stop /g)?.length).toBeGreaterThan(2);
    });

    it("expands repeating linear gradients for SVG output", () => {
        const result: any = transformTo(
            "svg",
            "repeating-linear-gradient(90deg, red 0%, blue 20%)",
        );

        expect(result.gradient.match(/<stop /g)?.length).toBeGreaterThan(2);
        expect(result.gradient).toContain('offset="100%"');
    });

    it("transforms radial gradients to SVG defs", () => {
        const result: any = transformTo(
            "svg",
            "radial-gradient(circle at 25% 75% in oklab, red 0%, blue 100%)",
        );

        expect(result.type).toBe("radialGradient");
        expect(result.id).toBe("gradiente-radial-gradient");
        expect(result.url).toBe("url(#gradiente-radial-gradient)");
        expect(result.gradient).toContain("<radialGradient");
        expect(result.gradient).toContain('cx="25%"');
        expect(result.gradient).toContain('cy="75%"');
        expect(result.gradient.match(/<stop /g)?.length).toBeGreaterThan(2);
        expect(GradientTransformer.get("svg", "radial-gradient")).not.toBeNull();
    });

    it("expands repeating radial gradients for SVG output", () => {
        const result: any = transformTo(
            "svg",
            "repeating-radial-gradient(circle at center, red 0%, blue 20%)",
        );

        expect(result.gradient.match(/<stop /g)?.length).toBeGreaterThan(2);
        expect(result.gradient).toContain('offset="100%"');
    });

    it("transforms conic gradients to SVG pattern defs", () => {
        const result: any = transformTo(
            "svg",
            "conic-gradient(from 45deg at 25% 75% in oklab, red 0%, blue 100%)",
        );

        expect(result.type).toBe("pattern");
        expect(result.id).toBe("gradiente-conic-gradient");
        expect(result.url).toBe("url(#gradiente-conic-gradient)");
        expect(result.gradient).toContain("<pattern");
        expect(result.gradient).toContain("<image");
        expect(result.gradient).toContain("data:image/svg+xml");
        expect(GradientTransformer.get("svg", "conic-gradient")).not.toBeNull();
    });

    it("samples repeating conic gradients for SVG output", () => {
        const result: any = transformTo(
            "svg",
            "repeating-conic-gradient(red 0%, blue 20%)",
        );

        expect(result.type).toBe("pattern");
        expect(result.gradient).toContain("data:image/svg+xml");
    });

    it("transforms diamond gradients to SVG pattern defs", () => {
        const result: any = transformTo(
            "svg",
            "diamond-gradient(40% 80% at 35% 65% in oklab, red 0%, yellow 50%, blue 100%)",
        );

        expect(result.type).toBe("pattern");
        expect(result.id).toBe("gradiente-diamond-gradient");
        expect(result.url).toBe("url(#gradiente-diamond-gradient)");
        expect(result.gradient).toContain("<pattern");
        expect(result.gradient).toContain("<image");
        expect(result.gradient).toContain("data:image/svg+xml");
        expect(result.gradient).toContain("%3Cpolygon");
        expect(GradientTransformer.get("svg", "diamond-gradient")).not.toBeNull();
    });

    it("samples repeating diamond gradients for SVG output", () => {
        const result: any = transformTo(
            "svg",
            "repeating-diamond-gradient(40% 80% at 35% 65% in hsl longer hue, red 0%, yellow 10%, cyan 20%, blue 30%)",
        );

        expect(result.type).toBe("pattern");
        expect(result.gradient).toContain("data:image/svg+xml");
        expect(result.gradient).toContain("%3Cpolygon");
    });

    it("transforms mesh gradients to SVG pattern defs", () => {
        const result: any = transformTo(
            "svg",
            "mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)",
        );

        expect(result.type).toBe("pattern");
        expect(result.id).toBe("gradiente-mesh-gradient");
        expect(result.url).toBe("url(#gradiente-mesh-gradient)");
        expect(result.gradient).toContain("<pattern");
        expect(result.gradient).toContain("<image");
        expect(result.gradient).toContain("data:image/svg+xml");
        expect(result.gradient).toContain("%3Cpolygon");
        expect(GradientTransformer.get("svg", "mesh-gradient")).not.toBeNull();
    });
});
