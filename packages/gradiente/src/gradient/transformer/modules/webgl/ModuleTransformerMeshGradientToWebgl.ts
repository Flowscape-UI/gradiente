import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";
import { createWebGLProgram } from "./helpers";
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
                const gl = canvas.getContext("webgl");

                if (!gl) {
                    throw new Error("WebGL is not supported.");
                }

                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);

                const vertexSource = `
                    attribute vec2 a_position;
                    attribute vec4 a_color;
                    varying vec4 v_color;

                    void main() {
                        v_color = a_color;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                    }
                `;
                const fragmentSource = `
                    precision mediump float;
                    varying vec4 v_color;

                    void main() {
                        gl_FragColor = v_color;
                    }
                `;
                const program = createWebGLProgram(
                    gl,
                    vertexSource,
                    fragmentSource,
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

                const positionBuffer = gl.createBuffer();
                const colorBuffer = gl.createBuffer();

                gl.useProgram(program);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(positions),
                    gl.STATIC_DRAW,
                );

                const positionLocation = gl.getAttribLocation(program, "a_position");
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(colors),
                    gl.STATIC_DRAW,
                );

                const colorLocation = gl.getAttribLocation(program, "a_color");
                gl.enableVertexAttribArray(colorLocation);
                gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
            },
        };
    }
}
