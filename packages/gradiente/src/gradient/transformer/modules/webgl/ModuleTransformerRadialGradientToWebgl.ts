import { GradientRadial } from "../../../kind/radial";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    expandRepeatingStopsTo,
    getMaxVisibleRadialT,
    normalizeRenderableStops,
    resolveGradientPosition,
    resolveRadialRadii,
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

const MAX_REPEATING_RADIAL_T = 16;

export class ModuleTransformerRadialGradientToCanvasWebGL
extends GradientTransformerModule<GradientRadial, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "radial-gradient",
            gradientClass: GradientRadial,
            expectedName: "GradientRadial",
        });
    }

    protected transform(gradient: GradientRadial): IWebGLPaintResult {
        return {
            draw: (canvas, width, height) => {
                const config = gradient.getConfig();
                const isRepeating = gradient.isRepeating();
                const gl = prepareWebGLCanvas(canvas, width, height);

                const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform vec2 u_radius;
                    uniform float u_tMax;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 delta = v_uv - u_center;
                        vec2 normalized = delta / max(u_radius, vec2(0.00001));
                        float t = length(normalized);

                        t = clamp(t, 0.0, u_tMax);
                        t = t / max(u_tMax, 0.00001);

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

                const center = resolveGradientPosition(
                    config.position,
                    width,
                    height,
                    {
                        context: "WebGL radial gradient",
                    },
                );

                const radius = resolveRadialRadii(
                    config.size,
                    config.shape,
                    center,
                    width,
                    height,
                    {
                        context: "WebGL radial gradient",
                    },
                );
                const maxVisibleT = getMaxVisibleRadialT(
                    center,
                    radius,
                    width,
                    height,
                );

                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    WEBGL_MAX_STOPS,
                );

                const baseStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );

                const repeatMaxT = Math.min(maxVisibleT, MAX_REPEATING_RADIAL_T);
                const maxT = isRepeating ? repeatMaxT : 1;

                const renderStops = isRepeating
                    ? expandRepeatingStopsTo(baseStops, 0, repeatMaxT)
                    : baseStops;

                const normalizedStops = isRepeating
                    ? normalizeRenderableStops(renderStops, 0, repeatMaxT)
                    : renderStops;

                const limitedStops = fitStopsToWebGLLimit(
                    normalizedStops,
                    WEBGL_MAX_STOPS,
                );

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
