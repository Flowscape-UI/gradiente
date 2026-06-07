/**
 * RU: Максимальное число color stops, которое WebGL shader принимает через uniforms.
 * EN: Maximum number of color stops accepted by the WebGL shader via uniforms.
 */
export const WEBGL_MAX_STOPS = 128;

/**
 * RU: Общая точность fragment shader для WebGL 1.
 * EN: Shared fragment shader precision for WebGL 1.
 */
export const WEBGL_FRAGMENT_PRECISION = "precision mediump float;";

/**
 * RU: Общий vertex shader для fullscreen quad.
 * EN: Shared vertex shader for a fullscreen quad.
 */
export const WEBGL_FULLSCREEN_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * RU: Генерирует GLSL-функцию выборки цвета из stop uniforms.
 * EN: Generates the GLSL function that samples color from stop uniforms.
 */
export function createWebGLColorStopsShader(maxStops = WEBGL_MAX_STOPS): string {
    return `
uniform int u_stopCount;
uniform float u_positions[${maxStops}];
uniform vec4 u_colors[${maxStops}];

vec4 getGradientColor(float t) {
    vec4 result = u_colors[0];

    for (int i = 0; i < ${maxStops - 1}; i++) {
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
`;
}
