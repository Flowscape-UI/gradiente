import { GradientDiamond } from "../../../kind/diamond";
import {
    getRenderableColorStops,
    expandRepeatingStopsTo,
    formatNumber,
    getMaxVisibleDiamondT,
    resolveDiamondRadii,
    resolveGradientPosition,
    resolveRenderableGradientStops,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ISvgGradientResult } from "../types";
import {
    buildSvgGradientResult,
    encodeSvgDataUrl,
    escapeXml,
    formatSvgColor,
    sampleSvgStops,
    SVG_GRADIENT_SAMPLE_COUNT,
} from "./helpers";

const DEFAULT_ID = "gradiente-diamond-gradient";
const VIEW_BOX_SIZE = 100;

function buildDiamondPolygon(
    center: { x: number; y: number },
    radii: { x: number; y: number },
    position: number,
): string {
    const x = radii.x * position;
    const y = radii.y * position;

    return [
        `${formatNumber(center.x)} ${formatNumber(center.y - y)}`,
        `${formatNumber(center.x + x)} ${formatNumber(center.y)}`,
        `${formatNumber(center.x)} ${formatNumber(center.y + y)}`,
        `${formatNumber(center.x - x)} ${formatNumber(center.y)}`,
    ].join(" ");
}

export class ModuleTransformerDiamondGradientToSvg
extends GradientTransformerModule<GradientDiamond, ISvgGradientResult> {
    constructor() {
        super({
            target: "svg",
            gradientType: "diamond-gradient",
            gradientClass: GradientDiamond,
            expectedName: "GradientDiamond",
        });
    }

    protected transform(gradientValue: GradientDiamond): ISvgGradientResult {
        const config = gradientValue.getConfig();
        const isRepeating = gradientValue.isRepeating();
        const id = DEFAULT_ID;
        const center = resolveGradientPosition(
            config.position,
            VIEW_BOX_SIZE,
            VIEW_BOX_SIZE,
            {
                context: "SVG diamond gradient",
            },
        );
        const radii = resolveDiamondRadii(
            config.size,
            config.shape,
            center,
            VIEW_BOX_SIZE,
            VIEW_BOX_SIZE,
            {
                context: "SVG diamond gradient",
            },
        );
        const maxVisibleT = getMaxVisibleDiamondT(
            center,
            radii,
            VIEW_BOX_SIZE,
            VIEW_BOX_SIZE,
        );
        const maxT = isRepeating ? maxVisibleT : 1;
        const baseStops = resolveRenderableGradientStops(
            gradientValue,
            SVG_GRADIENT_SAMPLE_COUNT,
        );
        const stops = getRenderableColorStops(
            isRepeating
                ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                : baseStops,
        );
        const outerColor = formatSvgColor(sampleSvgStops(stops, maxT));
        const sampleCount = Math.max(
            SVG_GRADIENT_SAMPLE_COUNT,
            Math.ceil(SVG_GRADIENT_SAMPLE_COUNT * maxT),
        );
        const polygons: string[] = [];

        for (let index = sampleCount; index >= 0; index -= 1) {
            const position = (index / sampleCount) * maxT;
            const color = formatSvgColor(sampleSvgStops(stops, position));
            const points = buildDiamondPolygon(center, radii, position);

            polygons.push(`<polygon points="${points}" fill="${color}"/>`);
        }

        const vectorSvg = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
            `<rect width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" fill="${outerColor}"/>`,
            ...polygons,
            "</svg>",
        ].join("");
        const gradient = [
            `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
            `<image width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" href="${escapeXml(encodeSvgDataUrl(vectorSvg))}"/>`,
            "</pattern>",
        ].join("");

        return buildSvgGradientResult({
            id,
            type: "pattern",
            gradient,
        });
    }
}
