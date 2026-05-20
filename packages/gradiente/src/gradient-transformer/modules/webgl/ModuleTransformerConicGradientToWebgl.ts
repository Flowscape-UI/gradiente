import { converter, interpolate, formatRgb } from "culori";
import type {
    ConicGradient,
    GradientBase,
    GradientLengthPercentage,
    GradientPosition,
    GradientStop,
} from "../../../gradients";
import type { IGradientTransformerModule } from "../types";
import { resolveRenderableGradientStops } from "../helpers";
import type { IWebGLPaintResult } from "./types";

const toRgb = converter("rgb");

const MAX_STOPS = 128;
const TWO_PI = Math.PI * 2;

function toWebGLColor(input: string): [number, number, number, number] {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    return [
        color.r ?? 0,
        color.g ?? 0,
        color.b ?? 0,
        color.alpha ?? 1,
    ];
}

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

function getColorStopCount(stops: GradientStop[]): number {
    return stops.filter((stop) => stop.type === "color-stop").length;
}

function getWebGLSampleCount(
    gradient: ConicGradient,
    maxStops: number,
): number {
    const colorStopCount = getColorStopCount(gradient.stops);
    const segmentCount = Math.max(1, colorStopCount - 1);

    return Math.max(2, Math.floor((maxStops - 1) / segmentCount));
}

function getColorAtPosition(
    stops: GradientStop[],
    position: number,
): string {
    const colorStops = stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);

    if (colorStops.length === 0) {
        throw new Error("Cannot sample color from empty gradient stops.");
    }

    if (position <= colorStops[0].position) {
        return colorStops[0].value;
    }

    const lastStop = colorStops[colorStops.length - 1];

    if (position >= lastStop.position) {
        return lastStop.value;
    }

    for (let index = 0; index < colorStops.length - 1; index += 1) {
        const current = colorStops[index];
        const next = colorStops[index + 1];

        if (position >= current.position && position <= next.position) {
            const range = next.position - current.position || 1;
            const localT = (position - current.position) / range;

            const colorInterpolator = interpolate(
                [current.value, next.value],
                "rgb",
            );

            return formatRgb(colorInterpolator(localT));
        }
    }

    return lastStop.value;
}

function fitStopsToWebGLLimit(
    stops: GradientStop[],
    maxStops: number,
): GradientStop[] {
    const colorStops = stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);

    if (colorStops.length <= maxStops) {
        return colorStops;
    }

    const sampledStops: GradientStop[] = [];

    for (let index = 0; index < maxStops; index += 1) {
        const position = index / (maxStops - 1);

        sampledStops.push({
            type: "color-stop",
            value: getColorAtPosition(colorStops, position),
            position,
        });
    }

    return sampledStops;
}

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

function resolveAngleToRadians(angle: ConicGradient["config"]["from"]): number {
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
    implements IGradientTransformerModule<IWebGLPaintResult> {
    public readonly target = "canvas-webgl";
    public readonly gradientType = "conic-gradient";

    public to(input: GradientBase<any>): IWebGLPaintResult {
        const gradient = input as ConicGradient;

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

                const program = createProgram(gl, vertexSource, fragmentSource);
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
                    gradient.config.position,
                    width,
                    height,
                );

                const sampleCount = getWebGLSampleCount(gradient, MAX_STOPS);

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
                    resolveAngleToRadians(gradient.config.from),
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