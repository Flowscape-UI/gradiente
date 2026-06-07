import { GradientDiamond } from "../../../kind/diamond";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    expandRepeatingStopsTo,
    getMaxVisibleDiamondT,
    normalizeRenderableStops,
    resolveDiamondRadii,
    resolveGradientPosition,
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

const MAX_REPEATING_DIAMOND_T = 16;

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
                        vec2 normalized = abs(delta) / max(u_radius, vec2(0.00001));
                        float t = normalized.x + normalized.y;

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
                        context: "WebGL diamond gradient",
                    },
                );
                const radius = resolveDiamondRadii(
                    config.size,
                    config.shape,
                    center,
                    width,
                    height,
                    {
                        context: "WebGL diamond gradient",
                    },
                );
                const maxVisibleT = getMaxVisibleDiamondT(
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
