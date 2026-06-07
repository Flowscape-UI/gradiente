import { WEBGL_FRAGMENT_PRECISION } from "./common";

/**
 * RU: Vertex shader для mesh-gradient с цветом на каждой вершине.
 * EN: Vertex shader for mesh-gradient with per-vertex color.
 */
export const WEBGL_MESH_VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * RU: Fragment shader, который выводит интерполированный vertex color.
 * EN: Fragment shader that outputs the interpolated vertex color.
 */
export const WEBGL_MESH_FRAGMENT_SHADER = `
${WEBGL_FRAGMENT_PRECISION}
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
`;
