import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ISvgGradientResult } from "../types";
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
extends GradientTransformerModule<GradientLinear, ISvgGradientResult> {
    constructor() {
        super({
            target: "svg",
            gradientType: "linear-gradient",
            gradientClass: GradientLinear,
            expectedName: "GradientLinear",
        });
    }

    protected transform(gradientValue: GradientLinear): ISvgGradientResult {
        const id = DEFAULT_ID;
        const vector = getLinearVector(gradientValue.getConfig().angle);
        const stopsSvg = buildSvgStops(gradientValue);
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
