import type {
    GradientAngleUnit,
    GradientAngleValue,
    GradientLengthPercentage,
    GradientLengthUnit,
    GradientPosition,
    GradientPositionKeywordX,
    GradientPositionKeywordY,
} from "./types";

const GRADIENT_ANGLE_UNITS: GradientAngleUnit[] = [
    "deg",
    "rad",
    "turn",
    "grad",
];

const GRADIENT_LENGTH_UNITS: GradientLengthUnit[] = [
    "px",
    "em",
    "rem",
    "vw",
    "vh",
    "vmin",
    "vmax",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
];

export function parseGradientAngle(input: string): GradientAngleValue {
    const match = input.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/);

    if (match === null || !isGradientAngleUnit(match[2])) {
        throw new SyntaxError(`Invalid gradient angle: "${input}"`);
    }

    return {
        kind: "angle",
        value: Number(match[1]),
        unit: match[2],
    };
}

export function formatGradientAngle(value: GradientAngleValue): string {
    return `${value.value}${value.unit}`;
}

export function parseGradientLengthPercentage(
    input: string,
): GradientLengthPercentage {
    const percentMatch = input.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/);

    if (percentMatch !== null) {
        return {
            kind: "percent",
            value: Number(percentMatch[1]),
        };
    }

    const lengthMatch = input.match(
        /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z]+)$/,
    );

    if (
        lengthMatch === null ||
        !isGradientLengthUnit(lengthMatch[2])
    ) {
        throw new SyntaxError(`Invalid gradient length-percentage: "${input}"`);
    }

    return {
        kind: "length",
        value: Number(lengthMatch[1]),
        unit: lengthMatch[2],
    };
}

export function formatGradientLengthPercentage(
    value: GradientLengthPercentage,
): string {
    if (value.kind === "percent") {
        return `${value.value}%`;
    }

    return `${value.value}${value.unit}`;
}

export function isGradientLengthPercentageToken(
    value: string | undefined,
): value is string {
    if (value === undefined) {
        return false;
    }

    return (
        /^([+-]?(?:\d+\.?\d*|\.\d+))%$/.test(value) ||
        /^([+-]?(?:\d+\.?\d*|\.\d+))[a-z]+$/.test(value)
    );
}

export function parseGradientPosition(tokens: string[]): GradientPosition {
    if (tokens.length === 0) {
        throw new SyntaxError("Gradient position cannot be empty");
    }

    if (tokens.length > 2) {
        throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
    }

    const allLengthPercentage = tokens.every((token) =>
        isGradientLengthPercentageToken(token),
    );
    const hasLengthPercentage = tokens.some((token) =>
        isGradientLengthPercentageToken(token),
    );

    if (allLengthPercentage) {
        if (tokens.length !== 2) {
            throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
        }

        return {
            kind: "values",
            x: parseGradientLengthPercentage(tokens[0]),
            y: parseGradientLengthPercentage(tokens[1]),
        };
    }

    if (hasLengthPercentage) {
        throw new SyntaxError(
            `Invalid mixed gradient position: ${tokens.join(" ")}`,
        );
    }

    return parseGradientKeywordPosition(tokens);
}

export function formatGradientPosition(position: GradientPosition): string {
    if (position.kind === "keywords") {
        return `${position.x} ${position.y}`;
    }

    return `${formatGradientLengthPercentage(position.x)} ${formatGradientLengthPercentage(position.y)}`;
}

export function validateGradientAngle(value: GradientAngleValue): void {
    if (typeof value !== "object" || value === null) {
        throw new TypeError("Gradient angle must be an object");
    }

    if (value.kind !== "angle") {
        throw new TypeError("Gradient angle kind must be \"angle\"");
    }

    if (
        typeof value.value !== "number" ||
        !Number.isFinite(value.value)
    ) {
        throw new TypeError("Gradient angle value must be finite");
    }

    if (!isGradientAngleUnit(value.unit)) {
        throw new TypeError(`Invalid gradient angle unit: "${String(value.unit)}"`);
    }
}

export function validateGradientLengthPercentage(
    value: GradientLengthPercentage,
): void {
    if (typeof value !== "object" || value === null) {
        throw new TypeError("Gradient length-percentage must be an object");
    }

    if (
        typeof value.value !== "number" ||
        !Number.isFinite(value.value)
    ) {
        throw new TypeError("Gradient length-percentage value must be finite");
    }

    if (value.kind === "percent") {
        return;
    }

    if (value.kind === "length" && isGradientLengthUnit(value.unit)) {
        return;
    }

    throw new TypeError("Invalid gradient length-percentage");
}

export function validateGradientPosition(position: GradientPosition): void {
    if (typeof position !== "object" || position === null) {
        throw new TypeError("Gradient position must be an object");
    }

    if (position.kind === "keywords") {
        if (
            !isGradientPositionKeywordX(position.x) ||
            !isGradientPositionKeywordY(position.y)
        ) {
            throw new TypeError("Invalid gradient keyword position");
        }
        return;
    }

    if (position.kind === "values") {
        validateGradientLengthPercentage(position.x);
        validateGradientLengthPercentage(position.y);
        return;
    }

    throw new TypeError(
        `Invalid gradient position kind: "${String((position as { kind?: unknown }).kind)}"`,
    );
}

export function isDefaultGradientPosition(position: GradientPosition): boolean {
    return (
        position.kind === "keywords" &&
        position.x === "center" &&
        position.y === "center"
    );
}

function parseGradientKeywordPosition(tokens: string[]): GradientPosition {
    for (const token of tokens) {
        if (
            !isGradientPositionKeywordX(token) &&
            !isGradientPositionKeywordY(token)
        ) {
            throw new SyntaxError(`Invalid gradient position token: "${token}"`);
        }
    }

    const hasLeft = tokens.includes("left");
    const hasRight = tokens.includes("right");
    const hasTop = tokens.includes("top");
    const hasBottom = tokens.includes("bottom");

    if (hasLeft && hasRight) {
        throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
    }

    if (hasTop && hasBottom) {
        throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
    }

    const x: GradientPositionKeywordX = hasLeft
        ? "left"
        : hasRight
            ? "right"
            : "center";
    const y: GradientPositionKeywordY = hasTop
        ? "top"
        : hasBottom
            ? "bottom"
            : "center";

    return {
        kind: "keywords",
        x,
        y,
    };
}

function isGradientAngleUnit(value: string): value is GradientAngleUnit {
    return GRADIENT_ANGLE_UNITS.includes(value as GradientAngleUnit);
}

function isGradientLengthUnit(value: string): value is GradientLengthUnit {
    return GRADIENT_LENGTH_UNITS.includes(value as GradientLengthUnit);
}

function isGradientPositionKeywordX(
    value: string,
): value is GradientPositionKeywordX {
    return value === "left" || value === "center" || value === "right";
}

function isGradientPositionKeywordY(
    value: string,
): value is GradientPositionKeywordY {
    return value === "top" || value === "center" || value === "bottom";
}
