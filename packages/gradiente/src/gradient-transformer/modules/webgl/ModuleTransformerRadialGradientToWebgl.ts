import { converter, interpolate, formatRgb } from "culori";
import type {
    GradientBase,
    GradientStop,
    RadialGradient,
    GradientPosition,
    RadialGradientSize,
    GradientLengthPercentage,
} from "../../../gradients";
import type { IGradientTransformerModule } from "../types";
import { expandRepeatingStopsTo, getMaxVisibleRadialT, resolveRenderableGradientStops } from "../helpers";
import type { IWebGLPaintResult } from "./types";

const toRgb = converter("rgb");

const MAX_STOPS = 128;
const MAX_REPEATING_RADIAL_T = 16;

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
    gradient: RadialGradient,
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

function parseLengthPercentage(
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
            `Unsupported gradient length unit for WebGL radial gradient: ${value.unit}`,
        );
    }

    const _exhaustive: never = value;
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

function resolveRadialCenter(
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
            x: parseLengthPercentage(position.x, width),
            y: parseLengthPercentage(position.y, height),
        };
    }

    return {
        x: width / 2,
        y: height / 2,
    };
}

function getDistanceToSide(
    center: { x: number; y: number },
    width: number,
    height: number,
    side: "left" | "right" | "top" | "bottom",
): number {
    if (side === "left") return center.x;
    if (side === "right") return width - center.x;
    if (side === "top") return center.y;

    return height - center.y;
}

function getDistanceToCorner(
    center: { x: number; y: number },
    corner: { x: number; y: number },
): number {
    const dx = corner.x - center.x;
    const dy = corner.y - center.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function normalizeStops(
    stops: GradientStop[],
    min: number,
    max: number,
): GradientStop[] {
    const range = max - min || 1;

    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .map((stop) => ({
            ...stop,
            position: (stop.position - min) / range,
        }));
}


function getCornerDeltas(
    center: { x: number; y: number },
    width: number,
    height: number,
): Array<{ dx: number; dy: number }> {
    return [
        { dx: -center.x, dy: -center.y },
        { dx: width - center.x, dy: -center.y },
        { dx: -center.x, dy: height - center.y },
        { dx: width - center.x, dy: height - center.y },
    ];
}

function scaleEllipseRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): { x: number; y: number } {
    const safeRadiusX = Math.max(radiusX, 0.0001);
    const safeRadiusY = Math.max(radiusY, 0.0001);

    const scale = Math.sqrt(
        (dx * dx) / (safeRadiusX * safeRadiusX) +
        (dy * dy) / (safeRadiusY * safeRadiusY),
    );

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

function resolveRadialRadii(
    size: RadialGradientSize,
    shape: "circle" | "ellipse",
    center: { x: number; y: number },
    width: number,
    height: number,
): { x: number; y: number } {
    if (size.kind === "explicit") {
        const radiusX = parseLengthPercentage(size.x, width);
        const radiusY = size.y
            ? parseLengthPercentage(size.y, height)
            : radiusX;

        return {
            x: Math.max(radiusX, 0.0001),
            y: Math.max(shape === "circle" ? radiusX : radiusY, 0.0001),
        };
    }

    const left = getDistanceToSide(center, width, height, "left");
    const right = getDistanceToSide(center, width, height, "right");
    const top = getDistanceToSide(center, width, height, "top");
    const bottom = getDistanceToSide(center, width, height, "bottom");

    if (shape === "circle") {
        const corners = [
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: 0, y: height },
            { x: width, y: height },
        ];

        const cornerDistances = corners.map((corner) =>
            getDistanceToCorner(center, corner),
        );

        if (size.value === "closest-side") {
            const radius = Math.max(Math.min(left, right, top, bottom), 0.0001);
            return { x: radius, y: radius };
        }

        if (size.value === "farthest-side") {
            const radius = Math.max(Math.max(left, right, top, bottom), 0.0001);
            return { x: radius, y: radius };
        }

        if (size.value === "closest-corner") {
            const radius = Math.max(Math.min(...cornerDistances), 0.0001);
            return { x: radius, y: radius };
        }

        const radius = Math.max(Math.max(...cornerDistances), 0.0001);
        return { x: radius, y: radius };
    }

    const closestSideRadiusX = Math.min(left, right);
    const closestSideRadiusY = Math.min(top, bottom);

    const farthestSideRadiusX = Math.max(left, right);
    const farthestSideRadiusY = Math.max(top, bottom);

    if (size.value === "closest-side") {
        return {
            x: Math.max(closestSideRadiusX, 0.0001),
            y: Math.max(closestSideRadiusY, 0.0001),
        };
    }

    if (size.value === "farthest-side") {
        return {
            x: Math.max(farthestSideRadiusX, 0.0001),
            y: Math.max(farthestSideRadiusY, 0.0001),
        };
    }

    const corners = getCornerDeltas(center, width, height);

    if (size.value === "closest-corner") {
        const scaledRadii = corners.map((corner) =>
            scaleEllipseRadiiToCorner(
                closestSideRadiusX,
                closestSideRadiusY,
                corner.dx,
                corner.dy,
            ),
        );

        return scaledRadii.reduce((closest, current) => {
            const closestArea = closest.x * closest.y;
            const currentArea = current.x * current.y;

            return currentArea < closestArea ? current : closest;
        });
    }

    const scaledRadii = corners.map((corner) =>
        scaleEllipseRadiiToCorner(
            farthestSideRadiusX,
            farthestSideRadiusY,
            corner.dx,
            corner.dy,
        ),
    );

    return scaledRadii.reduce((farthest, current) => {
        const farthestArea = farthest.x * farthest.y;
        const currentArea = current.x * current.y;

        return currentArea > farthestArea ? current : farthest;
    });
}

export class ModuleTransformerRadialGradientToCanvasWebGL
    implements IGradientTransformerModule<IWebGLPaintResult> {
    public readonly target = "canvas-webgl";
    public readonly gradientType = "radial-gradient";

    public to(input: GradientBase<any>): IWebGLPaintResult {
        const gradient = input as RadialGradient;

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

                    uniform vec2 u_center;
                    uniform vec2 u_radius;
                    uniform int u_stopCount;
                    uniform float u_positions[${MAX_STOPS}];
                    uniform vec4 u_colors[${MAX_STOPS}];
                    uniform float u_tMax;

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
                        vec2 normalized = delta / max(u_radius, vec2(0.00001));
                        float t = length(normalized);

                        t = clamp(t, 0.0, u_tMax);
                        t = t / max(u_tMax, 0.00001);

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

                const center = resolveRadialCenter(
                    gradient.config.position,
                    width,
                    height,
                );

                const radius = resolveRadialRadii(
                    gradient.config.size,
                    gradient.config.shape,
                    center,
                    width,
                    height,
                );
                const maxVisibleT = getMaxVisibleRadialT(
                    center,
                    radius,
                    width,
                    height,
                );

                const sampleCount = getWebGLSampleCount(gradient, MAX_STOPS);

                const baseStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );

                const repeatMaxT = Math.min(maxVisibleT, MAX_REPEATING_RADIAL_T);
                const maxT = gradient.isRepeating ? repeatMaxT : 1;

                const renderStops = gradient.isRepeating
                    ? expandRepeatingStopsTo(baseStops, 0, repeatMaxT)
                    : baseStops;

                const normalizedStops = gradient.isRepeating
                    ? normalizeStops(renderStops, 0, repeatMaxT)
                    : renderStops;

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
                    gl.getUniformLocation(program, "u_center"),
                    center.x / width,
                    1 - center.y / height,
                );

                gl.uniform2f(
                    gl.getUniformLocation(program, "u_radius"),
                    radius.x / width,
                    radius.y / height,
                );

                gl.uniform1f(
                    gl.getUniformLocation(program, "u_tMax"),
                    maxT,
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