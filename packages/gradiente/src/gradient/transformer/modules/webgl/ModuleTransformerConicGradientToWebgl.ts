import type {
    GradientAngleValue,
    GradientLengthPercentage,
    GradientPosition,
} from "../../../kind/base";
import { GradientConic } from "../../../kind/conic";
import { GradientTransformerModule } from "../GradientTransformerModule";
import { resolveRenderableGradientStops } from "../helpers";
import {
    createWebGLProgram,
    fitStopsToWebGLLimit,
    getWebGLSampleCount,
    toWebGLColor,
} from "./helpers";
import type { IWebGLPaintResult } from "./types";

const MAX_STOPS = 128;
const TWO_PI = Math.PI * 2;

function resolveLengthPercentage(
    value: GradientLengthPercentage,
    reference: number,
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * reference;
    }

    if (value.kind === "length") {
        if (value.unit === "px") {
            return value.value;
        }

        throw new Error(
            `Unsupported gradient length unit for WebGL conic gradient: ${value.unit}`,
        );
    }

    const _exhaustive: never = value;
    return _exhaustive;
}

function resolveAngleToRadians(angle: GradientAngleValue): number {
    if (angle.unit === "rad") {
        return angle.value;
    }

    if (angle.unit === "deg") {
        return (angle.value / 360) * TWO_PI;
    }

    if (angle.unit === "turn") {
        return angle.value * TWO_PI;
    }

    if (angle.unit === "grad") {
        return (angle.value / 400) * TWO_PI;
    }

    const _exhaustive: never = angle.unit;
    return _exhaustive;
}

function resolveKeywordPositionX(x: string, width: number): number {
    if (x === "left") return 0;
    if (x === "center") return width / 2;
    if (x === "right") return width;

    return width / 2;
}

function resolveKeywordPositionY(y: string, height: number): number {
    if (y === "top") return 0;
    if (y === "center") return height / 2;
    if (y === "bottom") return height;

    return height / 2;
}

function resolveConicCenter(
    position: GradientPosition,
    width: number,
    height: number,
): { x: number; y: number } {
    if (position.kind === "keywords") {
        return {
            x: resolveKeywordPositionX(position.x, width),
            y: resolveKeywordPositionY(position.y, height),
        };
    }

    if (position.kind === "values") {
        return {
            x: resolveLengthPercentage(position.x, width),
            y: resolveLengthPercentage(position.y, height),
        };
    }

    return {
        x: width / 2,
        y: height / 2,
    };
}

export class ModuleTransformerConicGradientToCanvasWebGL
extends GradientTransformerModule<GradientConic, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "conic-gradient",
            gradientClass: GradientConic,
            expectedName: "GradientConic",
        });
    }

    protected transform(gradient: GradientConic): IWebGLPaintResult {
        return {
            draw: (canvas, width, height) => {
                const config = gradient.getConfig();
                const gl = canvas.getContext("webgl");

                if (!gl) {
                    throw new Error("WebGL is not supported.");
                }

                canvas.width = width;
                canvas.height = height;

                gl.viewport(0, 0, width, height);

                const vertexSource = `
                    attribute vec2 a_position;
                    varying vec2 v_uv;

                    void main() {
                        v_uv = a_position * 0.5 + 0.5;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                    }
                `;

                const fragmentSource = `
                    precision mediump float;

                    const float PI = 3.141592653589793;
                    const float TWO_PI = 6.283185307179586;

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform float u_startAngle;
                    uniform int u_stopCount;
                    uniform float u_positions[${MAX_STOPS}];
                    uniform vec4 u_colors[${MAX_STOPS}];

                    vec4 getGradientColor(float t) {
                        vec4 result = u_colors[0];

                        for (int i = 0; i < ${MAX_STOPS - 1}; i++) {
                            if (i >= u_stopCount - 1) {
                                break;
                            }

                            float currentPosition = u_positions[i];
                            float nextPosition = u_positions[i + 1];

                            if (t <= currentPosition) {
                                return u_colors[i];
                            }

                            if (t >= currentPosition && t <= nextPosition) {
                                float localT = (t - currentPosition) / max(nextPosition - currentPosition, 0.00001);
                                return mix(u_colors[i], u_colors[i + 1], localT);
                            }

                            result = u_colors[i + 1];
                        }

                        return result;
                    }

                    void main() {
                        vec2 delta = v_uv - u_center;

                        float angle = atan(delta.y, delta.x);
                        float cssAngle = mod((PI * 0.5) - angle + TWO_PI, TWO_PI);

                        float t = mod(cssAngle - u_startAngle + TWO_PI, TWO_PI) / TWO_PI;

                        gl_FragColor = getGradientColor(t);
                    }
                `;

                const program = createWebGLProgram(
                    gl,
                    vertexSource,
                    fragmentSource,
                );
                gl.useProgram(program);

                const positionBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        -1, -1,
                        1, -1,
                        -1, 1,
                        -1, 1,
                        1, -1,
                        1, 1,
                    ]),
                    gl.STATIC_DRAW,
                );

                const positionLocation = gl.getAttribLocation(
                    program,
                    "a_position",
                );

                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(
                    positionLocation,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0,
                );

                const center = resolveConicCenter(
                    config.position,
                    width,
                    height,
                );

                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    MAX_STOPS,
                );

                const renderStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );

                const limitedStops = fitStopsToWebGLLimit(
                    renderStops,
                    MAX_STOPS,
                );

                const positions = new Float32Array(MAX_STOPS);
                const colors = new Float32Array(MAX_STOPS * 4);

                limitedStops.forEach((stop, index) => {
                    const color = toWebGLColor(stop.value);

                    positions[index] = stop.position;

                    colors[index * 4 + 0] = color[0];
                    colors[index * 4 + 1] = color[1];
                    colors[index * 4 + 2] = color[2];
                    colors[index * 4 + 3] = color[3];
                });

                gl.uniform2f(
                    gl.getUniformLocation(program, "u_center"),
                    center.x / width,
                    1 - center.y / height,
                );

                gl.uniform1f(
                    gl.getUniformLocation(program, "u_startAngle"),
                    resolveAngleToRadians(config.from),
                );

                gl.uniform1i(
                    gl.getUniformLocation(program, "u_stopCount"),
                    limitedStops.length,
                );

                gl.uniform1fv(
                    gl.getUniformLocation(program, "u_positions"),
                    positions,
                );

                gl.uniform4fv(
                    gl.getUniformLocation(program, "u_colors"),
                    colors,
                );

                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            },
        };
    }
}
