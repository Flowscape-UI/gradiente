import { describe, expect, it } from "vitest";
import {
    GradientRadial,
    type GradientRadialStop,
} from "../../src/gradient";

const defaultStops: GradientRadialStop[] = [
    { type: "color-stop", value: "red", position: 0 },
    { type: "color-stop", value: "blue", position: 1 },
];

describe("GradientRadial", () => {
    it("creates a radial gradient with default config when config is omitted", () => {
        const gradient = new GradientRadial(defaultStops);

        expect(gradient.type).toBe("radial-gradient");
        expect(gradient.isRepeating()).toBe(false);
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
        expect(gradient.toString()).toBe("radial-gradient(red, blue)");
    });

    it("accepts stops and optional config as separate constructor parameters", () => {
        const stops: GradientRadialStop[] = [
            { type: "color-stop", value: "red", position: 0 },
            { type: "color-hint", position: 0.5 },
            { type: "color-stop", value: "blue", position: 1 },
        ];
        const gradient = new GradientRadial(stops, {
            isRepeating: true,
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
        });

        expect(gradient.toString()).toBe(
            "repeating-radial-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)",
        );
    });

    it("parses a simple string and serializes it compactly", () => {
        const gradient = GradientRadial.fromString("radial-gradient(red, blue)");

        expect(gradient).toBeInstanceOf(GradientRadial);
        expect(gradient.toString()).toBe("radial-gradient(red, blue)");
        expect(gradient.getStops()).toEqual(defaultStops);
    });

    it("parses repeating radial gradients with explicit config and stop positions", () => {
        const gradient = GradientRadial.fromString(
            "repeating-radial-gradient(circle farthest-corner at 49% 45%, red 10%, 50%, blue 80%)",
        );

        expect(gradient.isRepeating()).toBe(true);
        expect(gradient.getConfig()).toEqual({
            shape: "circle",
            size: {
                kind: "extent",
                value: "farthest-corner",
            },
            position: {
                kind: "values",
                x: { kind: "percent", value: 49 },
                y: { kind: "percent", value: 45 },
            },
            interpolation: {
                colorSpace: "srgb",
            },
            isRepeating: true,
        });
        expect(gradient.getStops()).toEqual([
            { type: "color-stop", value: "red", position: 0.1 },
            { type: "color-hint", position: 0.5 },
            { type: "color-stop", value: "blue", position: 0.8 },
        ]);
        expect(gradient.toString()).toBe(
            "repeating-radial-gradient(circle at 49% 45%, red 10%, 50%, blue 80%)",
        );
    });

    it("parses explicit ellipse size and omits default center position", () => {
        const gradient = GradientRadial.fromString(
            "radial-gradient(ellipse 35% 70% at center, cyan, blue 60%, black)",
        );

        expect(gradient.getConfig().size).toEqual({
            kind: "explicit",
            x: { kind: "percent", value: 35 },
            y: { kind: "percent", value: 70 },
        });
        expect(gradient.toString()).toBe(
            "radial-gradient(35% 70%, cyan 0%, blue 60%, black 100%)",
        );
    });

    it("normalizes reversed keyword positions into x/y order", () => {
        const gradient = GradientRadial.fromString(
            "radial-gradient(circle at top left, red, blue)",
        );

        expect(gradient.getConfig().position).toEqual({
            kind: "keywords",
            x: "left",
            y: "top",
        });
        expect(gradient.toString()).toBe(
            "radial-gradient(circle at left top, red, blue)",
        );
    });

    it("serializes polar interpolation with hue and drops hue for non-polar spaces", () => {
        const polar = GradientRadial.fromString(
            "radial-gradient(in oklch longer hue, red, blue)",
        );
        const rectangular = GradientRadial.fromString(
            "radial-gradient(in oklab shorter hue, red, blue)",
        );

        expect(polar.toString()).toBe(
            "radial-gradient(in oklch longer hue, red, blue)",
        );
        expect(rectangular.getConfig().interpolation).toEqual({
            colorSpace: "oklab",
        });
        expect(rectangular.toString()).toBe(
            "radial-gradient(in oklab, red, blue)",
        );
    });

    it("clone preserves data and does not share mutable state", () => {
        const gradient = GradientRadial.fromString(
            "radial-gradient(circle at right bottom, red 0%, blue 100%)",
        );
        const cloned = gradient.clone();

        cloned.addStop({
            type: "color-stop",
            value: "green",
            position: 0.5,
        });

        expect(cloned).toBeInstanceOf(GradientRadial);
        expect(gradient.equals(cloned)).toBe(false);
        expect(gradient.getStops()).toHaveLength(2);
        expect(cloned.getStops()).toHaveLength(3);
    });

    it("throws for invalid function names and unknown config tokens", () => {
        expect(() =>
            GradientRadial.fromAbi({
                functionName: "linear-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            }),
        ).toThrow("Invalid function name for GradientRadial");

        expect(() =>
            GradientRadial.fromString(
                "radial-gradient(circle banana, red, blue)",
            ),
        ).toThrow("Unknown radial gradient config token");
    });
});
