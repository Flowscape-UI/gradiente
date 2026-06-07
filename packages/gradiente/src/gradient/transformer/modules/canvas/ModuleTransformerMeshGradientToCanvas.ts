import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    type MeshRenderVertex,
} from "../helpers";
import type {
    ICanvasPaintResult,
} from "../types";
import { GradientTransformerModule } from "../GradientTransformerModule";

const BICUBIC_SUBDIVISIONS = 24;

function getBarycentric(
    x: number,
    y: number,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): [number, number, number] | null {
    const denominator =
        (b.y - c.y) * (a.x - c.x) +
        (c.x - b.x) * (a.y - c.y);

    if (Math.abs(denominator) < 0.000001) {
        return null;
    }

    const wA =
        ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) /
        denominator;
    const wB =
        ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) /
        denominator;
    const wC = 1 - wA - wB;
    const epsilon = -0.0001;

    if (wA < epsilon || wB < epsilon || wC < epsilon) {
        return null;
    }

    return [wA, wB, wC];
}

function mixTriangleColor(
    weights: [number, number, number],
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): [number, number, number, number] {
    const [wA, wB, wC] = weights;

    return [
        Math.round((a.color[0] * wA + b.color[0] * wB + c.color[0] * wC) * 255),
        Math.round((a.color[1] * wA + b.color[1] * wB + c.color[1] * wC) * 255),
        Math.round((a.color[2] * wA + b.color[2] * wB + c.color[2] * wC) * 255),
        Math.round((a.color[3] * wA + b.color[3] * wB + c.color[3] * wC) * 255),
    ];
}

function fillTriangle(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): void {
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            const weights = getBarycentric(x + 0.5, y + 0.5, a, b, c);

            if (!weights) {
                continue;
            }

            const color = mixTriangleColor(weights, a, b, c);
            const offset = (y * width + x) * 4;

            data[offset] = color[0];
            data[offset + 1] = color[1];
            data[offset + 2] = color[2];
            data[offset + 3] = color[3];
        }
    }
}

export class ModuleTransformerMeshGradientToCanvas
extends GradientTransformerModule<GradientMesh, ICanvasPaintResult> {
    constructor() {
        super({
            target: "canvas-2d",
            gradientType: "mesh-gradient",
            gradientClass: GradientMesh,
            expectedName: "GradientMesh",
        });
    }

    protected transform(gradient: GradientMesh): ICanvasPaintResult {
        return {
            draw: (ctx, width, height) => {
                const imageData = ctx.createImageData(width, height);
                const { config, patches, vertexMap, grid, sampler } =
                    buildMeshRenderContext(gradient, width, height);
                const subdivisions = config.method === "bicubic"
                    ? BICUBIC_SUBDIVISIONS
                    : 1;
                const edgeTriangles = buildMeshEdgeSkirtTriangles(
                    sampler,
                    patches,
                    grid,
                    width,
                    height,
                    subdivisions,
                );

                for (const patch of patches) {
                    const triangles = buildPatchTriangles(
                        sampler,
                        patch,
                        vertexMap,
                        subdivisions,
                    );

                    for (const [a, b, c] of triangles) {
                        fillTriangle(imageData.data, width, height, a, b, c);
                    }
                }

                for (const [a, b, c] of edgeTriangles) {
                    fillTriangle(imageData.data, width, height, a, b, c);
                }

                ctx.putImageData(imageData, 0, 0);
            },
        };
    }
}
