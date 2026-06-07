import type {
    GradientAngleValue,
    GradientLengthPercentage,
    GradientPosition,
} from "../../../kind/base";
import type { GradientRadialSize } from "../../../kind/radial";
import { degToRad, gradToRad, turnToRad } from "../../../../utils";

export type GradientPoint = {
    x: number;
    y: number;
};

export type GradientRadii = {
    x: number;
    y: number;
};

export type ResolveLengthPercentageOptions = {
    context?: string;
    allowUnsupportedUnitAsRaw?: boolean;
};

const EPSILON = 0.0001;

/**
 * RU: Ограничивает число диапазоном от 0 до 1.
 * EN: Clamps a number to the 0..1 range.
 */
export function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

/**
 * RU: Форматирует число с фиксированной максимальной точностью без лишних нулей.
 * EN: Formats a number with bounded precision and without unnecessary zeros.
 */
export function formatNumber(value: number, precision: number = 3): string {
    return `${Number(value.toFixed(precision))}`;
}

/**
 * RU: Переводит значение длины/процента в число относительно заданной оси.
 * EN: Resolves a length/percentage value against a reference axis.
 */
export function resolveLengthPercentage(
    value: GradientLengthPercentage,
    reference: number,
    options: ResolveLengthPercentageOptions = {},
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * reference;
    }

    if (value.unit === "px" || options.allowUnsupportedUnitAsRaw) {
        return value.value;
    }

    const context = options.context ?? "gradient";

    throw new Error(
        `Unsupported ${context} length unit: ${value.unit}`,
    );
}

/**
 * RU: Преобразует CSS keyword-позицию по горизонтали в координату.
 * EN: Resolves a CSS horizontal keyword position to a coordinate.
 */
export function resolveKeywordPositionX(
    value: "left" | "center" | "right",
    width: number,
): number {
    if (value === "left") return 0;
    if (value === "right") return width;

    return width / 2;
}

/**
 * RU: Преобразует CSS keyword-позицию по вертикали в координату.
 * EN: Resolves a CSS vertical keyword position to a coordinate.
 */
export function resolveKeywordPositionY(
    value: "top" | "center" | "bottom",
    height: number,
): number {
    if (value === "top") return 0;
    if (value === "bottom") return height;

    return height / 2;
}

/**
 * RU: Преобразует позицию градиента в координаты конкретной области.
 * EN: Resolves a gradient position into coordinates inside a concrete area.
 */
export function resolveGradientPosition(
    position: GradientPosition,
    width: number,
    height: number,
    options: ResolveLengthPercentageOptions = {},
): GradientPoint {
    if (position.kind === "keywords") {
        return {
            x: resolveKeywordPositionX(position.x, width),
            y: resolveKeywordPositionY(position.y, height),
        };
    }

    return {
        x: resolveLengthPercentage(position.x, width, options),
        y: resolveLengthPercentage(position.y, height, options),
    };
}

/**
 * RU: Переводит CSS angle в радианы.
 * EN: Converts a CSS angle value to radians.
 */
export function resolveAngleToRadians(angle: GradientAngleValue): number {
    if (angle.unit === "deg") return degToRad(angle.value);
    if (angle.unit === "turn") return turnToRad(angle.value);
    if (angle.unit === "grad") return gradToRad(angle.value);

    return angle.value;
}

/**
 * RU: Возвращает конечные точки линии линейного градиента в пикселях.
 * EN: Returns linear-gradient axis endpoints in pixels.
 */
export function resolveLinearGradientLine(
    angle: number,
    width: number,
    height: number,
): {
    start: GradientPoint;
    end: GradientPoint;
} {
    const dirX = Math.sin(angle);
    const dirY = -Math.cos(angle);
    const centerX = width / 2;
    const centerY = height / 2;
    const lineLength =
        Math.abs(width * dirX) +
        Math.abs(height * dirY);

    return {
        start: {
            x: centerX - (dirX * lineLength) / 2,
            y: centerY - (dirY * lineLength) / 2,
        },
        end: {
            x: centerX + (dirX * lineLength) / 2,
            y: centerY + (dirY * lineLength) / 2,
        },
    };
}

/**
 * RU: Возвращает вектор SVG linearGradient в процентах objectBoundingBox.
 * EN: Returns an SVG linearGradient vector in objectBoundingBox percentages.
 */
export function resolveLinearGradientVector(angle: number): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
} {
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const scale = Math.max(Math.abs(dx), Math.abs(dy), EPSILON);
    const unitX = dx / scale;
    const unitY = dy / scale;

    return {
        x1: 50 - unitX * 50,
        y1: 50 - unitY * 50,
        x2: 50 + unitX * 50,
        y2: 50 + unitY * 50,
    };
}

/**
 * RU: Возвращает углы прямоугольной области.
 * EN: Returns the corners of a rectangular area.
 */
export function getGradientCorners(
    width: number,
    height: number,
): GradientPoint[] {
    return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
    ];
}

/**
 * RU: Считает евклидово расстояние между двумя точками.
 * EN: Computes the Euclidean distance between two points.
 */
export function getEuclideanDistance(
    from: GradientPoint,
    to: GradientPoint,
): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * RU: Считает diamond/manhattan расстояние между двумя точками.
 * EN: Computes the diamond/Manhattan distance between two points.
 */
export function getManhattanDistance(
    from: GradientPoint,
    to: GradientPoint,
): number {
    return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * RU: Возвращает дельты от центра до всех углов области.
 * EN: Returns deltas from a center point to every area corner.
 */
export function getCornerDeltas(
    center: GradientPoint,
    width: number,
    height: number,
): Array<{ dx: number; dy: number }> {
    return [
        { dx: -center.x, dy: -center.y },
        { dx: width - center.x, dy: -center.y },
        { dx: -center.x, dy: height - center.y },
        { dx: width - center.x, dy: height - center.y },
    ];
}

/**
 * RU: Масштабирует радиусы эллипса так, чтобы он достиг заданного угла.
 * EN: Scales ellipse radii so the ellipse reaches a target corner.
 */
export function scaleEllipseRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): GradientRadii {
    const safeRadiusX = Math.max(radiusX, EPSILON);
    const safeRadiusY = Math.max(radiusY, EPSILON);
    const scale = Math.sqrt(
        (dx * dx) / (safeRadiusX * safeRadiusX) +
        (dy * dy) / (safeRadiusY * safeRadiusY),
    );

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

/**
 * RU: Масштабирует радиусы diamond-градиента так, чтобы он достиг заданного угла.
 * EN: Scales diamond-gradient radii so the diamond reaches a target corner.
 */
export function scaleDiamondRadiiToCorner(
    radiusX: number,
    radiusY: number,
    dx: number,
    dy: number,
): GradientRadii {
    const safeRadiusX = Math.max(radiusX, EPSILON);
    const safeRadiusY = Math.max(radiusY, EPSILON);
    const scale =
        Math.abs(dx) / safeRadiusX + Math.abs(dy) / safeRadiusY;

    return {
        x: safeRadiusX * scale,
        y: safeRadiusY * scale,
    };
}

/**
 * RU: Вычисляет радиусы radial-gradient для указанной области.
 * EN: Resolves radial-gradient radii for a target area.
 */
export function resolveRadialRadii(
    size: GradientRadialSize,
    shape: "circle" | "ellipse",
    center: GradientPoint,
    width: number,
    height: number,
    options: ResolveLengthPercentageOptions = {},
): GradientRadii {
    if (size.kind === "explicit") {
        const radiusX = resolveLengthPercentage(size.x, width, options);
        const radiusY = size.y
            ? resolveLengthPercentage(size.y, height, options)
            : radiusX;

        return {
            x: Math.max(radiusX, EPSILON),
            y: Math.max(shape === "circle" ? radiusX : radiusY, EPSILON),
        };
    }

    const left = center.x;
    const right = width - center.x;
    const top = center.y;
    const bottom = height - center.y;

    if (shape === "circle") {
        const cornerDistances = getGradientCorners(width, height).map((corner) =>
            getEuclideanDistance(center, corner),
        );

        if (size.value === "closest-side") {
            const radius = Math.max(Math.min(left, right, top, bottom), EPSILON);
            return { x: radius, y: radius };
        }

        if (size.value === "farthest-side") {
            const radius = Math.max(Math.max(left, right, top, bottom), EPSILON);
            return { x: radius, y: radius };
        }

        if (size.value === "closest-corner") {
            const radius = Math.max(Math.min(...cornerDistances), EPSILON);
            return { x: radius, y: radius };
        }

        const radius = Math.max(Math.max(...cornerDistances), EPSILON);
        return { x: radius, y: radius };
    }

    const closestSideRadiusX = Math.min(left, right);
    const closestSideRadiusY = Math.min(top, bottom);
    const farthestSideRadiusX = Math.max(left, right);
    const farthestSideRadiusY = Math.max(top, bottom);

    if (size.value === "closest-side") {
        return {
            x: Math.max(closestSideRadiusX, EPSILON),
            y: Math.max(closestSideRadiusY, EPSILON),
        };
    }

    if (size.value === "farthest-side") {
        return {
            x: Math.max(farthestSideRadiusX, EPSILON),
            y: Math.max(farthestSideRadiusY, EPSILON),
        };
    }

    const corners = getCornerDeltas(center, width, height);

    if (size.value === "closest-corner") {
        return corners
            .map((corner) =>
                scaleEllipseRadiiToCorner(
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
            scaleEllipseRadiiToCorner(
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

/**
 * RU: Вычисляет радиусы diamond-gradient для указанной области.
 * EN: Resolves diamond-gradient radii for a target area.
 */
export function resolveDiamondRadii(
    size: GradientRadialSize,
    shape: "circle" | "ellipse",
    center: GradientPoint,
    width: number,
    height: number,
    options: ResolveLengthPercentageOptions = {},
): GradientRadii {
    if (size.kind === "explicit") {
        const radiusX = resolveLengthPercentage(size.x, width, options);
        const radiusY = size.y
            ? resolveLengthPercentage(size.y, height, options)
            : radiusX;

        return {
            x: Math.max(radiusX, EPSILON),
            y: Math.max(shape === "circle" ? radiusX : radiusY, EPSILON),
        };
    }

    const left = center.x;
    const right = width - center.x;
    const top = center.y;
    const bottom = height - center.y;

    if (shape === "circle") {
        const cornerDistances = getGradientCorners(width, height).map((corner) =>
            getManhattanDistance(center, corner),
        );

        if (size.value === "closest-side") {
            const radius = Math.max(Math.min(left, right, top, bottom), EPSILON);
            return { x: radius, y: radius };
        }

        if (size.value === "farthest-side") {
            const radius = Math.max(Math.max(left, right, top, bottom), EPSILON);
            return { x: radius, y: radius };
        }

        if (size.value === "closest-corner") {
            const radius = Math.max(Math.min(...cornerDistances), EPSILON);
            return { x: radius, y: radius };
        }

        const radius = Math.max(Math.max(...cornerDistances), EPSILON);
        return { x: radius, y: radius };
    }

    const closestSideRadiusX = Math.min(left, right);
    const closestSideRadiusY = Math.min(top, bottom);
    const farthestSideRadiusX = Math.max(left, right);
    const farthestSideRadiusY = Math.max(top, bottom);

    if (size.value === "closest-side") {
        return {
            x: Math.max(closestSideRadiusX, EPSILON),
            y: Math.max(closestSideRadiusY, EPSILON),
        };
    }

    if (size.value === "farthest-side") {
        return {
            x: Math.max(farthestSideRadiusX, EPSILON),
            y: Math.max(farthestSideRadiusY, EPSILON),
        };
    }

    const corners = getCornerDeltas(center, width, height);

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

/**
 * RU: Считает максимальный видимый параметр t для diamond-gradient.
 * EN: Computes the maximum visible t value for a diamond-gradient.
 */
export function getMaxVisibleDiamondT(
    center: GradientPoint,
    radii: GradientRadii,
    width: number,
    height: number,
): number {
    return Math.max(
        ...getGradientCorners(width, height).map((corner) =>
            Math.abs(corner.x - center.x) / Math.max(radii.x, EPSILON) +
            Math.abs(corner.y - center.y) / Math.max(radii.y, EPSILON),
        ),
    );
}
