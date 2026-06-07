import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    getRenderableStopRange,
    normalizeRenderableStops,
    resolveLinearGradientLine,
    resolveRenderableGradientStops,
} from "../helpers";
import {
    createWebGLProgram,
    fitStopsToWebGLLimit,
    getWebGLSampleCount,
} from "./helpers";
import {
    createWebGLColorStopsShader,
    WEBGL_FRAGMENT_PRECISION,
    WEBGL_FULLSCREEN_VERTEX_SHADER,
    WEBGL_MAX_STOPS,
} from "./glsl";
import {
    bindWebGLFullscreenQuad,
    drawWebGLTriangles,
    prepareWebGLCanvas,
    setWebGLGradientStopUniforms,
} from "./runtime";
import type { IWebGLPaintResult } from "./types";

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
                const gl = prepareWebGLCanvas(canvas, width, height);

                const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    varying vec2 v_uv;

                    uniform vec2 u_start;
                    uniform vec2 u_end;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

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
                    WEBGL_FULLSCREEN_VERTEX_SHADER,
                    fragmentSource,
                );
                gl.useProgram(program);
                bindWebGLFullscreenQuad(gl, program);

                const angle = gradient.getConfig().angle;
                const line = resolveLinearGradientLine(angle, width, height);
                let startX = line.start.x;
                let startY = line.start.y;
                let endX = line.end.x;
                let endY = line.end.y;

                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    WEBGL_MAX_STOPS,
                );
                const renderStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );
                const { min, max, stops } = getRenderableStopRange(renderStops);

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
                    WEBGL_MAX_STOPS,
                );

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

                setWebGLGradientStopUniforms(
                    gl,
                    program,
                    limitedStops,
                    WEBGL_MAX_STOPS,
                );
                drawWebGLTriangles(gl, 6);
            },
        };
    }
}
