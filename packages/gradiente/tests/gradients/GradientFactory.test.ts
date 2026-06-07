import { describe, expect, it } from "vitest";
import {
    format,
    GradientFactory,
    GradientLinear,
    GradientMesh,
    isGradient,
    parse,
    transformTo,
    type ISvgGradientResult,
} from "../../src/gradient";

describe("GradientFactory", () => {
    it("parses built-in gradient strings through the public API", () => {
        expect(parse("linear-gradient(red, blue)")).toBeInstanceOf(
            GradientLinear,
        );
        expect(parse("mesh-gradient(grid 2 2, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)")).toBeInstanceOf(
            GradientMesh,
        );
    });

    it("normalizes repeating function names for lookup and creation", () => {
        const gradient = GradientFactory.create(
            "repeating-linear-gradient(red, blue)",
        );

        expect(gradient).toBeInstanceOf(GradientLinear);
        expect(GradientFactory.get("repeating-linear-gradient")).toBe(
            GradientLinear,
        );
    });

    it("keeps public validation and formatting helpers", () => {
        expect(isGradient("linear-gradient(red, blue)")).toBe(true);
        expect(isGradient("not-a-gradient")).toBe(false);
        expect(format("linear-gradient(90deg, red, blue)")).toBe(
            "linear-gradient(to right, red, blue)",
        );
    });

    it("uses the factory path for transformer helpers", () => {
        const css = transformTo("css", "linear-gradient(red, blue)");
        const svg = transformTo("svg", "linear-gradient(red, blue)");

        expect(css).toBe("linear-gradient(red, blue)");
        expect((svg as ISvgGradientResult).type).toBe("linearGradient");
    });
});
