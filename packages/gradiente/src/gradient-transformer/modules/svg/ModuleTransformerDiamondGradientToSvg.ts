import {
    DiamondGradient,
    type GradientLengthPercentage,
    type GradientLike,
    type GradientPosition,
    type GradientStop,
    type RadialGradientSize,
} from "../../../gradients";
import { expandRepeatingStopsTo, resolveRenderableGradientStops } from "../helpers";
import type { ISvgGradientResult, IGradientTransformerModule } from "../types";
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

function resolveKeywordX(value: "left" | "center" | "right"): number {
    if (value === "left") return 0;
    if (value === "right") return VIEW_BOX_SIZE;

    return VIEW_BOX_SIZE / 2;
}

function resolveKeywordY(value: "top" | "center" | "bottom"): number {
    if (value === "top") return 0;
    if (value === "bottom") return VIEW_BOX_SIZE;

    return VIEW_BOX_SIZE / 2;
}

function resolveLengthPercentage(value: GradientLengthPercentage): number {
    if (value.kind === "percent") {
        return (value.value / 100) * VIEW_BOX_SIZE;
    }

    if (value.unit === "px") {
        return value.value;
    }

    throw new Error(
        `Unsupported diamond-gradient length unit for SVG transformer: ${value.unit}`,
    );
}

function resolveCenter(position: GradientPosition): { x: number; y: number } {
    if (position.kind === "keywords") {
        return {
            x: resolveKeywordX(position.x),
            y: resolveKeywordY(position.y),
        };
    }

    return {
        x: resolveLengthPercentage(position.x),
        y: resolveLengthPercentage(position.y),
    };
}

function getDistanceToCorner(
    center: { x: number; y: number },
    corner: { x: number; y: number },
): number {
    return Math.abs(corner.x - center.x) + Math.abs(corner.y - center.y);
}

function getCornerDeltas(center: { x: number; y: number }) {
    return [
        { dx: -center.x, dy: -center.y },
        { dx: VIEW_BOX_SIZE - center.x, dy: -center.y },
        { dx: -center.x, dy: VIEW_BOX_SIZE - center.y },
        { dx: VIEW_BOX_SIZE - center.x, dy: VIEW_BOX_SIZE - center.y },
    ];
}

function scaleDiamondRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): { x: number; y: number } {
    const safeRadiusX = Math.max(radiusX, 0.0001);
    const safeRadiusY = Math.max(radiusY, 0.0001);
    const scale =
        Math.abs(dx) / safeRadiusX + Math.abs(dy) / safeRadiusY;

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

function resolveDiamondRadii(
    size: RadialGradientSize,
    shape: "circle" | "ellipse",
    center: { x: number; y: number },
): { x: number; y: number } {
    if (size.kind === "explicit") {
        const radiusX = resolveLengthPercentage(size.x);
        const radiusY = size.y
            ? resolveLengthPercentage(size.y)
            : radiusX;

        return {
            x: Math.max(radiusX, 0.0001),
            y: Math.max(shape === "circle" ? radiusX : radiusY, 0.0001),
        };
    }

    const left = center.x;
    const right = VIEW_BOX_SIZE - center.x;
    const top = center.y;
    const bottom = VIEW_BOX_SIZE - center.y;

    if (shape === "circle") {
        const corners = [
            { x: 0, y: 0 },
            { x: VIEW_BOX_SIZE, y: 0 },
            { x: 0, y: VIEW_BOX_SIZE },
            { x: VIEW_BOX_SIZE, y: VIEW_BOX_SIZE },
        ];
        const cornerDistances = corners.map((corner) =>
            getDistanceToCorner(center, corner),
        );

        if (size.value === "closest-side") {
            const radius = Math.max(Math.min(left, right, top, bottom), 0.0001);
            return { x: radius, y: radius };
        }

        if (size.value === "farthest-side") {
            const radius = Math.max(Math.max(left, right, top, bottom), 0.0001);
            return { x: radius, y: radius };
        }

        if (size.value === "closest-corner") {
            const radius = Math.max(Math.min(...cornerDistances), 0.0001);
            return { x: radius, y: radius };
        }

        const radius = Math.max(Math.max(...cornerDistances), 0.0001);
        return { x: radius, y: radius };
    }

    const closestSideRadiusX = Math.min(left, right);
    const closestSideRadiusY = Math.min(top, bottom);
    const farthestSideRadiusX = Math.max(left, right);
    const farthestSideRadiusY = Math.max(top, bottom);

    if (size.value === "closest-side") {
        return {
            x: Math.max(closestSideRadiusX, 0.0001),
            y: Math.max(closestSideRadiusY, 0.0001),
        };
    }

    if (size.value === "farthest-side") {
        return {
            x: Math.max(farthestSideRadiusX, 0.0001),
            y: Math.max(farthestSideRadiusY, 0.0001),
        };
    }

    const corners = getCornerDeltas(center);

    if (size.value === "closest-corner") {
        return corners
            .map((corner) =>
                scaleDiamondRadiiToCorner(
                    closestSideRadiusX,
                    closestSideRadiusY,
                    corner.dx,
                    corner.dy,
                ),
            )
            .reduce((closest, current) =>
                current.x * current.y < closest.x * closest.y
                    ? current
                    : closest,
            );
    }

    return corners
        .map((corner) =>
            scaleDiamondRadiiToCorner(
                farthestSideRadiusX,
                farthestSideRadiusY,
                corner.dx,
                corner.dy,
            ),
        )
        .reduce((farthest, current) =>
            current.x * current.y > farthest.x * farthest.y
                ? current
                : farthest,
        );
}

function getMaxVisibleDiamondT(
    center: { x: number; y: number },
    radii: { x: number; y: number },
): number {
    const corners = [
        { x: 0, y: 0 },
        { x: VIEW_BOX_SIZE, y: 0 },
        { x: 0, y: VIEW_BOX_SIZE },
        { x: VIEW_BOX_SIZE, y: VIEW_BOX_SIZE },
    ];

    return Math.max(
        ...corners.map((corner) =>
            Math.abs(corner.x - center.x) / Math.max(radii.x, 0.0001) +
            Math.abs(corner.y - center.y) / Math.max(radii.y, 0.0001),
        ),
    );
}

function getColorStops(stops: GradientStop[]): GradientStop[] {
    return stops
        .filter((stop) => stop.type === "color-stop" && stop.position != null)
        .sort((a, b) => a.position - b.position);
}

function formatNumber(value: number): string {
    return `${Number(value.toFixed(3))}`;
}

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
    implements IGradientTransformerModule<ISvgGradientResult> {
    public readonly target = "svg";
    public readonly gradientType = "diamond-gradient";

    public to(input: GradientLike): ISvgGradientResult {
        if (!(input instanceof DiamondGradient)) {
            throw new Error("Expected DiamondGradient");
        }

        const id = DEFAULT_ID;
        const center = resolveCenter(input.config.position);
        const radii = resolveDiamondRadii(
            input.config.size,
            input.config.shape,
            center,
        );
        const maxVisibleT = getMaxVisibleDiamondT(center, radii);
        const maxT = input.isRepeating ? maxVisibleT : 1;
        const baseStops = resolveRenderableGradientStops(
            input,
            SVG_GRADIENT_SAMPLE_COUNT,
        );
        const stops = getColorStops(
            input.isRepeating
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
