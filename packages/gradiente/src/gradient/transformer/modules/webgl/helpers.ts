import { converter } from "culori";
import type { GradientStop } from "../../../kind/base";
import {
    fitRenderableStopsToLimit,
    getRenderableColorStopCount,
    type GradientRenderableColorStop,
} from "../helpers";

const toRgb = converter("rgb");

export function createWebGLShader(
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

export function createWebGLProgram(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string,
): WebGLProgram {
    const vertexShader = createWebGLShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createWebGLShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentSource,
    );
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

export function toWebGLColor(input: string): [number, number, number, number] {
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

export function getWebGLSampleCount(
    stops: GradientStop[],
    maxStops: number,
): number {
    const colorStopCount = getRenderableColorStopCount(stops);
    const segmentCount = Math.max(1, colorStopCount - 1);

    return Math.max(2, Math.floor((maxStops - 1) / segmentCount));
}

export function fitStopsToWebGLLimit(
    stops: GradientStop[],
    maxStops: number,
): GradientRenderableColorStop[] {
    return fitRenderableStopsToLimit(stops, maxStops);
}
