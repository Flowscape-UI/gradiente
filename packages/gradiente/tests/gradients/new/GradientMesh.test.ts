import { describe, expect, it } from "vitest";
import {
    GradientMesh,
    type GradientMeshPatch,
    type GradientMeshVertex,
} from "../../../src/gradient";

const defaultVertices: GradientMeshVertex[] = [
    {
        id: "v00",
        x: { kind: "percent", value: 0 },
        y: { kind: "percent", value: 0 },
        color: "red",
    },
    {
        id: "v10",
        x: { kind: "percent", value: 100 },
        y: { kind: "percent", value: 0 },
        color: "blue",
    },
    {
        id: "v01",
        x: { kind: "percent", value: 0 },
        y: { kind: "percent", value: 100 },
        color: "red",
    },
    {
        id: "v11",
        x: { kind: "percent", value: 100 },
        y: { kind: "percent", value: 100 },
        color: "blue",
    },
];

const defaultPatches: GradientMeshPatch[] = [
    {
        id: "p00",
        topLeft: "v00",
        topRight: "v10",
        bottomRight: "v11",
        bottomLeft: "v01",
    },
];

describe("GradientMesh", () => {
    it("creates a mesh gradient with inferred grid and default config", () => {
        const gradient = new GradientMesh(defaultVertices, defaultPatches);

        expect(gradient.type).toBe("mesh-gradient");
        expect(gradient.getConfig()).toEqual({
            rows: 2,
            columns: 2,
            method: "bilinear",
            interpolation: {
                colorSpace: "srgb",
            },
        });
        expect(gradient.toString()).toBe(
            [
                "mesh-gradient(",
                "grid 2 2 method bilinear, ",
                "vertex v00 0% 0% red, ",
                "vertex v10 100% 0% blue, ",
                "vertex v01 0% 100% red, ",
                "vertex v11 100% 100% blue, ",
                "patch p00 v00 v10 v11 v01",
                ")",
            ].join(""),
        );
    });

    it("parses and serializes mesh configs, vertices, patches, and handles", () => {
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
        const gradient = GradientMesh.fromString(input);

        expect(gradient.getConfig()).toEqual({
            rows: 2,
            columns: 2,
            method: "bicubic",
            interpolation: {
                colorSpace: "oklch",
                hue: "longer",
            },
        });
        expect(gradient.getPatches()[0].handles).toEqual({
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

    it("parses mesh gradients without explicit grid config when topology is inferable", () => {
        const gradient = GradientMesh.fromString(
            [
                "mesh-gradient(",
                "vertex v00 0% 0% red, ",
                "vertex v10 100% 0% blue, ",
                "vertex v01 0% 100% red, ",
                "vertex v11 100% 100% blue, ",
                "patch p00 v00 v10 v11 v01",
                ")",
            ].join(""),
        );

        expect(gradient.getConfig()).toEqual({
            rows: 2,
            columns: 2,
            method: "bilinear",
            interpolation: {
                colorSpace: "srgb",
            },
        });
    });

    it("normalizes hue interpolation away for non-polar color spaces", () => {
        const gradient = GradientMesh.fromString(
            [
                "mesh-gradient(",
                "grid 2 2 method bilinear in oklab shorter hue, ",
                "vertex v00 0% 0% red, ",
                "vertex v10 100% 0% blue, ",
                "vertex v01 0% 100% red, ",
                "vertex v11 100% 100% blue, ",
                "patch p00 v00 v10 v11 v01",
                ")",
            ].join(""),
        );

        expect(gradient.getConfig().interpolation).toEqual({
            colorSpace: "oklab",
        });
        expect(gradient.toString()).toContain("in oklab, vertex");
    });

    it("samples bilinear patch colors with configured color interpolation", () => {
        const srgb = new GradientMesh(defaultVertices, defaultPatches);
        const oklab = new GradientMesh(defaultVertices, defaultPatches, {
            interpolation: {
                colorSpace: "oklab",
            },
        });

        expect(srgb.samplePatchColor("p00", 0.5, 0.5)).toBe("rgb(128, 0, 128)");
        expect(oklab.samplePatchColor("p00", 0.5, 0.5)).toBe("rgb(140, 83, 162)");
    });

    it("respects polar hue interpolation while sampling patch colors", () => {
        const vertices: GradientMeshVertex[] = defaultVertices.map((vertex) => ({
            ...vertex,
            color: vertex.id.endsWith("0")
                ? "hsl(10 100% 50%)"
                : "hsl(350 100% 50%)",
        }));
        const shorter = new GradientMesh(vertices, defaultPatches, {
            interpolation: {
                colorSpace: "hsl",
                hue: "shorter",
            },
        });
        const longer = new GradientMesh(vertices, defaultPatches, {
            interpolation: {
                colorSpace: "hsl",
                hue: "longer",
            },
        });

        expect(shorter.samplePatchColor("p00", 0.5, 0.5)).toBe("rgb(255, 0, 0)");
        expect(longer.samplePatchColor("p00", 0.5, 0.5)).toBe("rgb(0, 255, 255)");
    });

    it("samples bicubic patches on distorted regular grids by vertex id topology", () => {
        const gradient = GradientMesh.fromString(
            [
                "mesh-gradient(",
                "grid 3 3 method bicubic in oklab, ",
                "vertex v00 0% 0% #ff00aa, ",
                "vertex v10 46% 8% #faff00, ",
                "vertex v20 100% 0% #7c00ff, ",
                "vertex v01 7% 45% #00c2ff, ",
                "vertex v11 55% 42% #fff7cc, ",
                "vertex v21 94% 56% #ff4fd8, ",
                "vertex v02 0% 100% #00ff7f, ",
                "vertex v12 48% 93% #00f0ff, ",
                "vertex v22 100% 100% #005eff, ",
                "patch p00 v00 v10 v11 v01, ",
                "patch p10 v10 v20 v21 v11, ",
                "patch p01 v01 v11 v12 v02, ",
                "patch p11 v11 v21 v22 v12",
                ")",
            ].join(""),
        );

        expect(gradient.samplePatchColor("p11", 0.5, 0.5)).toMatch(/^rgb\(/);
    });

    it("clones data without sharing mutable vertex and patch state", () => {
        const gradient = new GradientMesh(defaultVertices, defaultPatches);
        const cloned = gradient.clone();
        const clonedVertices = cloned.getVertices();

        clonedVertices[0].color = "black";

        expect(cloned).toBeInstanceOf(GradientMesh);
        expect(gradient.equals(cloned)).toBe(true);
        expect(cloned.getVertex("v00")?.color).toBe("red");
    });

    it("rejects invalid mesh topology and repeating mesh gradients", () => {
        expect(() =>
            GradientMesh.fromString(
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

        expect(() =>
            GradientMesh.fromString(
                [
                    "repeating-mesh-gradient(",
                    "grid 2 2, ",
                    "vertex v00 0% 0% red, ",
                    "vertex v10 100% 0% blue, ",
                    "vertex v01 0% 100% red, ",
                    "vertex v11 100% 100% blue, ",
                    "patch p00 v00 v10 v11 v01",
                    ")",
                ].join(""),
            ),
        ).toThrow("GradientMesh does not support repeating gradients");
    });
});
