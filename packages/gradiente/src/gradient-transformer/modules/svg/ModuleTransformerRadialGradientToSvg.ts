import {
    RadialGradient,
    type GradientLengthPercentage,
    type GradientLike,
    type GradientPosition,
    type RadialGradientSize,
} from "../../../gradients";
import type { ISvgGradientResult, IGradientTransformerModule } from "../types";
import {
    buildSvgGradientResult,
    buildSvgStops,
    formatPoint,
} from "./helpers";

const DEFAULT_ID = "gradiente-radial-gradient";

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

function resolveLengthPercentage(value: GradientLengthPercentage): number {
    if (value.kind === "percent") {
        return value.value;
    }

    if (value.unit === "px") {
        return value.value;
    }

    return value.value;
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
    const dx = corner.x - center.x;
    const dy = corner.y - center.y;

    return Math.sqrt(dx * dx + dy * dy);
}

function resolveRadii(
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
            const radius = Math.min(left, right, top, bottom);
            return { x: radius, y: radius };
        }

        if (size.value === "farthest-side") {
            const radius = Math.max(left, right, top, bottom);
            return { x: radius, y: radius };
        }

        if (size.value === "closest-corner") {
            const radius = Math.min(...cornerDistances);
            return { x: radius, y: radius };
        }

        const radius = Math.max(...cornerDistances);
        return { x: radius, y: radius };
    }

    if (size.value === "closest-side") {
        return {
            x: Math.min(left, right),
            y: Math.min(top, bottom),
        };
    }

    if (size.value === "farthest-side") {
        return {
            x: Math.max(left, right),
            y: Math.max(top, bottom),
        };
    }

    return {
        x: Math.max(left, right),
        y: Math.max(top, bottom),
    };
}

export class ModuleTransformerRadialGradientToSvg
    implements IGradientTransformerModule<ISvgGradientResult> {
    public readonly target = "svg";
    public readonly gradientType = "radial-gradient";

    public to(input: GradientLike): ISvgGradientResult {
        if (!(input instanceof RadialGradient)) {
            throw new Error("Expected RadialGradient");
        }

        const id = DEFAULT_ID;
        const center = resolveCenter(input.config.position);
        const radii = resolveRadii(
            input.config.size,
            input.config.shape,
            center,
        );
        const radius = Math.max(radii.x, radii.y);
        const scaleX = radii.x / radius;
        const scaleY = radii.y / radius;
        const transform = input.config.shape === "ellipse"
            ? ` gradientTransform="translate(${center.x} ${center.y}) scale(${scaleX} ${scaleY}) translate(${-center.x} ${-center.y})"`
            : "";
        const gradient = [
            `<radialGradient id="${id}" gradientUnits="objectBoundingBox" cx="${formatPoint(center.x)}" cy="${formatPoint(center.y)}" r="${formatPoint(radius)}"${transform}>`,
            buildSvgStops(input),
            "</radialGradient>",
        ].join("");

        return buildSvgGradientResult({
            id,
            type: "radialGradient",
            gradient,
        });
    }
}
