import { describe, expect, it } from "vitest";
import { ConicGradient } from "../../src/gradients";


describe("ConicGradient", () => {
    describe("basic implementation", () => {
        it("sets the correct type during initialization", () => {
            const gradient = new ConicGradient({
                isRepeating: false,
                config: {
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
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(gradient.type).toBe("conic-gradient");
        });

        it("clone returns a ConicGradient instance", () => {
            const gradient = new ConicGradient({
                isRepeating: false,
                config: {
                    from: {
                        kind: "angle",
                        value: 45,
                        unit: "deg",
                    },
                    position: {
                        kind: "keywords",
                        x: "center",
                        y: "center",
                    },
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned).toBeInstanceOf(ConicGradient);
            expect(cloned.type).toBe("conic-gradient");
            expect(cloned).not.toBe(gradient);
            expect(cloned.toJSON()).toEqual(gradient.toJSON());
        });
    });

    describe("toString", () => {
        it("uses conic-gradient for non-repeating gradients", () => {
            const gradient = new ConicGradient({
                isRepeating: false,
                config: {
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
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(gradient.toString()).toContain("conic-gradient(");
            expect(gradient.toString()).not.toContain("repeating-conic-gradient(");
        });

        it("uses repeating-conic-gradient for repeating gradients", () => {
            const gradient = new ConicGradient({
                isRepeating: true,
                config: {
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
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(gradient.toString()).toContain("repeating-conic-gradient(");
        });

        it("serializes config", () => {
            const gradient = new ConicGradient({
                isRepeating: false,
                config: {
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
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain("from 45deg");
            expect(result).toContain("at 49% 45%");
        });

        it("serializes interpolation", () => {
            const gradient = new ConicGradient({
                isRepeating: false,
                config: {
                    from: {
                        kind: "angle",
                        value: 45,
                        unit: "deg",
                    },
                    position: {
                        kind: "keywords",
                        x: "center",
                        y: "center",
                    },
                    interpolation: {
                        kind: "polar",
                        space: "oklch",
                        hueMethod: "increasing",
                    },
                },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(gradient.toString()).toContain("in oklch increasing hue");
        });
    });

    describe("fromAbi", () => {
        it("creates a ConicGradient from a simple ABI", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            });

            expect(gradient).toBeInstanceOf(ConicGradient);
            expect(gradient.type).toBe("conic-gradient");
            expect(gradient.isRepeating).toBe(false);
        });

        it("preserves repeating flag from ABI", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: true,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            });

            expect(gradient.isRepeating).toBe(true);
        });

        it("uses default config when ABI has no config input", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            });

            expect(gradient.config).toEqual({
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
            });
        });

        it("parses from/position config", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: false,
                inputs: [
                    { type: "config", value: "from 45deg at 49% 45%" },
                    { type: "color-stop", value: "red 10%" },
                    { type: "color-stop", value: "blue 80%" },
                ],
            });

            expect(gradient.config).toEqual({
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
        });

        it("parses interpolation config", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: false,
                inputs: [
                    { type: "config", value: "from 45deg at center center in oklch increasing hue" },
                    { type: "color-stop", value: "red" },
                    { type: "color-stop", value: "blue" },
                ],
            });

            expect(gradient.config).toEqual({
                from: {
                    kind: "angle",
                    value: 45,
                    unit: "deg",
                },
                position: {
                    kind: "keywords",
                    x: "center",
                    y: "center",
                },
                interpolation: {
                    kind: "polar",
                    space: "oklch",
                    hueMethod: "increasing",
                },
            });
        });

        it("normalizes stop positions from ABI", () => {
            const gradient = ConicGradient.fromAbi({
                functionName: "conic-gradient",
                isRepeating: false,
                inputs: [
                    { type: "color-stop", value: "red 10%" },
                    { type: "color-hint", value: "50%" },
                    { type: "color-stop", value: "blue 80%" },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0.1 },
                { type: "color-hint", value: "50%", position: 0.5 },
                { type: "color-stop", value: "blue", position: 0.8 },
            ]);
        });

        it("throws for invalid function name", () => {
            expect(() =>
                ConicGradient.fromAbi({
                    functionName: "radial-gradient",
                    isRepeating: false,
                    inputs: [
                        { type: "color-stop", value: "red" },
                        { type: "color-stop", value: "blue" },
                    ],
                }),
            ).toThrow("Invalid function name for ConicGradient");
        });
    });

    describe("fromString", () => {
        it("creates a ConicGradient from a simple string", () => {
            const gradient = ConicGradient.fromString(
                "conic-gradient(red, blue)",
            );

            expect(gradient).toBeInstanceOf(ConicGradient);
            expect(gradient.type).toBe("conic-gradient");
        });

        it("creates a repeating ConicGradient from string", () => {
            const gradient = ConicGradient.fromString(
                "repeating-conic-gradient(red, blue)",
            );

            expect(gradient.isRepeating).toBe(true);
        });

        it("parses config and stops through ABI delegation", () => {
            const gradient = ConicGradient.fromString(
                "conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)",
            );

            expect(gradient.config).toEqual({
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

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0.1 },
                { type: "color-hint", value: "50%", position: 0.5 },
                { type: "color-stop", value: "blue", position: 0.8 },
            ]);
        });
    });
});