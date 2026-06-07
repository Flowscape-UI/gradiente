import type { GradientStop } from "../../../kind/base";
import { GradientConic } from "../../../kind/conic";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ICanvasPaintResult } from "../types";
import {
    clamp01,
    getRenderableColorStops,
    mixRgbaByteColor,
    parseColorToRgbaByte,
    resolveAngleToRadians,
    resolveGradientPosition,
    resolveRenderableGradientStops,
    type RgbaByteColor,
} from "../helpers";


const CONIC_GRADIENT_SAMPLE_COUNT = 128;

type ConicColorStop = {
    position: number;
    color: RgbaByteColor;
};

export class ModuleTransformerConicGradientToCanvas
extends GradientTransformerModule<GradientConic, ICanvasPaintResult> {
    constructor() {
        super({
            target: "canvas-2d",
            gradientType: "conic-gradient",
            gradientClass: GradientConic,
            expectedName: "GradientConic",
        });
    }

    protected transform(gradient: GradientConic): ICanvasPaintResult {
        return {
            draw: (ctx, width, height) => {
                const config = gradient.getConfig();
                const imageData = ctx.createImageData(width, height);
                const data = imageData.data;

                const { x: cx, y: cy } = resolveGradientPosition(
                    config.position,
                    width,
                    height,
                    {
                        context: "Canvas conic gradient",
                        allowUnsupportedUnitAsRaw: true,
                    },
                );

                const from = resolveAngleToRadians(config.from);

                const renderStops = resolveRenderableGradientStops(
                    gradient,
                    CONIC_GRADIENT_SAMPLE_COUNT,
                );

                const stops = this._normalizeStops(renderStops);

                if (stops.length === 0) {
                    ctx.putImageData(imageData, 0, 0);
                    return;
                }

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const dx = x - cx;
                        const dy = y - cy;

                        // CSS conic: 0deg = top, clockwise
                        let angle = Math.atan2(dy, dx) + Math.PI / 2 - from;

                        while (angle < 0) {
                            angle += Math.PI * 2;
                        }

                        while (angle >= Math.PI * 2) {
                            angle -= Math.PI * 2;
                        }

                        const t = angle / (Math.PI * 2);
                        const color = this._sampleColor(stops, t);

                        const index = (y * width + x) * 4;
                        data[index] = color.r;
                        data[index + 1] = color.g;
                        data[index + 2] = color.b;
                        data[index + 3] = color.a;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            },
        };
    }

    private _normalizeStops(stops: GradientStop[]): ConicColorStop[] {
        const colorStops = getRenderableColorStops(stops)
            .map((stop) => ({
                position: clamp01(stop.position),
                color: parseColorToRgbaByte(stop.value),
            }))
            .sort((a, b) => a.position - b.position);

        return colorStops;
    }

    private _sampleColor(stops: ConicColorStop[], t: number): RgbaByteColor {
        if (stops.length === 1) {
            return stops[0].color;
        }

        const first = stops[0];
        const extended = [...stops, { ...first, position: first.position + 1 }];

        let sampleT = t;

        if (sampleT < first.position) {
            sampleT += 1;
        }

        for (let i = 0; i < extended.length - 1; i++) {
            const left = extended[i];
            const right = extended[i + 1];

            if (sampleT >= left.position && sampleT <= right.position) {
                const span = right.position - left.position || 1;
                const localT = (sampleT - left.position) / span;

                return mixRgbaByteColor(left.color, right.color, localT);
            }
        }

        return stops[stops.length - 1].color;
    }
}
