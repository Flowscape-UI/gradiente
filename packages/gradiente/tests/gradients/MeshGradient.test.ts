import { describe, expect, it } from "vitest";
import {
    GradientFactory,
    GradientTransformer,
    MeshGradient,
    parse,
    transformTo,
} from "../../src";

describe("MeshGradient", () => {
    const source = [
        "mesh-gradient(",
        "grid 2 2 method bilinear in oklab, ",
        "vertex v00 0% 0% red, ",
        "vertex v10 100% 0% blue, ",
        "vertex v01 0% 100% yellow, ",
        "vertex v11 100% 100% green, ",
        "patch p00 v00 v10 v11 v01",
        ")",
    ].join("");

    it("parses mesh-gradient strings into vertices and patches", () => {
        const gradient = MeshGradient.fromString(source);

        expect(gradient.type).toBe("mesh-gradient");
        expect(gradient.config).toEqual({
            rows: 2,
            columns: 2,
            method: "bilinear",
            interpolation: {
                colorSpace: "oklab",
            },
        });
        expect(gradient.vertices).toHaveLength(4);
        expect(gradient.patches).toEqual([
            {
                id: "p00",
                topLeft: "v00",
                topRight: "v10",
                bottomRight: "v11",
                bottomLeft: "v01",
            },
        ]);
    });

    it("serializes mesh-gradient strings", () => {
        const gradient = MeshGradient.fromString(source);

        expect(gradient.toString()).toBe(source);
    });

    it("parses and serializes patch handles", () => {
        const input = [
            "mesh-gradient(",
            "grid 2 2 method bicubic in oklch longer hue, ",
            "vertex v00 0% 0% red, ",
            "vertex v10 100% 0% blue, ",
            "vertex v01 0% 100% yellow, ",
            "vertex v11 100% 100% green, ",
            "patch p00 v00 v10 v11 v01, ",
            "handle p00 top 25% 0% 75% 0%, ",
            "handle p00 right 100% 25% 100% 75%",
            ")",
        ].join("");
        const gradient = MeshGradient.fromString(input);

        expect(gradient.config).toEqual({
            rows: 2,
            columns: 2,
            method: "bicubic",
            interpolation: {
                colorSpace: "oklch",
                hue: "longer",
            },
        });
        expect(gradient.patches[0].handles).toEqual({
            top: {
                from: {
                    x: { kind: "percent", value: 25 },
                    y: { kind: "percent", value: 0 },
                },
                to: {
                    x: { kind: "percent", value: 75 },
                    y: { kind: "percent", value: 0 },
                },
            },
            right: {
                from: {
                    x: { kind: "percent", value: 100 },
                    y: { kind: "percent", value: 25 },
                },
                to: {
                    x: { kind: "percent", value: 100 },
                    y: { kind: "percent", value: 75 },
                },
            },
        });
        expect(gradient.toString()).toBe(input);
    });

    it("is registered in the factory helpers", () => {
        const gradient = parse(source);

        expect(gradient).toBeInstanceOf(MeshGradient);
        expect(GradientFactory.get("mesh-gradient")).toBe(MeshGradient);
    });

    it("validates patch vertex references", () => {
        expect(() =>
            MeshGradient.fromString(
                [
                    "mesh-gradient(",
                    "grid 2 2, ",
                    "vertex v00 0% 0% red, ",
                    "vertex v10 100% 0% blue, ",
                    "vertex v01 0% 100% yellow, ",
                    "vertex v12 100% 100% green, ",
                    "patch p00 v00 v10 v11 v01",
                    ")",
                ].join(""),
            ),
        ).toThrow("Mesh patch references missing vertex: v11");
    });

    it("validates regular grid vertex and patch counts", () => {
        expect(() =>
            MeshGradient.fromString(
                [
                    "mesh-gradient(",
                    "grid 3 3, ",
                    "vertex v00 0% 0% red, ",
                    "vertex v10 50% 0% blue, ",
                    "vertex v20 100% 0% green, ",
                    "vertex v01 0% 50% yellow, ",
                    "patch p00 v00 v10 v01 v20",
                    ")",
                ].join(""),
            ),
        ).toThrow("Mesh gradient expected 9 vertices");
    });

    it("rejects repeating mesh gradients", () => {
        expect(() =>
            MeshGradient.fromString(
                source.replace("mesh-gradient", "repeating-mesh-gradient"),
            ),
        ).toThrow("MeshGradient does not support repeating gradients");
    });

    it("rejects duplicate grid configs", () => {
        expect(() =>
            MeshGradient.fromString(
                source.replace("vertex v00", "grid 2 2, vertex v00"),
            ),
        ).toThrow("mesh-gradient can only contain one grid config");
    });

    it("parses the first mesh-gradient when the same gradient is pasted twice without a separator", () => {
        const gradient = MeshGradient.fromString(`${source}${source}`);

        expect(gradient.toString()).toBe(source);
    });

    it("registers CSS, Canvas, and WebGL transformers", () => {
        const gradient = MeshGradient.fromString(source);
        const css = transformTo<string>("css", gradient);

        expect(css).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(decodeURIComponent(css)).toContain("<rect");
        expect(GradientTransformer.get("canvas-2d", "mesh-gradient")).not.toBeNull();
        expect(GradientTransformer.get("canvas-webgl", "mesh-gradient")).not.toBeNull();
    });

    it("supports distorted regular grids whose vertices are not sorted by y position", () => {
        const gradient = MeshGradient.fromString(
            "mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% #ff6b9a, vertex v10 32% 4% #ffc857, vertex v20 68% 8% #b794f4, vertex v30 100% 0% #6d5dfc, vertex v01 6% 31% #4f8cff, vertex v11 35% 28% #ffe6b3, vertex v21 69% 34% #ff78c4, vertex v31 96% 28% #9b5de5, vertex v02 3% 67% #35d399, vertex v12 39% 61% #7dd3fc, vertex v22 63% 70% #f0abfc, vertex v32 100% 66% #2563eb, vertex v03 0% 100% #22c55e, vertex v13 32% 96% #06b6d4, vertex v23 70% 92% #3b82f6, vertex v33 100% 100% #1d4ed8, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)",
        );
        const css = transformTo<string>("css", gradient);

        expect(css).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(decodeURIComponent(css)).toContain("<rect");
    });
});
