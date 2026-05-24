import {
    LinearGradient,
    type GradientLike,
} from "../../../gradients";
import type { ISvgGradientResult, IGradientTransformerModule } from "../types";
import {
    buildSvgGradientResult,
    buildSvgStops,
    formatPoint,
} from "./helpers";

const DEFAULT_ID = "gradiente-linear-gradient";

function getLinearVector(angle: number): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
} {
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const scale = Math.max(Math.abs(dx), Math.abs(dy), 0.0001);
    const unitX = dx / scale;
    const unitY = dy / scale;

    return {
        x1: 50 - unitX * 50,
        y1: 50 - unitY * 50,
        x2: 50 + unitX * 50,
        y2: 50 + unitY * 50,
    };
}

export class ModuleTransformerLinearGradientToSvg
    implements IGradientTransformerModule<ISvgGradientResult> {
    public readonly target = "svg";
    public readonly gradientType = "linear-gradient";

    public to(input: GradientLike): ISvgGradientResult {
        if (!(input instanceof LinearGradient)) {
            throw new Error("Expected LinearGradient");
        }

        const id = DEFAULT_ID;
        const vector = getLinearVector(input.config.angle);
        const stopsSvg = buildSvgStops(input);
        const gradient = [
            `<linearGradient id="${id}" gradientUnits="objectBoundingBox" x1="${formatPoint(vector.x1)}" y1="${formatPoint(vector.y1)}" x2="${formatPoint(vector.x2)}" y2="${formatPoint(vector.y2)}">`,
            stopsSvg,
            "</linearGradient>",
        ].join("");

        return buildSvgGradientResult({
            id,
            type: "linearGradient",
            gradient,
        });
    }
}
