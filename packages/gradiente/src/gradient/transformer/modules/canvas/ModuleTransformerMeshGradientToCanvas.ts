import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    rasterizeMeshTriangle,
    type MeshTriangle,
} from "../helpers";
import type {
    ICanvasPaintResult,
} from "../types";
import { GradientTransformerModule } from "../GradientTransformerModule";

const BICUBIC_SUBDIVISIONS = 24;

function fillMeshTriangle(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    triangle: MeshTriangle,
): void {
    rasterizeMeshTriangle(width, height, triangle, (x, y, color) => {
        const offset = (y * width + x) * 4;

        data[offset] = Math.round(color[0] * 255);
        data[offset + 1] = Math.round(color[1] * 255);
        data[offset + 2] = Math.round(color[2] * 255);
        data[offset + 3] = Math.round(color[3] * 255);
    });
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

                    for (const triangle of triangles) {
                        fillMeshTriangle(imageData.data, width, height, triangle);
                    }
                }

                for (const triangle of edgeTriangles) {
                    fillMeshTriangle(imageData.data, width, height, triangle);
                }

                ctx.putImageData(imageData, 0, 0);
            },
        };
    }
}
