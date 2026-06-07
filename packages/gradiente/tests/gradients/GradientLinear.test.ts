import { describe, expect, it } from "vitest";
import { degToRad, normalizeAngleRad } from "../../src/utils";
import { GradientLinear, type GradientLinearStop } from "../../src/gradient";

const defaultStops: GradientLinearStop[] = [
    { type: "color-stop", value: "red", position: 0 },
    { type: "color-stop", value: "blue", position: 1 },
];

describe("GradientLinear", () => {
    it("creates a valid linear gradient with default config when config is omitted", () => {
        const gradient = new GradientLinear(defaultStops);

        expect(gradient.type).toBe("linear-gradient");
        expect(gradient.isRepeating()).toBe(false);
        expect(gradient.getConfig()).toEqual({
            angle: normalizeAngleRad(Math.PI),
            interpolation: {
                colorSpace: "srgb",
            },
            isRepeating: false,
        });
        expect(gradient.getStops()).toEqual(defaultStops);
        expect(gradient.toString()).toBe("linear-gradient(red, blue)");
    });

    it("resolves optional constructor config from defaults", () => {
        const gradient = new GradientLinear(defaultStops, {
            isRepeating: true,
            angle: degToRad(450),
        });

        expect(gradient.isRepeating()).toBe(true);
        expect(gradient.getConfig()).toEqual({
            angle: normalizeAngleRad(degToRad(450)),
            interpolation: {
                colorSpace: "srgb",
            },
            isRepeating: true,
        });
        expect(gradient.toString()).toBe(
            "repeating-linear-gradient(to right, red, blue)",
        );
    });

    it("accepts stops and optional config as separate constructor parameters", () => {
        const stops: GradientLinearStop[] = [
            { type: "color-stop", value: "red", position: 0 },
            { type: "color-hint", position: 0.5 },
            { type: "color-stop", value: "blue", position: 1 },
        ];
        const gradient = new GradientLinear(stops, {
            angle: 0,
            interpolation: {
                colorSpace: "oklch",
                hue: "longer",
            },
        });

        expect(gradient.toJSON()).toEqual({
            type: "linear-gradient",
            config: {
                angle: 0,
                interpolation: {
                    colorSpace: "oklch",
                    hue: "longer",
                },
                isRepeating: false,
            },
            stops,
        });
        expect(gradient.toString()).toBe(
            "linear-gradient(to top in oklch longer hue, red 0%, 50%, blue 100%)",
        );
    });

    it("parses a simple string and serializes it compactly", () => {
        const gradient = GradientLinear.fromString("linear-gradient(red, blue)");

        expect(gradient).toBeInstanceOf(GradientLinear);
        expect(gradient.toString()).toBe("linear-gradient(red, blue)");
        expect(gradient.getStops()).toEqual([
            { type: "color-stop", value: "red", position: 0 },
            { type: "color-stop", value: "blue", position: 1 },
        ]);
    });

    it("parses repeating gradients with direction, explicit positions, and color hints", () => {
        const gradient = GradientLinear.fromString(
            "repeating-linear-gradient(to right, red 10%, 50%, blue 80%)",
        );

        expect(gradient.isRepeating()).toBe(true);
        expect(gradient.getConfig()).toEqual({
            angle: normalizeAngleRad(degToRad(90)),
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
            "repeating-linear-gradient(to right, red 10%, 50%, blue 80%)",
        );
    });

    it("serializes non-default interpolation and drops hue for non-polar color spaces", () => {
        const gradient = GradientLinear.fromString(
            "linear-gradient(53deg in oklab shorter hue, hsl(238, 65%, 62%) 0%, hsl(227, 84%, 40%) 40%, hsl(141, 97%, 53%) 100%)",
        );

        expect(gradient.getConfig().interpolation).toEqual({
            colorSpace: "oklab",
        });
        expect(gradient.toString()).toBe(
            "linear-gradient(53deg in oklab, hsl(238, 65%, 62%) 0%, hsl(227, 84%, 40%) 40%, hsl(141, 97%, 53%) 100%)",
        );
    });

    it("collapses adjacent equal color stops into a double-position stop", () => {
        const gradient = new GradientLinear(
            [
                { type: "color-stop", value: "red", position: 0.5 },
                { type: "color-stop", value: "red", position: 0.6 },
                { type: "color-stop", value: "blue", position: 1 },
            ],
        );

        expect(gradient.toString()).toBe(
            "linear-gradient(red 50% 60%, blue 100%)",
        );
    });

    it("clone preserves data and does not share mutable state", () => {
        const gradient = GradientLinear.fromString(
            "linear-gradient(to left, red 0%, blue 100%)",
        );
        const cloned = gradient.clone();

        cloned.addStop({
            type: "color-stop",
            value: "green",
            position: 0.5,
        });

        expect(cloned).toBeInstanceOf(GradientLinear);
        expect(gradient.equals(cloned)).toBe(false);
        expect(gradient.getStops()).toHaveLength(2);
        expect(cloned.getStops()).toHaveLength(3);
    });

    it("throws when ABI function name is not linear-gradient", () => {
        expect(() =>
            GradientLinear.fromAbi({
                functionName: "radial-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            }),
        ).toThrow("Invalid function name for GradientLinear");
    });
});
