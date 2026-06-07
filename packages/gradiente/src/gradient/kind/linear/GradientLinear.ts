import {
    parseStringToAbi,
    type GradientAbi,
} from "../../../abi";
import {
    angleValueFromString,
    degToRad,
    isAngle,
    normalizeAngleDeg,
    normalizeAngleRad,
    radToDeg,
} from "../../../utils";
import { GradientWithStopsBase } from "../base";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
    type GradientColorSpace,
    type GradientHueInterpolation,
} from "../hue";
import type {
    GradientLinearConfig,
    GradientLinearConfigInput,
    GradientLinearJSON,
    GradientLinearStop,
    GradientLinearType,
    IGradientLinear,
} from "./types";

type GradientLinearConfigToken =
    | {
        type: "angle";
        value: string;
    }
    | {
        type: "colorSpace";
        value: GradientColorSpace;
    }
    | {
        type: "hue";
        value: GradientHueInterpolation;
    };

export class GradientLinear
extends GradientWithStopsBase<GradientLinearStop, GradientLinearConfig>
implements IGradientLinear {
    private static readonly DEFAULT_CONFIG: GradientLinearConfig = {
        angle: Math.PI,
        interpolation: {
            colorSpace: "srgb",
        },
        isRepeating: false,
    };

    public declare readonly type: GradientLinearType;

    constructor(
        stops: GradientLinearStop[],
        config?: GradientLinearConfigInput,
    ) {
        super(
            "linear-gradient",
            stops,
            GradientLinear._resolveConfig(config),
        );
    }

    public static normalizeConfig(input: string): GradientLinearConfig {
        const tokens = GradientLinear._tokenizeConfigInput(input);
        const seen = new Set<GradientLinearConfigToken["type"]>();

        for (const token of tokens) {
            if (seen.has(token.type)) {
                throw new SyntaxError(
                    `Duplicate linear gradient config token: "${token.type}"`,
                );
            }

            seen.add(token.type);
        }

        const angleToken = tokens.find((token) => token.type === "angle");
        const colorSpaceToken = tokens.find((token) => token.type === "colorSpace");
        const hueToken = tokens.find((token) => token.type === "hue");

        return GradientLinear._resolveConfig({
            angle: angleToken
                ? GradientLinear._parseAngleToken(angleToken.value)
                : undefined,
            interpolation: {
                colorSpace:
                    colorSpaceToken?.value ??
                    GradientLinear.DEFAULT_CONFIG.interpolation.colorSpace,
                hue: hueToken?.value,
            },
        });
    }

    public static override fromString(input: string): GradientLinear {
        return GradientLinear.fromAbi(parseStringToAbi(input));
    }

    public static override fromAbi(abi: GradientAbi): GradientLinear {
        if (abi.functionName !== "linear-gradient") {
            throw new Error("Invalid function name for GradientLinear");
        }

        const config = abi.inputs[0]?.type === "config"
            ? GradientLinear.normalizeConfig(abi.inputs[0].value)
            : GradientLinear._resolveConfig();

        const inputsWithoutConfig = abi.inputs[0]?.type === "config"
            ? abi.inputs.slice(1)
            : abi.inputs;
        const stops = GradientLinear._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new GradientLinear(stops, {
            ...config,
            isRepeating: abi.isRepeating,
        });
    }

    public override clone(): this {
        const snapshot = this.toJSON();

        return new GradientLinear(snapshot.stops, snapshot.config) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof GradientLinear &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override toJSON(): GradientLinearJSON {
        return super.toJSON() as GradientLinearJSON;
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

    protected override _validateConfig(config: GradientLinearConfig): void {
        if (
            typeof config.angle !== "number" ||
            !Number.isFinite(config.angle)
        ) {
            throw new TypeError("Linear gradient angle must be a finite number");
        }

        if (
            config.isRepeating !== undefined &&
            typeof config.isRepeating !== "boolean"
        ) {
            throw new TypeError("Linear gradient repeating flag must be a boolean");
        }

        if (
            typeof config.interpolation !== "object" ||
            config.interpolation === null
        ) {
            throw new TypeError("Linear gradient interpolation must be an object");
        }

        if (!isGradientColorSpace(config.interpolation.colorSpace)) {
            throw new TypeError(
                `Invalid linear gradient color space: "${String(config.interpolation.colorSpace)}"`,
            );
        }

        if (
            config.interpolation.hue !== undefined &&
            !isGradientHueInterpolation(config.interpolation.hue)
        ) {
            throw new TypeError(
                `Invalid linear gradient hue interpolation: "${String(config.interpolation.hue)}"`,
            );
        }
    }

    private static _resolveConfig(
        input: GradientLinearConfigInput = {},
    ): GradientLinearConfig {
        const interpolation = {
            ...GradientLinear.DEFAULT_CONFIG.interpolation,
            ...input.interpolation,
        };

        return {
            angle: normalizeAngleRad(
                input.angle ?? GradientLinear.DEFAULT_CONFIG.angle,
            ),
            interpolation,
            isRepeating:
                input.isRepeating ?? GradientLinear.DEFAULT_CONFIG.isRepeating,
        };
    }

    private static _parseAngleToken(input: string): number {
        if (!input.startsWith("to ")) {
            return normalizeAngleRad(angleValueFromString(input));
        }

        const tokens = input
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (tokens.length === 0) {
            throw new SyntaxError("Linear gradient angle keyword cannot be empty");
        }

        if (tokens[0] !== "to") {
            throw new SyntaxError(
                "Linear gradient keyword direction must start with \"to\"",
            );
        }

        const directions = tokens.slice(1);

        if (directions.length === 0 || directions.length > 2) {
            throw new SyntaxError(
                "Linear gradient keyword direction must contain one or two direction tokens",
            );
        }

        const allowed = new Set(["top", "right", "bottom", "left"]);

        for (const direction of directions) {
            if (!allowed.has(direction)) {
                throw new SyntaxError(
                    `Invalid linear gradient direction token: "${direction}"`,
                );
            }
        }

        if (new Set(directions).size !== directions.length) {
            throw new SyntaxError(
                "Linear gradient keyword direction cannot contain duplicate tokens",
            );
        }

        const hasTop = directions.includes("top");
        const hasRight = directions.includes("right");
        const hasBottom = directions.includes("bottom");
        const hasLeft = directions.includes("left");

        if ((hasTop && hasBottom) || (hasLeft && hasRight)) {
            throw new SyntaxError(
                "Linear gradient keyword direction contains conflicting tokens",
            );
        }

        if (hasTop && hasLeft) {
            return degToRad(315);
        }

        if (hasTop && hasRight) {
            return degToRad(45);
        }

        if (hasBottom && hasLeft) {
            return degToRad(225);
        }

        if (hasBottom && hasRight) {
            return degToRad(135);
        }

        if (hasTop) {
            return degToRad(0);
        }

        if (hasRight) {
            return degToRad(90);
        }

        if (hasBottom) {
            return degToRad(180);
        }

        if (hasLeft) {
            return degToRad(270);
        }

        throw new SyntaxError(
            `Unsupported linear gradient keyword direction: "${input}"`,
        );
    }

    private static _tokenizeConfigInput(
        input: string,
    ): GradientLinearConfigToken[] {
        const value = input.trim().toLowerCase();

        if (value.length === 0) {
            throw new SyntaxError("Linear gradient config cannot be empty");
        }

        const parts = value.split(/\s+/);
        const tokens: GradientLinearConfigToken[] = [];

        for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];

            if (part === "in") {
                const colorSpace = parts[index + 1];

                if (
                    colorSpace === undefined ||
                    !isGradientColorSpace(colorSpace)
                ) {
                    throw new SyntaxError("Expected color space after \"in\"");
                }

                tokens.push({
                    type: "colorSpace",
                    value: colorSpace,
                });

                index += 1;
                continue;
            }

            if (isAngle(part)) {
                tokens.push({
                    type: "angle",
                    value: part,
                });

                continue;
            }

            if (part === "to") {
                const directionParts: string[] = [];
                const firstDirection = parts[index + 1];
                const secondDirection = parts[index + 2];

                if (firstDirection !== undefined) {
                    directionParts.push(firstDirection);
                }

                if (
                    secondDirection === "left" ||
                    secondDirection === "right"
                ) {
                    directionParts.push(secondDirection);
                }

                tokens.push({
                    type: "angle",
                    value: `to ${directionParts.join(" ")}`,
                });

                index += directionParts.length;
                continue;
            }

            if (isGradientHueInterpolation(part)) {
                const nextPart = parts[index + 1];

                if (nextPart !== "hue") {
                    throw new SyntaxError(`Expected "hue" after "${part}"`);
                }

                tokens.push({
                    type: "hue",
                    value: part,
                });

                index += 1;
                continue;
            }

            throw new SyntaxError(`Unknown linear gradient config token: "${part}"`);
        }

        return tokens;
    }

    private _serializeConfig(config: GradientLinearConfig): string {
        const parts = [
            this._serializeAngle(config.angle),
            this._serializeInterpolation(config.interpolation),
        ].filter(Boolean);

        return parts.join(" ");
    }

    private _serializeAngle(angle: number): string {
        const angleDeg = normalizeAngleDeg(radToDeg(angle), 3);

        switch (angleDeg) {
            case 0:
                return "to top";
            case 45:
                return "to top right";
            case 90:
                return "to right";
            case 135:
                return "to bottom right";
            case 180:
                return "";
            case 225:
                return "to bottom left";
            case 270:
                return "to left";
            case 315:
                return "to top left";
            default:
                return `${angleDeg}deg`;
        }
    }

    private _serializeInterpolation(
        interpolation: GradientLinearConfig["interpolation"],
    ): string {
        if (this._isDefaultInterpolation(interpolation)) {
            return "";
        }

        const { colorSpace, hue } = interpolation;

        if (hue === undefined) {
            return `in ${colorSpace}`;
        }

        return `in ${colorSpace} ${hue} hue`;
    }

    private _isDefaultInterpolation(
        interpolation: GradientLinearConfig["interpolation"],
    ): boolean {
        return (
            interpolation.colorSpace ===
                GradientLinear.DEFAULT_CONFIG.interpolation.colorSpace &&
            interpolation.hue === undefined
        );
    }
}
