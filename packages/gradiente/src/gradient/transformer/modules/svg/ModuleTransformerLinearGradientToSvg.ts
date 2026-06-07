import { GradientLinear } from "../../../kind/linear";
import { GradientTransformerModule } from "../GradientTransformerModule";
import { resolveLinearGradientVector } from "../helpers";
import type { ISvgGradientResult } from "../types";
import {
    buildSvgGradientResult,
    buildSvgStops,
    formatPoint,
} from "./helpers";

const DEFAULT_ID = "gradiente-linear-gradient";

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
        const vector = resolveLinearGradientVector(gradientValue.getConfig().angle);
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
