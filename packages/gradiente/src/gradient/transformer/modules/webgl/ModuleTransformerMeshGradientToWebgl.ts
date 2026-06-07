import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";
import { createWebGLProgram } from "./helpers";
import {
    WEBGL_MESH_FRAGMENT_SHADER,
    WEBGL_MESH_VERTEX_SHADER,
} from "./glsl";
import {
    bindWebGLAttribute,
    drawWebGLTriangles,
    prepareWebGLCanvas,
} from "./runtime";
import type { IWebGLPaintResult } from "./types";

const BICUBIC_SUBDIVISIONS = 24;

function toClipX(value: number, width: number): number {
    return (value / width) * 2 - 1;
}

function toClipY(value: number, height: number): number {
    return 1 - (value / height) * 2;
}

export class ModuleTransformerMeshGradientToCanvasWebGL
extends GradientTransformerModule<GradientMesh, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "mesh-gradient",
            gradientClass: GradientMesh,
            expectedName: "GradientMesh",
        });
    }

    protected transform(gradient: GradientMesh): IWebGLPaintResult {
        return {
            draw: (canvas, width, height) => {
                const gl = prepareWebGLCanvas(canvas, width, height);
                const program = createWebGLProgram(
                    gl,
                    WEBGL_MESH_VERTEX_SHADER,
                    WEBGL_MESH_FRAGMENT_SHADER,
                );
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
                const positions: number[] = [];
                const colors: number[] = [];

                for (const patch of patches) {
                    const triangles = buildPatchTriangles(
                        sampler,
                        patch,
                        vertexMap,
                        subdivisions,
                    );

                    for (const triangle of triangles) {
                        for (const vertex of triangle) {
                            positions.push(
                                toClipX(vertex.x, width),
                                toClipY(vertex.y, height),
                            );
                            colors.push(...vertex.color);
                        }
                    }
                }

                for (const triangle of edgeTriangles) {
                    for (const vertex of triangle) {
                        positions.push(
                            toClipX(vertex.x, width),
                            toClipY(vertex.y, height),
                        );
                        colors.push(...vertex.color);
                    }
                }

                gl.useProgram(program);
                bindWebGLAttribute(
                    gl,
                    program,
                    "a_position",
                    new Float32Array(positions),
                    2,
                );
                bindWebGLAttribute(
                    gl,
                    program,
                    "a_color",
                    new Float32Array(colors),
                    4,
                );
                drawWebGLTriangles(gl, positions.length / 2);
            },
        };
    }
}
