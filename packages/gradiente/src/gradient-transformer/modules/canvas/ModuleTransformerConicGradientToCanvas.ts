import { converter } from "culori";
import type {
    ConicGradient,
    GradientAngleValue,
    GradientBase,
    GradientLengthPercentage,
    GradientPosition,
    GradientStop,
} from "../../../gradients";
import { degToRad, gradToRad, turnToRad } from "../../../utils";
import type { ICanvasPaintResult, IGradientTransformerModule } from "../types";

const toRgb = converter("rgb");

type RgbaColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

type ConicColorStop = {
    position: number;
    color: RgbaColor;
};

export class ModuleTransformerConicGradientToCanvas
    implements IGradientTransformerModule<ICanvasPaintResult> {
    public readonly target = "canvas";
    public readonly gradientType = "conic-gradient";

    public to(input: GradientBase<any>): ICanvasPaintResult {
        const gradient = input as ConicGradient;

        return {
            draw: (ctx, width, height) => {
                const imageData = ctx.createImageData(width, height);
                const data = imageData.data;

                const { x: cx, y: cy } = this._resolvePosition(
                    gradient.config.position,
                    width,
                    height,
                );

                const from = this._toRad(gradient.config.from);
                const stops = this._normalizeStops(gradient.stops);

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

    private _resolvePosition(
        position: GradientPosition,
        width: number,
        height: number,
    ): { x: number; y: number } {
        if (position.kind === "keywords") {
            return {
                x: this._resolveKeywordX(position.x, width),
                y: this._resolveKeywordY(position.y, height),
            };
        }

        return {
            x: this._resolve(position.x, width),
            y: this._resolve(position.y, height),
        };
    }

    private _resolve(value: GradientLengthPercentage, size: number): number {
        if (value.kind === "percent") {
            return (value.value / 100) * size;
        }

        if (value.unit === "px") {
            return value.value;
        }

        return value.value;
    }

    private _resolveKeywordX(value: "left" | "center" | "right", width: number): number {
        if (value === "left") return 0;
        if (value === "right") return width;
        return width / 2;
    }

    private _resolveKeywordY(value: "top" | "center" | "bottom", height: number): number {
        if (value === "top") return 0;
        if (value === "bottom") return height;
        return height / 2;
    }

    private _toRad(angle: GradientAngleValue): number {
        if (angle.unit === "deg") return degToRad(angle.value);
        if (angle.unit === "turn") return turnToRad(angle.value);
        if (angle.unit === "grad") return gradToRad(angle.value);
        return angle.value;
    }

    private _normalizeStops(stops: GradientStop[]): ConicColorStop[] {
        const colorStops = stops
            .filter(
                (stop): stop is Extract<GradientStop, { type: "color-stop" }> =>
                    stop.type === "color-stop" && stop.position != null,
            )
            .map((stop: GradientStop) => ({
                position: this._clamp01(stop.position),
                color: this._parseColor(stop.value),
            }))
            .sort((a, b) => a.position - b.position);

        return colorStops;
    }

    private _sampleColor(stops: ConicColorStop[], t: number): RgbaColor {
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

                return this._mixColor(left.color, right.color, localT);
            }
        }

        return stops[stops.length - 1].color;
    }

    private _mixColor(from: RgbaColor, to: RgbaColor, t: number): RgbaColor {
        return {
            r: Math.round(from.r + (to.r - from.r) * t),
            g: Math.round(from.g + (to.g - from.g) * t),
            b: Math.round(from.b + (to.b - from.b) * t),
            a: Math.round(from.a + (to.a - from.a) * t),
        };
    }

    private _parseColor(input: string): RgbaColor {
        const color = toRgb(input);

        if (!color) {
            throw new Error(`Failed to convert color: ${input}`);
        }

        return {
            r: Math.round((color.r ?? 0) * 255),
            g: Math.round((color.g ?? 0) * 255),
            b: Math.round((color.b ?? 0) * 255),
            a: Math.round((color.alpha ?? 1) * 255),
        };
    }

    private _clamp01(value: number): number {
        return Math.max(0, Math.min(1, value));
    }
}