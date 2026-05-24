import {
    MeshGradient,
    type GradientLike,
} from "../../../gradients";
import {
    buildMeshVertexMap,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    buildRegularMeshGrid,
} from "../helpers";
import type { IGradientTransformerModule } from "../types";
import type { IWebGLPaintResult } from "./types";

const BICUBIC_SUBDIVISIONS = 24;

function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader {
    const shader = gl.createShader(type);

    if (!shader) {
        throw new Error("Failed to create WebGL shader.");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`WebGL shader compile error: ${error}`);
    }

    return shader;
}

function createProgram(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string,
): WebGLProgram {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();

    if (!program) {
        throw new Error("Failed to create WebGL program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`WebGL program link error: ${error}`);
    }

    return program;
}

function toClipX(value: number, width: number): number {
    return (value / width) * 2 - 1;
}

function toClipY(value: number, height: number): number {
    return 1 - (value / height) * 2;
}

export class ModuleTransformerMeshGradientToCanvasWebGL
    implements IGradientTransformerModule<IWebGLPaintResult> {
    public readonly target = "canvas-webgl";
    public readonly gradientType = "mesh-gradient";

    public to(input: GradientLike): IWebGLPaintResult {
        if (!(input instanceof MeshGradient)) {
            throw new Error("Expected MeshGradient");
        }

        const gradient = input;

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
                const program = createProgram(gl, vertexSource, fragmentSource);
                const vertexMap = buildMeshVertexMap(gradient, width, height);
                const grid = buildRegularMeshGrid(gradient, vertexMap);
                const subdivisions = gradient.config.method === "bicubic"
                    ? BICUBIC_SUBDIVISIONS
                    : 1;
                const edgeTriangles = buildMeshEdgeSkirtTriangles(
                    gradient,
                    grid,
                    width,
                    height,
                    subdivisions,
                );
                const positions: number[] = [];
                const colors: number[] = [];

                for (const patch of gradient.patches) {
                    const triangles = buildPatchTriangles(
                        gradient,
                        grid,
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
