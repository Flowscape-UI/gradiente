import {
    ConicGradient,
    type GradientAngleValue,
    type GradientLengthPercentage,
    type GradientLike,
    type GradientPosition,
} from "../../../gradients";
import { degToRad, gradToRad, turnToRad } from "../../../utils";
import { resolveRenderableGradientStops } from "../helpers";
import type { ISvgGradientResult, IGradientTransformerModule } from "../types";
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

function resolveKeywordX(value: "left" | "center" | "right", size: number): number {
    if (value === "left") return 0;
    if (value === "right") return size;

    return size / 2;
}

function resolveKeywordY(value: "top" | "center" | "bottom", size: number): number {
    if (value === "top") return 0;
    if (value === "bottom") return size;

    return size / 2;
}

function resolveLengthPercentage(
    value: GradientLengthPercentage,
    size: number,
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * size;
    }

    if (value.unit === "px") {
        return value.value;
    }

    return value.value;
}

function resolveCenter(
    position: GradientPosition,
    size: number,
): { x: number; y: number } {
    if (position.kind === "keywords") {
        return {
            x: resolveKeywordX(position.x, size),
            y: resolveKeywordY(position.y, size),
        };
    }

    return {
        x: resolveLengthPercentage(position.x, size),
        y: resolveLengthPercentage(position.y, size),
    };
}

function resolveAngleToRadians(angle: GradientAngleValue): number {
    if (angle.unit === "deg") return degToRad(angle.value);
    if (angle.unit === "turn") return turnToRad(angle.value);
    if (angle.unit === "grad") return gradToRad(angle.value);

    return angle.value;
}

function getDistance(
    from: { x: number; y: number },
    to: { x: number; y: number },
): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function getCoverRadius(center: { x: number; y: number }): number {
    const corners = [
        { x: 0, y: 0 },
        { x: VIEW_BOX_SIZE, y: 0 },
        { x: 0, y: VIEW_BOX_SIZE },
        { x: VIEW_BOX_SIZE, y: VIEW_BOX_SIZE },
    ];

    return Math.max(...corners.map((corner) => getDistance(center, corner))) * 1.02;
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

function formatNumber(value: number): string {
    return `${Number(value.toFixed(3))}`;
}

export class ModuleTransformerConicGradientToSvg
    implements IGradientTransformerModule<ISvgGradientResult> {
    public readonly target = "svg";
    public readonly gradientType = "conic-gradient";

    public to(input: GradientLike): ISvgGradientResult {
        if (!(input instanceof ConicGradient)) {
            throw new Error("Expected ConicGradient");
        }

        const id = DEFAULT_ID;
        const center = resolveCenter(input.config.position, VIEW_BOX_SIZE);
        const from = resolveAngleToRadians(input.config.from);
        const stops = resolveRenderableGradientStops(
            input,
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
