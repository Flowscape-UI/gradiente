import {
    parseStringToAbi,
    splitTopLevelByWhitespace,
    type GradientAbi,
    type GradientAbiInput,
} from "../../../abi";
import { GradientWithStopsBase } from "../base";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
} from "../hue";
import type {
    GradientInterpolation,
    GradientLengthPercentage,
    GradientLengthUnit,
    GradientPosition,
    GradientPositionKeywordX,
    GradientPositionKeywordY,
} from "../base";
import type {
    GradientRadialConfig,
    GradientRadialConfigInput,
    GradientRadialExtent,
    GradientRadialJSON,
    GradientRadialShape,
    GradientRadialSize,
    GradientRadialStop,
    GradientRadialType,
} from "./types";

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

export class GradientRadial<TType extends string = GradientRadialType>
extends GradientWithStopsBase<GradientRadialStop, GradientRadialConfig>
{
    protected static readonly gradientType: string = "radial-gradient";

    private static readonly DEFAULT_CONFIG: GradientRadialConfig = {
        shape: "ellipse",
        size: {
            kind: "extent",
            value: "farthest-corner",
        },
        position: {
            kind: "keywords",
            x: "center",
            y: "center",
        },
        interpolation: {
            colorSpace: "srgb",
        },
        isRepeating: false,
    };

    public declare readonly type: TType;

    constructor(
        stops: GradientRadialStop[],
        config?: GradientRadialConfigInput,
    ) {
        super(
            (new.target as typeof GradientRadial).gradientType,
            stops,
            GradientRadial._resolveConfig(config),
        );
    }

    public static normalizeConfig(input: string): GradientRadialConfig {
        const value = input.trim().toLowerCase();

        if (value.length === 0) {
            throw new SyntaxError("Radial gradient config cannot be empty");
        }

        return GradientRadial._parseConfigInput(value);
    }

    public static override fromString(input: string): GradientRadial<string> {
        return GradientRadial.fromAbi(parseStringToAbi(input));
    }

    public static override fromAbi(abi: GradientAbi): GradientRadial<string> {
        if (abi.functionName !== "radial-gradient") {
            throw new Error("Invalid function name for GradientRadial");
        }

        const config = GradientRadial._parseConfig(abi.inputs);
        const inputsWithoutConfig = abi.inputs[0]?.type === "config"
            ? abi.inputs.slice(1)
            : abi.inputs;
        const stops = GradientRadial._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new GradientRadial(stops, {
            ...config,
            isRepeating: abi.isRepeating,
        });
    }

    public override clone(): this {
        const snapshot = this.toJSON();

        return new GradientRadial(snapshot.stops, snapshot.config) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof GradientRadial &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override minColorStopsCount(): number {
        return 2;
    }

    public override toJSON(): GradientRadialJSON<TType> {
        return super.toJSON() as GradientRadialJSON<TType>;
    }

    public override toString(): string {
        const functionName = this.isRepeating()
            ? `repeating-${this.type}`
            : this.type;
        const config = this._serializeConfig(this.getConfig());
        const stops = this._serializeStopsCompact();
        const parts = [
            config,
            ...stops,
        ].filter(Boolean);

        return `${functionName}(${parts.join(", ")})`;
    }

    protected override _validateConfig(config: GradientRadialConfig): void {
        if (!GradientRadial._isShape(config.shape)) {
            throw new TypeError(
                `Invalid radial gradient shape: "${String(config.shape)}"`,
            );
        }

        this._validateSize(config.size);
        this._validatePosition(config.position);

        if (
            config.isRepeating !== undefined &&
            typeof config.isRepeating !== "boolean"
        ) {
            throw new TypeError("Radial gradient repeating flag must be a boolean");
        }

        if (
            typeof config.interpolation !== "object" ||
            config.interpolation === null
        ) {
            throw new TypeError("Radial gradient interpolation must be an object");
        }

        if (!isGradientColorSpace(config.interpolation.colorSpace)) {
            throw new TypeError(
                `Invalid radial gradient color space: "${String(config.interpolation.colorSpace)}"`,
            );
        }

        if (
            config.interpolation.hue !== undefined &&
            !isGradientHueInterpolation(config.interpolation.hue)
        ) {
            throw new TypeError(
                `Invalid radial gradient hue interpolation: "${String(config.interpolation.hue)}"`,
            );
        }
    }

    private static _resolveConfig(
        input: GradientRadialConfigInput = {},
    ): GradientRadialConfig {
        const interpolation = {
            ...GradientRadial.DEFAULT_CONFIG.interpolation,
            ...input.interpolation,
        };

        return {
            shape: input.shape ?? GradientRadial.DEFAULT_CONFIG.shape,
            size: structuredClone(
                input.size ?? GradientRadial.DEFAULT_CONFIG.size,
            ),
            position: structuredClone(
                input.position ?? GradientRadial.DEFAULT_CONFIG.position,
            ),
            interpolation,
            isRepeating:
                input.isRepeating ?? GradientRadial.DEFAULT_CONFIG.isRepeating,
        };
    }

    protected static _parseConfig(inputs: GradientAbiInput[]): GradientRadialConfig {
        const input = inputs.find((item) => item.type === "config");

        if (input === undefined) {
            return GradientRadial._resolveConfig();
        }

        return GradientRadial.normalizeConfig(input.value);
    }

    private static _parseConfigInput(input: string): GradientRadialConfig {
        const tokens = splitTopLevelByWhitespace(input);
        const config: GradientRadialConfigInput = {};
        let seenShape = false;
        let seenSize = false;
        let seenPosition = false;
        let seenInterpolation = false;

        for (let index = 0; index < tokens.length; index += 1) {
            const token = tokens[index];

            if (GradientRadial._isShape(token)) {
                if (seenShape) {
                    throw new SyntaxError("Duplicate radial gradient shape");
                }

                config.shape = token;
                seenShape = true;
                continue;
            }

            if (GradientRadial._isExtent(token)) {
                if (seenSize) {
                    throw new SyntaxError("Duplicate radial gradient size");
                }

                config.size = {
                    kind: "extent",
                    value: token,
                };
                seenSize = true;
                continue;
            }

            if (GradientRadial._isLengthPercentageToken(token)) {
                if (seenSize) {
                    throw new SyntaxError("Duplicate radial gradient size");
                }

                const next = tokens[index + 1];

                if (
                    (config.shape ?? GradientRadial.DEFAULT_CONFIG.shape) === "ellipse" &&
                    GradientRadial._isLengthPercentageToken(next)
                ) {
                    config.size = {
                        kind: "explicit",
                        x: GradientRadial._parseLengthPercentage(token),
                        y: GradientRadial._parseLengthPercentage(next),
                    };
                    index += 1;
                } else {
                    config.size = {
                        kind: "explicit",
                        x: GradientRadial._parseLengthPercentage(token),
                    };
                }

                seenSize = true;
                continue;
            }

            if (token === "at") {
                if (seenPosition) {
                    throw new SyntaxError("Duplicate radial gradient position");
                }

                const positionTokens: string[] = [];

                for (
                    let positionIndex = index + 1;
                    positionIndex < tokens.length;
                    positionIndex += 1
                ) {
                    const positionToken = tokens[positionIndex];

                    if (positionToken === "in") {
                        break;
                    }

                    positionTokens.push(positionToken);
                }

                config.position = GradientRadial._parseRadialPosition(positionTokens);
                index += positionTokens.length;
                seenPosition = true;
                continue;
            }

            if (token === "in") {
                if (seenInterpolation) {
                    throw new SyntaxError("Duplicate radial gradient interpolation");
                }

                const colorSpace = tokens[index + 1];

                if (
                    colorSpace === undefined ||
                    !isGradientColorSpace(colorSpace)
                ) {
                    throw new SyntaxError(
                        "Invalid radial-gradient interpolation: missing color space",
                    );
                }

                const maybeHue = tokens[index + 2];
                const maybeHueKeyword = tokens[index + 3];

                if (maybeHue !== undefined) {
                    if (!isGradientHueInterpolation(maybeHue)) {
                        throw new SyntaxError(
                            `Invalid radial-gradient hue interpolation: "${maybeHue}"`,
                        );
                    }

                    if (maybeHueKeyword !== "hue") {
                        throw new SyntaxError(
                            `Expected "hue" after "${maybeHue}"`,
                        );
                    }

                    config.interpolation = {
                        colorSpace,
                        hue: maybeHue,
                    };
                    index += 3;
                } else {
                    config.interpolation = {
                        colorSpace,
                    };
                    index += 1;
                }

                seenInterpolation = true;
                continue;
            }

            throw new SyntaxError(`Unknown radial gradient config token: "${token}"`);
        }

        return GradientRadial._resolveConfig(config);
    }

    private static _parseRadialPosition(tokens: string[]): GradientPosition {
        if (tokens.length === 0) {
            throw new SyntaxError("Radial gradient position cannot be empty");
        }

        if (tokens.length > 2) {
            throw new SyntaxError(
                `Invalid radial-gradient position: ${tokens.join(" ")}`,
            );
        }

        const allLengthPercentage = tokens.every((token) =>
            GradientRadial._isLengthPercentageToken(token),
        );
        const hasLengthPercentage = tokens.some((token) =>
            GradientRadial._isLengthPercentageToken(token),
        );

        if (allLengthPercentage) {
            if (tokens.length !== 2) {
                throw new SyntaxError(
                    `Invalid radial-gradient position: ${tokens.join(" ")}`,
                );
            }

            return {
                kind: "values",
                x: GradientRadial._parseLengthPercentage(tokens[0]),
                y: GradientRadial._parseLengthPercentage(tokens[1]),
            };
        }

        if (hasLengthPercentage) {
            throw new SyntaxError(
                `Invalid mixed radial-gradient position: ${tokens.join(" ")}`,
            );
        }

        return GradientRadial._parseKeywordPosition(tokens);
    }

    private static _parseKeywordPosition(tokens: string[]): GradientPosition {
        for (const token of tokens) {
            if (
                !GradientRadial._isPositionKeywordX(token) &&
                !GradientRadial._isPositionKeywordY(token)
            ) {
                throw new SyntaxError(
                    `Invalid radial-gradient position token: "${token}"`,
                );
            }
        }

        const hasLeft = tokens.includes("left");
        const hasRight = tokens.includes("right");
        const hasTop = tokens.includes("top");
        const hasBottom = tokens.includes("bottom");

        if (hasLeft && hasRight) {
            throw new SyntaxError(
                `Invalid radial-gradient position: ${tokens.join(" ")}`,
            );
        }

        if (hasTop && hasBottom) {
            throw new SyntaxError(
                `Invalid radial-gradient position: ${tokens.join(" ")}`,
            );
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

    private static _parseLengthPercentage(
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
            !GradientRadial._isLengthUnit(lengthMatch[2])
        ) {
            throw new SyntaxError(`Invalid length-percentage: "${input}"`);
        }

        return {
            kind: "length",
            value: Number(lengthMatch[1]),
            unit: lengthMatch[2],
        };
    }

    private static _isShape(value: string): value is GradientRadialShape {
        return value === "circle" || value === "ellipse";
    }

    private static _isExtent(value: string): value is GradientRadialExtent {
        return (
            value === "closest-side" ||
            value === "closest-corner" ||
            value === "farthest-side" ||
            value === "farthest-corner"
        );
    }

    private static _isLengthPercentageToken(
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

    private static _isLengthUnit(value: string): value is GradientLengthUnit {
        return GRADIENT_LENGTH_UNITS.includes(value as GradientLengthUnit);
    }

    private static _isPositionKeywordX(
        value: string,
    ): value is GradientPositionKeywordX {
        return value === "left" || value === "center" || value === "right";
    }

    private static _isPositionKeywordY(
        value: string,
    ): value is GradientPositionKeywordY {
        return value === "top" || value === "center" || value === "bottom";
    }

    private _serializeConfig(config: GradientRadialConfig): string {
        const parts = [
            this._serializeRadialConfig(config),
            this._serializeInterpolation(config.interpolation),
        ].filter(Boolean);

        return parts.join(" ");
    }

    private _serializeRadialConfig(config: GradientRadialConfig): string {
        const parts: string[] = [];

        if (!this._isDefaultShape(config.shape)) {
            parts.push(config.shape);
        }

        if (!this._isDefaultSize(config.size)) {
            parts.push(this._serializeSize(config.size));
        }

        if (!this._isDefaultPosition(config.position)) {
            parts.push(`at ${this._serializePosition(config.position)}`);
        }

        return parts.join(" ");
    }

    private _serializeSize(size: GradientRadialSize): string {
        if (size.kind === "extent") {
            return size.value;
        }

        const x = this._formatLengthPercentage(size.x);

        if (size.y === undefined) {
            return x;
        }

        return `${x} ${this._formatLengthPercentage(size.y)}`;
    }

    private _serializePosition(position: GradientPosition): string {
        if (position.kind === "keywords") {
            return `${position.x} ${position.y}`;
        }

        return `${this._formatLengthPercentage(position.x)} ${this._formatLengthPercentage(position.y)}`;
    }

    private _serializeInterpolation(
        interpolation: GradientInterpolation,
    ): string {
        if (this._isDefaultInterpolation(interpolation)) {
            return "";
        }

        if (interpolation.hue === undefined) {
            return `in ${interpolation.colorSpace}`;
        }

        return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
    }

    private _formatLengthPercentage(value: GradientLengthPercentage): string {
        if (value.kind === "percent") {
            return `${value.value}%`;
        }

        return `${value.value}${value.unit}`;
    }

    private _isDefaultShape(shape: GradientRadialShape): boolean {
        return shape === GradientRadial.DEFAULT_CONFIG.shape;
    }

    private _isDefaultSize(size: GradientRadialSize): boolean {
        return (
            size.kind === "extent" &&
            GradientRadial.DEFAULT_CONFIG.size.kind === "extent" &&
            size.value === GradientRadial.DEFAULT_CONFIG.size.value
        );
    }

    private _isDefaultPosition(position: GradientPosition): boolean {
        const defaultPosition = GradientRadial.DEFAULT_CONFIG.position;

        return (
            position.kind === "keywords" &&
            defaultPosition.kind === "keywords" &&
            position.x === defaultPosition.x &&
            position.y === defaultPosition.y
        );
    }

    private _isDefaultInterpolation(interpolation: GradientInterpolation): boolean {
        return (
            interpolation.colorSpace ===
                GradientRadial.DEFAULT_CONFIG.interpolation.colorSpace &&
            interpolation.hue === undefined
        );
    }

    private _validateSize(size: GradientRadialSize): void {
        if (typeof size !== "object" || size === null) {
            throw new TypeError("Radial gradient size must be an object");
        }

        if (size.kind === "extent") {
            if (!GradientRadial._isExtent(size.value)) {
                throw new TypeError(
                    `Invalid radial gradient extent: "${String(size.value)}"`,
                );
            }
            return;
        }

        if (size.kind === "explicit") {
            this._validateLengthPercentage(size.x);

            if (size.y !== undefined) {
                this._validateLengthPercentage(size.y);
            }
            return;
        }

        throw new TypeError(
            `Invalid radial gradient size kind: "${String((size as { kind?: unknown }).kind)}"`,
        );
    }

    private _validatePosition(position: GradientPosition): void {
        if (typeof position !== "object" || position === null) {
            throw new TypeError("Radial gradient position must be an object");
        }

        if (position.kind === "keywords") {
            if (
                !GradientRadial._isPositionKeywordX(position.x) ||
                !GradientRadial._isPositionKeywordY(position.y)
            ) {
                throw new TypeError("Invalid radial gradient keyword position");
            }
            return;
        }

        if (position.kind === "values") {
            this._validateLengthPercentage(position.x);
            this._validateLengthPercentage(position.y);
            return;
        }

        throw new TypeError(
            `Invalid radial gradient position kind: "${String((position as { kind?: unknown }).kind)}"`,
        );
    }

    private _validateLengthPercentage(value: GradientLengthPercentage): void {
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

        if (value.kind === "length" && GradientRadial._isLengthUnit(value.unit)) {
            return;
        }

        throw new TypeError("Invalid gradient length-percentage");
    }
}
