import type { GradientRenderableColorStop } from "../helpers";
import { toWebGLColor } from "./helpers";
import { WEBGL_MAX_STOPS } from "./glsl";

const WEBGL_FULLSCREEN_TRIANGLES = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
]);

/**
 * RU: Готовит canvas к WebGL-отрисовке и выставляет viewport.
 * EN: Prepares a canvas for WebGL drawing and sets the viewport.
 */
export function prepareWebGLCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
): WebGLRenderingContext {
    const gl = canvas.getContext("webgl");

    if (!gl) {
        throw new Error("WebGL is not supported.");
    }

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    return gl;
}

/**
 * RU: Создает buffer, загружает данные и привязывает attribute к shader program.
 * EN: Creates a buffer, uploads data, and binds an attribute to a shader program.
 */
export function bindWebGLAttribute(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    data: Float32Array,
    size: number,
): WebGLBuffer {
    const buffer = gl.createBuffer();

    if (!buffer) {
        throw new Error(`Failed to create WebGL buffer for attribute "${name}".`);
    }

    const location = gl.getAttribLocation(program, name);

    if (location < 0) {
        throw new Error(`WebGL attribute "${name}" was not found.`);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

    return buffer;
}

/**
 * RU: Привязывает общий fullscreen quad для shader-рендеринга.
 * EN: Binds the shared fullscreen quad used by shader-based rendering.
 */
export function bindWebGLFullscreenQuad(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
): void {
    bindWebGLAttribute(
        gl,
        program,
        "a_position",
        WEBGL_FULLSCREEN_TRIANGLES,
        2,
    );
}

/**
 * RU: Записывает массивы позиций и цветов stops в WebGL uniforms.
 * EN: Writes stop position and color arrays into WebGL uniforms.
 */
export function setWebGLGradientStopUniforms(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    stops: GradientRenderableColorStop[],
    maxStops = WEBGL_MAX_STOPS,
): void {
    const limitedStops = stops.slice(0, maxStops);
    const positions = new Float32Array(maxStops);
    const colors = new Float32Array(maxStops * 4);

    limitedStops.forEach((stop, index) => {
        const color = toWebGLColor(stop.value);

        positions[index] = stop.position;
        colors[index * 4 + 0] = color[0];
        colors[index * 4 + 1] = color[1];
        colors[index * 4 + 2] = color[2];
        colors[index * 4 + 3] = color[3];
    });

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
}

/**
 * RU: Очищает WebGL canvas прозрачным цветом.
 * EN: Clears a WebGL canvas with a transparent color.
 */
export function clearWebGLCanvas(gl: WebGLRenderingContext): void {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * RU: Очищает canvas и рисует заданное количество triangle vertices.
 * EN: Clears the canvas and draws the requested number of triangle vertices.
 */
export function drawWebGLTriangles(
    gl: WebGLRenderingContext,
    vertexCount: number,
): void {
    clearWebGLCanvas(gl);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}
