import { describe, expect, it } from "vitest";
import {
    DiamondGradient,
    GradientFactory,
    GradientTransformer,
    parse,
    transformTo,
    type GradientData,
    type DiamondGradientConfig,
} from "../../src";

describe("DiamondGradient", () => {
    const gradientConfig: GradientData<DiamondGradientConfig> = {
        isRepeating: false,
        config: {
            shape: "ellipse",
            size: { kind: "extent", value: "farthest-corner" },
            position: {
                kind: "keywords",
                x: "center",
                y: "center",
            },
        },
        stops: [
            { type: "color-stop", value: "red", position: 0 },
            { type: "color-hint", value: "50%", position: 0.5 },
            { type: "color-stop", value: "blue", position: 1 },
        ],
    };

    it("extends radial gradient behavior with a diamond-gradient type", () => {
        const gradient = new DiamondGradient(gradientConfig);

        expect(gradient).toBeInstanceOf(DiamondGradient);
        expect(gradient.type).toBe("diamond-gradient");
        expect(gradient.config).toEqual(gradientConfig.config);
        expect(gradient.stops).toEqual(gradientConfig.stops);
    });

    it("parses diamond-gradient strings with radial config semantics", () => {
        const gradient = DiamondGradient.fromString(
            "diamond-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)",
        );

        expect(gradient.type).toBe("diamond-gradient");
        expect(gradient.config).toEqual({
            shape: "circle",
            size: { kind: "extent", value: "closest-side" },
            position: {
                kind: "keywords",
                x: "left",
                y: "center",
            },
            interpolation: undefined,
        });
        expect(gradient.toString()).toBe(
            "diamond-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)",
        );
    });

    it("parses repeating diamond gradients", () => {
        const gradient = DiamondGradient.fromString(
            "repeating-diamond-gradient(red, blue)",
        );

        expect(gradient.type).toBe("diamond-gradient");
        expect(gradient.isRepeating).toBe(true);
        expect(gradient.toString()).toBe("repeating-diamond-gradient(red, blue)");
    });

    it("is registered in the factory helpers", () => {
        const gradient = parse("diamond-gradient(red, blue)");

        expect(gradient).toBeInstanceOf(DiamondGradient);
        expect(GradientFactory.get("diamond-gradient")).toBe(DiamondGradient);
    });

    it("is registered for the same transformer targets as radial gradients", () => {
        const gradient = new DiamondGradient(gradientConfig);
        const css = transformTo<string>("css", gradient);

        expect(css).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(decodeURIComponent(css)).toContain("<polygon");
        expect(css).not.toContain("diamond-gradient(");
        expect(GradientTransformer.get("canvas-2d", "diamond-gradient")).not.toBeNull();
        expect(GradientTransformer.get("canvas-webgl", "diamond-gradient")).not.toBeNull();
    });

    it("expands repeating diamond gradients across the visible CSS area", () => {
        const gradient = DiamondGradient.fromString(
            "repeating-diamond-gradient(40% 80% at 35% 65% in hsl longer hue, red 0%, yellow 10%, cyan 20%, blue 30%)",
        );
        const css = transformTo<string>("css", gradient);
        const decoded = decodeURIComponent(css);

        expect(css).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(decoded).toContain("<polygon");
        expect(decoded).toContain("132.5");
        expect(css).not.toContain("diamond-gradient(");
    });
});
