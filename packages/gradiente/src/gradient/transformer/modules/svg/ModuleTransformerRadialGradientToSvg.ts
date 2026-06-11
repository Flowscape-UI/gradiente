import { GradientRadial } from "../../../kind/radial";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
    formatNumber,
    resolveGradientPosition,
    resolveRadialRadii,
} from "../helpers";
import type { ISvgGradientResult } from "../types";
import {
    buildSvgGradientResult,
    buildSvgStops,
    formatPoint,
} from "./helpers";

const DEFAULT_ID = "gradiente-radial-gradient";

export class ModuleTransformerRadialGradientToSvg
extends GradientTransformerModule<GradientRadial, ISvgGradientResult> {
    constructor() {
        super({
            target: "svg",
            gradientType: "radial-gradient",
            gradientClass: GradientRadial,
            expectedName: "GradientRadial",
        });
    }

    protected transform(gradientValue: GradientRadial): ISvgGradientResult {
        const config = gradientValue.getConfig();
        const id = DEFAULT_ID;
        const center = resolveGradientPosition(
            config.position,
            100,
            100,
            {
                context: "SVG radial gradient",
                allowUnsupportedUnitAsRaw: true,
            },
        );
        const radii = resolveRadialRadii(
            config.size,
            config.shape,
            center,
            100,
            100,
            {
                context: "SVG radial gradient",
                allowUnsupportedUnitAsRaw: true,
            },
        );
        const radius = Math.max(radii.x, radii.y);
        const scaleX = radii.x / radius;
        const scaleY = radii.y / radius;
        const centerX = center.x / 100;
        const centerY = center.y / 100;
        const transform = config.shape === "ellipse"
            ? [
                " gradientTransform=\"",
                `translate(${formatNumber(centerX)} ${formatNumber(centerY)}) `,
                `scale(${formatNumber(scaleX)} ${formatNumber(scaleY)}) `,
                `translate(${formatNumber(-centerX)} ${formatNumber(-centerY)})`,
                "\"",
            ].join("")
            : "";
        const gradient = [
            `<radialGradient id="${id}" gradientUnits="objectBoundingBox" cx="${formatPoint(center.x)}" cy="${formatPoint(center.y)}" r="${formatPoint(radius)}"${transform}>`,
            buildSvgStops(gradientValue),
            "</radialGradient>",
        ].join("");

        return buildSvgGradientResult({
            id,
            type: "radialGradient",
            gradient,
        });
    }
}
