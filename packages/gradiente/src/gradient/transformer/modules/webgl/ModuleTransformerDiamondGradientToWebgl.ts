import {
    type GradientLengthPercentage,
    type GradientPosition,
} from "../../../kind/base";
import { GradientDiamond } from "../../../kind/diamond";
import type { GradientRadialSize } from "../../../kind/radial";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    expandRepeatingStopsTo,
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
const MAX_REPEATING_DIAMOND_T = 16;

function parseLengthPercentage(
    value: GradientLengthPercentage,
    reference: number,
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * reference;
    }

    if (value.unit === "px") {
        return value.value;
    }

    throw new Error(
        `Unsupported diamond-gradient length unit for WebGL transformer: ${value.unit}`,
    );
}

function resolveKeywordPositionX(x: string, width: number): number {
    if (x === "left") return 0;
    if (x === "right") return width;

    return width / 2;
}

function resolveKeywordPositionY(y: string, height: number): number {
    if (y === "top") return 0;
    if (y === "bottom") return height;

    return height / 2;
}

function resolveDiamondCenter(
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

    return {
        x: parseLengthPercentage(position.x, width),
        y: parseLengthPercentage(position.y, height),
    };
}

function getDistanceToCorner(
    center: { x: number; y: number },
    corner: { x: number; y: number },
): number {
    return Math.abs(corner.x - center.x) + Math.abs(corner.y - center.y);
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

function scaleDiamondRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): { x: number; y: number } {
    const safeRadiusX = Math.max(radiusX, 0.0001);
    const safeRadiusY = Math.max(radiusY, 0.0001);
    const scale =
        Math.abs(dx) / safeRadiusX + Math.abs(dy) / safeRadiusY;

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

function resolveDiamondRadii(
    size: GradientRadialSize,
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

    const left = center.x;
    const right = width - center.x;
    const top = center.y;
    const bottom = height - center.y;

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
        return corners
            .map((corner) =>
                scaleDiamondRadiiToCorner(
                    closestSideRadiusX,
                    closestSideRadiusY,
                    corner.dx,
                    corner.dy,
                ),
            )
            .reduce((closest, current) =>
                current.x * current.y < closest.x * closest.y
                    ? current
                    : closest,
            );
    }

    return corners
        .map((corner) =>
            scaleDiamondRadiiToCorner(
                farthestSideRadiusX,
                farthestSideRadiusY,
                corner.dx,
                corner.dy,
            ),
        )
        .reduce((farthest, current) =>
            current.x * current.y > farthest.x * farthest.y
                ? current
                : farthest,
        );
}

function getMaxVisibleDiamondT(
    center: { x: number; y: number },
    radii: { x: number; y: number },
    width: number,
    height: number,
): number {
    const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
    ];

    return Math.max(
        ...corners.map((corner) =>
            Math.abs(corner.x - center.x) / Math.max(radii.x, 0.0001) +
            Math.abs(corner.y - center.y) / Math.max(radii.y, 0.0001),
        ),
    );
}

export class ModuleTransformerDiamondGradientToCanvasWebGL
extends GradientTransformerModule<GradientDiamond, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "diamond-gradient",
            gradientClass: GradientDiamond,
            expectedName: "GradientDiamond",
        });
    }

    protected transform(gradient: GradientDiamond): IWebGLPaintResult {
        return {
            draw: (canvas, width, height) => {
                const config = gradient.getConfig();
                const isRepeating = gradient.isRepeating();
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
                        vec2 normalized = abs(delta) / max(u_radius, vec2(0.00001));
                        float t = normalized.x + normalized.y;

                        t = clamp(t, 0.0, u_tMax);
                        t = t / max(u_tMax, 0.00001);

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

                const center = resolveDiamondCenter(
                    config.position,
                    width,
                    height,
                );
                const radius = resolveDiamondRadii(
                    config.size,
                    config.shape,
                    center,
                    width,
                    height,
                );
                const maxVisibleT = getMaxVisibleDiamondT(
                    center,
                    radius,
                    width,
                    height,
                );
                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    MAX_STOPS,
                );
                const baseStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );
                const repeatMaxT = Math.min(maxVisibleT, MAX_REPEATING_DIAMOND_T);
                const maxT = isRepeating ? repeatMaxT : 1;
                const renderStops = isRepeating
                    ? expandRepeatingStopsTo(baseStops, 0, repeatMaxT)
                    : baseStops;
                const normalizedStops = isRepeating
                    ? normalizeRenderableStops(renderStops, 0, repeatMaxT)
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
