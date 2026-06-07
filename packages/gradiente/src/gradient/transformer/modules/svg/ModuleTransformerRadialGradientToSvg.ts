import { GradientRadial } from "../../../kind/radial";
import { GradientTransformerModule } from "../GradientTransformerModule";
import {
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
        const transform = config.shape === "ellipse"
            ? ` gradientTransform="translate(${center.x} ${center.y}) scale(${scaleX} ${scaleY}) translate(${-center.x} ${-center.y})"`
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
