import { describe, expect, it } from "vitest";
import {
    GradientConic,
    type GradientConicStop,
} from "../../../src/gradient";

const defaultStops: GradientConicStop[] = [
    { type: "color-stop", value: "red", position: 0 },
    { type: "color-stop", value: "blue", position: 1 },
];

describe("GradientConic", () => {
    it("creates a conic gradient with default config when config is omitted", () => {
        const gradient = new GradientConic(defaultStops);

        expect(gradient.type).toBe("conic-gradient");
        expect(gradient.isRepeating()).toBe(false);
        expect(gradient.getConfig()).toEqual({
            from: {
                kind: "angle",
                value: 0,
                unit: "deg",
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
        expect(gradient.toString()).toBe("conic-gradient(red, blue)");
    });

    it("accepts stops and optional config as separate constructor parameters", () => {
        const gradient = new GradientConic(defaultStops, {
            isRepeating: true,
            from: {
                kind: "angle",
                value: 45,
                unit: "deg",
            },
            position: {
                kind: "values",
                x: { kind: "percent", value: 49 },
                y: { kind: "percent", value: 45 },
            },
        });

        expect(gradient.toString()).toBe(
            "repeating-conic-gradient(from 45deg at 49% 45%, red, blue)",
        );
    });

    it("parses a simple string and serializes it compactly", () => {
        const gradient = GradientConic.fromString("conic-gradient(red, blue)");

        expect(gradient).toBeInstanceOf(GradientConic);
        expect(gradient.toString()).toBe("conic-gradient(red, blue)");
        expect(gradient.getStops()).toEqual(defaultStops);
    });

    it("parses repeating conic gradients with from angle, position, and stops", () => {
        const gradient = GradientConic.fromString(
            "repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)",
        );

        expect(gradient.isRepeating()).toBe(true);
        expect(gradient.getConfig()).toEqual({
            from: {
                kind: "angle",
                value: 45,
                unit: "deg",
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
            "repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)",
        );
    });

    it("normalizes reversed keyword positions into x/y order", () => {
        const gradient = GradientConic.fromString(
            "conic-gradient(at top left, red, blue)",
        );

        expect(gradient.getConfig().position).toEqual({
            kind: "keywords",
            x: "left",
            y: "top",
        });
        expect(gradient.toString()).toBe(
            "conic-gradient(at left top, red, blue)",
        );
    });

    it("serializes polar interpolation with hue and drops hue for non-polar spaces", () => {
        const polar = GradientConic.fromString(
            "conic-gradient(in oklch increasing hue, red, blue)",
        );
        const rectangular = GradientConic.fromString(
            "conic-gradient(in oklab shorter hue, red, blue)",
        );

        expect(polar.toString()).toBe(
            "conic-gradient(in oklch increasing hue, red, blue)",
        );
        expect(rectangular.getConfig().interpolation).toEqual({
            colorSpace: "oklab",
        });
        expect(rectangular.toString()).toBe(
            "conic-gradient(in oklab, red, blue)",
        );
    });

    it("clone preserves data and does not share mutable state", () => {
        const gradient = GradientConic.fromString(
            "conic-gradient(from 45deg at right bottom, red 0%, blue 100%)",
        );
        const cloned = gradient.clone();

        cloned.addStop({
            type: "color-stop",
            value: "green",
            position: 0.5,
        });

        expect(cloned).toBeInstanceOf(GradientConic);
        expect(gradient.equals(cloned)).toBe(false);
        expect(gradient.getStops()).toHaveLength(2);
        expect(cloned.getStops()).toHaveLength(3);
    });

    it("throws for invalid function names and unknown config tokens", () => {
        expect(() =>
            GradientConic.fromAbi({
                functionName: "radial-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            }),
        ).toThrow("Invalid function name for GradientConic");

        expect(() =>
            GradientConic.fromString(
                "conic-gradient(from 45deg banana, red, blue)",
            ),
        ).toThrow("Unknown conic gradient config token");
    });
});
