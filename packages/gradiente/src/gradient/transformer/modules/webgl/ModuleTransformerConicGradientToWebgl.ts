import { GradientConic } from "../../../kind/conic";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    resolveAngleToRadians,
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

export class ModuleTransformerConicGradientToCanvasWebGL
extends GradientTransformerModule<GradientConic, IWebGLPaintResult> {
    constructor() {
        super({
            target: "canvas-webgl",
            gradientType: "conic-gradient",
            gradientClass: GradientConic,
            expectedName: "GradientConic",
        });
    }

    protected transform(gradient: GradientConic): IWebGLPaintResult {
        return {
            draw: (canvas, width, height) => {
                const config = gradient.getConfig();
                const gl = prepareWebGLCanvas(canvas, width, height);

                const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    const float PI = 3.141592653589793;
                    const float TWO_PI = 6.283185307179586;

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform float u_startAngle;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 delta = v_uv - u_center;

                        float angle = atan(delta.y, delta.x);
                        float cssAngle = mod((PI * 0.5) - angle + TWO_PI, TWO_PI);

                        float t = mod(cssAngle - u_startAngle + TWO_PI, TWO_PI) / TWO_PI;

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
                        context: "WebGL conic gradient",
                    },
                );

                const sampleCount = getWebGLSampleCount(
                    gradient.getStops(),
                    WEBGL_MAX_STOPS,
                );

                const renderStops = resolveRenderableGradientStops(
                    gradient,
                    sampleCount,
                );

                const limitedStops = fitStopsToWebGLLimit(
                    renderStops,
                    WEBGL_MAX_STOPS,
                );

                gl.uniform2f(
                    gl.getUniformLocation(program, "u_center"),
                    center.x / width,
                    1 - center.y / height,
                );

                gl.uniform1f(
                    gl.getUniformLocation(program, "u_startAngle"),
                    resolveAngleToRadians(config.from),
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
