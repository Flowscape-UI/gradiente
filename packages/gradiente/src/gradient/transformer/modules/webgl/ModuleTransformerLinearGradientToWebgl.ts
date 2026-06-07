import type { GradientStop } from "../../../kind/base";
import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    getRenderableColorStops,
    normalizeRenderableStops,
    resolveRenderableGradientStops,
} from "../helpers";
import {
    createWebGLProgram,
    fitStopsToWebGLLimit,
    getWebGLSampleCount,
    toWebGLColor,
} from "./helpers";
import type { IWebGLPaintResult } from "./types";

const MAX_STOPS = 128;

function getStopRange(stops: GradientStop[]) {
    const colorStops = getRenderableColorStops(stops);

    if (!colorStops.length) {
        return { min: 0, max: 1, stops: [] };
    }

    const min = Math.min(...colorStops.map((stop) => stop.position));
    const max = Math.max(...colorStops.map((stop) => stop.position));

    return { min, max, stops: colorStops };
}

export class ModuleTransformerLinearGradientToCanvasWebGL
extends GradientTransformerModule<GradientLinear, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "linear-gradient",
            gradientClass: GradientLinear,
            expectedName: "GradientLinear",
        });
    }

    protected transform(gradient: GradientLinear): IWebGLPaintResult {
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
                    varying vec2 v_uv;

                    void main() {
                        v_uv = a_position * 0.5 + 0.5;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                    }
                `;

                const fragmentSource = `
                    precision mediump float;

                    varying vec2 v_uv;

                    uniform vec2 u_start;
                    uniform vec2 u_end;
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
                        vec2 axis = u_end - u_start;
                        vec2 point = v_uv;

                        float axisLengthSquared = dot(axis, axis);
                        float t = dot(point - u_start, axis) / axisLengthSquared;

                        t = clamp(t, 0.0, 1.0);

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

                const positionLocation = gl.getAttribLocation(program, "a_position");

                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                const angle = gradient.getConfig().angle;

                const dirX = Math.sin(angle);
                const dirY = -Math.cos(angle);

                const centerX = width / 2;
                const centerY = height / 2;

                const lineLength =
                    Math.abs(width * dirX) +
                    Math.abs(height * dirY);

                let startX = centerX - (dirX * lineLength) / 2;
                let startY = centerY - (dirY * lineLength) / 2;
                let endX = centerX + (dirX * lineLength) / 2;
                let endY = centerY + (dirY * lineLength) / 2;

                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    MAX_STOPS,
                );
                const renderStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );
                const { min, max, stops } = getStopRange(renderStops);

                let normalizedStops = stops;

                if (min < 0 || max > 1) {
                    const vx = endX - startX;
                    const vy = endY - startY;

                    const baseStartX = startX;
                    const baseStartY = startY;

                    startX = baseStartX + vx * min;
                    startY = baseStartY + vy * min;
                    endX = baseStartX + vx * max;
                    endY = baseStartY + vy * max;

                    normalizedStops = normalizeRenderableStops(stops, min, max);
                }

                const startU = startX / width;
                const startV = 1 - startY / height;
                const endU = endX / width;
                const endV = 1 - endY / height;

                const limitedStops = fitStopsToWebGLLimit(
                    normalizedStops,
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
                    gl.getUniformLocation(program, "u_start"),
                    startU,
                    startV,
                );

                gl.uniform2f(
                    gl.getUniformLocation(program, "u_end"),
                    endU,
                    endV,
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
