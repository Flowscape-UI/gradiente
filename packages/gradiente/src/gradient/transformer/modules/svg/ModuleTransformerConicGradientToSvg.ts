import { GradientConic } from "../../../kind/conic";
import {
    formatNumber,
    getEuclideanDistance,
    resolveAngleToRadians,
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

const DEFAULT_ID = "gradiente-conic-gradient";
const TWO_PI = Math.PI * 2;
const VIEW_BOX_SIZE = 100;
const CONIC_SEGMENT_COUNT = 720;

function getCoverRadius(center: { x: number; y: number }): number {
    const corners = [
        { x: 0, y: 0 },
        { x: VIEW_BOX_SIZE, y: 0 },
        { x: 0, y: VIEW_BOX_SIZE },
        { x: VIEW_BOX_SIZE, y: VIEW_BOX_SIZE },
    ];

    return Math.max(...corners.map((corner) =>
        getEuclideanDistance(center, corner),
    )) * 1.02;
}

function pointOnConicRay(
    center: { x: number; y: number },
    radius: number,
    angle: number,
): { x: number; y: number } {
    return {
        x: center.x + Math.sin(angle) * radius,
        y: center.y - Math.cos(angle) * radius,
    };
}

export class ModuleTransformerConicGradientToSvg
extends GradientTransformerModule<GradientConic, ISvgGradientResult> {
    constructor() {
        super({
            target: "svg",
            gradientType: "conic-gradient",
            gradientClass: GradientConic,
            expectedName: "GradientConic",
        });
    }

    protected transform(gradientValue: GradientConic): ISvgGradientResult {
        const config = gradientValue.getConfig();
        const id = DEFAULT_ID;
        const center = resolveGradientPosition(
            config.position,
            VIEW_BOX_SIZE,
            VIEW_BOX_SIZE,
            {
                context: "SVG conic gradient",
                allowUnsupportedUnitAsRaw: true,
            },
        );
        const from = resolveAngleToRadians(config.from);
        const stops = resolveRenderableGradientStops(
            gradientValue,
            SVG_GRADIENT_SAMPLE_COUNT,
        );
        const radius = getCoverRadius(center);
        const paths: string[] = [];

        for (let index = 0; index < CONIC_SEGMENT_COUNT; index += 1) {
            const startT = index / CONIC_SEGMENT_COUNT;
            const endT = (index + 1) / CONIC_SEGMENT_COUNT;
            const color = formatSvgColor(
                sampleSvgStops(stops, startT + (endT - startT) / 2),
            );
            const start = pointOnConicRay(center, radius, startT * TWO_PI + from);
            const end = pointOnConicRay(center, radius, endT * TWO_PI + from);

            paths.push(
                [
                    `<path d="M ${formatNumber(center.x)} ${formatNumber(center.y)}`,
                    `L ${formatNumber(start.x)} ${formatNumber(start.y)}`,
                    `A ${formatNumber(radius)} ${formatNumber(radius)} 0 0 1 ${formatNumber(end.x)} ${formatNumber(end.y)}`,
                    `Z" fill="${color}" stroke="${color}" stroke-width="0.25"/>`,
                ].join(" "),
            );
        }

        const vectorSvg = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}">`,
            ...paths,
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
