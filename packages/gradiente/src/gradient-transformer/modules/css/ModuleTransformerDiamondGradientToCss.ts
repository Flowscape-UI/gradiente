import { formatRgb, interpolate } from "culori";
import {
    DiamondGradient,
    type GradientBase,
    type GradientLengthPercentage,
    type GradientPosition,
    type GradientStop,
    type RadialGradientSize,
} from "../../../gradients";
import { expandRepeatingStopsTo, resolveRenderableGradientStops } from "../helpers";
import type { IGradientTransformerModule } from "../types";

const DIAMOND_SAMPLE_COUNT = 96;

function getColorStops(stops: GradientStop[]): GradientStop[] {
    return stops.filter(
        (stop) => stop.type === "color-stop" && stop.position != null,
    ).sort((a, b) => a.position - b.position);
}

function sampleColorAtPosition(
    stops: GradientStop[],
    position: number,
): string {
    if (stops.length === 0) {
        throw new Error("Cannot sample color from empty diamond gradient stops.");
    }

    if (stops.length === 1 || position <= stops[0].position) {
        return stops[0].value;
    }

    const lastStop = stops[stops.length - 1];

    if (position >= lastStop.position) {
        return lastStop.value;
    }

    for (let index = 0; index < stops.length - 1; index += 1) {
        const current = stops[index];
        const next = stops[index + 1];

        if (position >= current.position && position <= next.position) {
            const range = next.position - current.position || 1;
            const localT = (position - current.position) / range;
            const colorInterpolator = interpolate(
                [current.value, next.value],
                "rgb",
            );

            return formatRgb(colorInterpolator(localT));
        }
    }

    return lastStop.value;
}

function resolvePosition(
    position: GradientPosition,
): { x: number; y: number } {
    if (position.kind === "keywords") {
        return {
            x: resolveKeywordX(position.x),
            y: resolveKeywordY(position.y),
        };
    }

    return {
        x: resolveLengthPercentage(position.x, 100),
        y: resolveLengthPercentage(position.y, 100),
    };
}

function resolveKeywordX(value: "left" | "center" | "right"): number {
    if (value === "left") return 0;
    if (value === "right") return 100;

    return 50;
}

function resolveKeywordY(value: "top" | "center" | "bottom"): number {
    if (value === "top") return 0;
    if (value === "bottom") return 100;

    return 50;
}

function resolveLengthPercentage(
    value: GradientLengthPercentage,
    reference: number,
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * reference;
    }

    if (value.unit === "px") {
        return value.value;
    }

    throw new Error(
        `Unsupported diamond-gradient length unit for CSS transformer: ${value.unit}`,
    );
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
        { dx: 100 - center.x, dy: -center.y },
        { dx: -center.x, dy: 100 - center.y },
        { dx: 100 - center.x, dy: 100 - center.y },
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

function getMaxVisibleDiamondT(
    center: { x: number; y: number },
    radii: { x: number; y: number },
): number {
    const corners = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
    ];

    return Math.max(
        ...corners.map((corner) =>
            Math.abs(corner.x - center.x) / Math.max(radii.x, 0.0001) +
            Math.abs(corner.y - center.y) / Math.max(radii.y, 0.0001),
        ),
    );
}

function resolveDiamondRadii(
    size: RadialGradientSize,
    shape: "circle" | "ellipse",
    center: { x: number; y: number },
): { x: number; y: number } {
    if (size.kind === "explicit") {
        const radiusX = resolveLengthPercentage(size.x, 100);
        const radiusY = size.y
            ? resolveLengthPercentage(size.y, 100)
            : radiusX;

        return {
            x: Math.max(radiusX, 0.0001),
            y: Math.max(shape === "circle" ? radiusX : radiusY, 0.0001),
        };
    }

    const left = center.x;
    const right = 100 - center.x;
    const top = center.y;
    const bottom = 100 - center.y;

    if (shape === "circle") {
        const corners = [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 0, y: 100 },
            { x: 100, y: 100 },
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

function formatPoint(value: number): string {
    return Number(value.toFixed(3)).toString();
}

function buildDiamondPolygon(
    center: { x: number; y: number },
    radii: { x: number; y: number },
    position: number,
): string {
    const x = radii.x * position;
    const y = radii.y * position;

    return [
        `${formatPoint(center.x)} ${formatPoint(center.y - y)}`,
        `${formatPoint(center.x + x)} ${formatPoint(center.y)}`,
        `${formatPoint(center.x)} ${formatPoint(center.y + y)}`,
        `${formatPoint(center.x - x)} ${formatPoint(center.y)}`,
    ].join(" ");
}

function encodeSvgDataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export class ModuleTransformerDiamondGradientToCss
    implements IGradientTransformerModule<string> {
    public readonly target = "css";
    public readonly gradientType = "diamond-gradient";

    public to(input: GradientBase<any>): string {
        if (!(input instanceof DiamondGradient)) {
            throw new Error("Expected DiamondGradient");
        }

        const center = resolvePosition(input.config.position);
        const radii = resolveDiamondRadii(
            input.config.size,
            input.config.shape,
            center,
        );
        const maxVisibleT = getMaxVisibleDiamondT(center, radii);
        const maxT = input.isRepeating ? maxVisibleT : 1;
        const baseStops = resolveRenderableGradientStops(
            input,
            DIAMOND_SAMPLE_COUNT,
        );
        const stops = getColorStops(
            input.isRepeating
                ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                : baseStops,
        );
        const outerColor = sampleColorAtPosition(stops, maxT);
        const polygons: string[] = [];
        const sampleCount = Math.max(
            DIAMOND_SAMPLE_COUNT,
            Math.ceil(DIAMOND_SAMPLE_COUNT * maxT),
        );

        for (let index = sampleCount; index >= 0; index -= 1) {
            const position = (index / sampleCount) * maxT;
            const color = sampleColorAtPosition(stops, position);
            const points = buildDiamondPolygon(center, radii, position);

            polygons.push(`<polygon points="${points}" fill="${color}"/>`);
        }

        const svg = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">',
            `<rect width="100" height="100" fill="${outerColor}"/>`,
            ...polygons,
            "</svg>",
        ].join("");

        return encodeSvgDataUrl(svg);
    }
}
