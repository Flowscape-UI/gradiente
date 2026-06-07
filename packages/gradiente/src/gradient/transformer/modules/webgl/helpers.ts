import type { GradientStop } from "../../../kind/base";
import {
    fitRenderableStopsToLimit,
    getRenderableColorStopCount,
    parseColorToRgbaByte,
    type GradientRenderableColorStop,
} from "../helpers";

/**
 * RU: Создает и компилирует WebGL shader с подробной ошибкой компиляции.
 * EN: Creates and compiles a WebGL shader with a detailed compile error.
 */
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

/**
 * RU: Создает WebGL program из vertex/fragment shader source.
 * EN: Creates a WebGL program from vertex/fragment shader source.
 */
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

/**
 * RU: Преобразует CSS-цвет в WebGL vec4 с каналами 0..1.
 * EN: Converts a CSS color into a WebGL vec4 with 0..1 channels.
 */
export function toWebGLColor(input: string): [number, number, number, number] {
    const color = parseColorToRgbaByte(input);

    return [
        color.r / 255,
        color.g / 255,
        color.b / 255,
        color.a / 255,
    ];
}

/**
 * RU: Подбирает количество samples на segment так, чтобы уложиться в лимит uniforms.
 * EN: Picks per-segment sample count so the result fits the uniform limit.
 */
export function getWebGLSampleCount(
    stops: GradientStop[],
    maxStops: number,
): number {
    const colorStopCount = getRenderableColorStopCount(stops);
    const segmentCount = Math.max(1, colorStopCount - 1);

    return Math.max(2, Math.floor((maxStops - 1) / segmentCount));
}

/**
 * RU: Уменьшает stops до WebGL-лимита, пересэмплируя цвета при необходимости.
 * EN: Fits stops to the WebGL limit by resampling colors when necessary.
 */
export function fitStopsToWebGLLimit(
    stops: GradientStop[],
    maxStops: number,
): GradientRenderableColorStop[] {
    return fitRenderableStopsToLimit(stops, maxStops);
}
