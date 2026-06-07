import { describe, expect, it } from "vitest";
import {
    GradientDiamond,
    GradientRadial,
    type GradientDiamondStop,
} from "../../src/gradient";

const defaultStops: GradientDiamondStop[] = [
    { type: "color-stop", value: "red", position: 0 },
    { type: "color-stop", value: "blue", position: 1 },
];

describe("GradientDiamond", () => {
    it("extends radial gradient behavior with a diamond-gradient type", () => {
        const gradient = new GradientDiamond(defaultStops);

        expect(gradient).toBeInstanceOf(GradientDiamond);
        expect(gradient).toBeInstanceOf(GradientRadial);
        expect(gradient.type).toBe("diamond-gradient");
        expect(gradient.getConfig()).toEqual({
            shape: "ellipse",
            size: {
                kind: "extent",
                value: "farthest-corner",
            },
            position: {
                kind: "keywords",
                x: "center",
                y: "center",
            },
            interpolation: {
                colorSpace: "srgb",
            },
            isRepeating: false,
        });
        expect(gradient.toString()).toBe("diamond-gradient(red, blue)");
    });

    it("uses radial config parsing and serialization semantics", () => {
        const gradient = GradientDiamond.fromString(
            "diamond-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)",
        );

        expect(gradient).toBeInstanceOf(GradientDiamond);
        expect(gradient.getConfig()).toEqual({
            shape: "circle",
            size: {
                kind: "extent",
                value: "closest-side",
            },
            position: {
                kind: "keywords",
                x: "left",
                y: "center",
            },
            interpolation: {
                colorSpace: "srgb",
            },
            isRepeating: false,
        });
        expect(gradient.toString()).toBe(
            "diamond-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)",
        );
    });

    it("parses repeating diamond gradients", () => {
        const gradient = GradientDiamond.fromString(
            "repeating-diamond-gradient(red, blue)",
        );

        expect(gradient.type).toBe("diamond-gradient");
        expect(gradient.isRepeating()).toBe(true);
        expect(gradient.toString()).toBe(
            "repeating-diamond-gradient(red, blue)",
        );
    });

    it("normalizes radial positions through the inherited parser", () => {
        const gradient = GradientDiamond.fromString(
            "diamond-gradient(at top left, red, blue)",
        );

        expect(gradient.getConfig().position).toEqual({
            kind: "keywords",
            x: "left",
            y: "top",
        });
        expect(gradient.toString()).toBe(
            "diamond-gradient(at left top, red, blue)",
        );
    });

    it("clone preserves diamond type and does not share mutable state", () => {
        const gradient = GradientDiamond.fromString(
            "diamond-gradient(circle at right bottom, red 0%, blue 100%)",
        );
        const cloned = gradient.clone();

        cloned.addStop({
            type: "color-stop",
            value: "green",
            position: 0.5,
        });

        expect(cloned).toBeInstanceOf(GradientDiamond);
        expect(cloned.type).toBe("diamond-gradient");
        expect(gradient.equals(cloned)).toBe(false);
        expect(gradient.getStops()).toHaveLength(2);
        expect(cloned.getStops()).toHaveLength(3);
    });

    it("throws when ABI function name is not diamond-gradient", () => {
        expect(() =>
            GradientDiamond.fromAbi({
                functionName: "radial-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            }),
        ).toThrow("Invalid function name for GradientDiamond");
    });
});
