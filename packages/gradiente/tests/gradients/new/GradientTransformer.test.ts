import { describe, expect, it } from "vitest";
import {
    GradientLinear,
    GradientMesh,
    GradientTransformer,
    ModuleTransformerLinearGradientToCss,
    type ISvgGradientResult,
} from "../../../src/gradient";

const linearStops = [
    { type: "color-stop" as const, value: "red", position: 0 },
    { type: "color-stop" as const, value: "blue", position: 1 },
];

const meshSource = [
    "mesh-gradient(",
    "grid 2 2 method bilinear in oklab, ",
    "vertex v00 0% 0% red, ",
    "vertex v10 100% 0% blue, ",
    "vertex v01 0% 100% red, ",
    "vertex v11 100% 100% blue, ",
    "patch p00 v00 v10 v11 v01",
    ")",
].join("");

describe("GradientTransformer", () => {
    it("registers modules through a shared module contract", () => {
        const module = GradientTransformer.get("css", "linear-gradient");

        expect(module).toBeInstanceOf(ModuleTransformerLinearGradientToCss);
    });

    it("transforms string input with the new gradient classes", () => {
        const output = GradientTransformer.to<string>(
            "css",
            "linear-gradient(to top in oklab, red, blue)",
        );

        expect(output).toBe("linear-gradient(to top in oklab, red, blue)");
    });

    it("transforms new gradient instances without the old GradientFactory", () => {
        const gradient = new GradientLinear(linearStops, {
            interpolation: {
                colorSpace: "oklab",
            },
        });

        expect(GradientTransformer.to<string>("css", gradient)).toBe(
            "linear-gradient(in oklab, red, blue)",
        );
    });

    it("builds SVG transformer output for new radial gradients", () => {
        const result = GradientTransformer.to<ISvgGradientResult>(
            "svg",
            "radial-gradient(circle at 25% 75% in oklab, red, blue)",
        );

        expect(result.type).toBe("radialGradient");
        expect(result.url).toBe("url(#gradiente-radial-gradient)");
        expect(result.gradient).toContain("<radialGradient");
        expect(result.gradient).toContain("<stop");
    });

    it("uses the new GradientMesh model for mesh transformer output", () => {
        const gradient = GradientMesh.fromString(meshSource);
        const css = GradientTransformer.to<string>("css", gradient);

        expect(css).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(decodeURIComponent(css)).toContain("<rect");
    });
});
