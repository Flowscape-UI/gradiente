import {
    parseStringToAbi,
    splitTopLevelByWhitespace,
    type GradientAbi,
} from "../../../abi";
import {
    formatGradientAngle,
    formatGradientPosition,
    isDefaultGradientPosition,
    parseGradientAngle,
    parseGradientPosition,
    validateGradientAngle,
    validateGradientPosition,
    type GradientInterpolation,
} from "../base";
import { GradientWithStopsBase } from "../base";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
} from "../hue";
import type {
    GradientConicConfig,
    GradientConicConfigInput,
    GradientConicJSON,
    GradientConicStop,
    GradientConicType,
    IGradientConic,
} from "./types";

export class GradientConic
extends GradientWithStopsBase<GradientConicStop, GradientConicConfig>
implements IGradientConic {
    private static readonly DEFAULT_CONFIG: GradientConicConfig = {
        from: {
            kind: "angle",
            value: 0,
            unit: "deg",
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

    public declare readonly type: GradientConicType;

    constructor(
        stops: GradientConicStop[],
        config?: GradientConicConfigInput,
    ) {
        super(
            "conic-gradient",
            stops,
            GradientConic._resolveConfig(config),
        );
    }

    public static normalizeConfig(input: string): GradientConicConfig {
        const value = input.trim().toLowerCase();

        if (value.length === 0) {
            throw new SyntaxError("Conic gradient config cannot be empty");
        }

        return GradientConic._parseConfigInput(value);
    }

    public static override fromString(input: string): GradientConic {
        return GradientConic.fromAbi(parseStringToAbi(input));
    }

    public static override fromAbi(abi: GradientAbi): GradientConic {
        if (abi.functionName !== "conic-gradient") {
            throw new Error("Invalid function name for GradientConic");
        }

        const configInput = abi.inputs.find((input) => input.type === "config");
        const config = configInput
            ? GradientConic.normalizeConfig(configInput.value)
            : GradientConic._resolveConfig();
        const inputsWithoutConfig = abi.inputs.filter(
            (input) => input.type !== "config",
        );
        const stops = GradientConic._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new GradientConic(stops, {
            ...config,
            isRepeating: abi.isRepeating,
        });
    }

    public override clone(): this {
        const snapshot = this.toJSON();

        return new GradientConic(snapshot.stops, snapshot.config) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof GradientConic &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override minColorStopsCount(): number {
        return 2;
    }

    public override toJSON(): GradientConicJSON {
        return super.toJSON() as GradientConicJSON;
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

    protected override _validateConfig(config: GradientConicConfig): void {
        validateGradientAngle(config.from);
        validateGradientPosition(config.position);

        if (
            config.isRepeating !== undefined &&
            typeof config.isRepeating !== "boolean"
        ) {
            throw new TypeError("Conic gradient repeating flag must be a boolean");
        }

        if (
            typeof config.interpolation !== "object" ||
            config.interpolation === null
        ) {
            throw new TypeError("Conic gradient interpolation must be an object");
        }

        if (!isGradientColorSpace(config.interpolation.colorSpace)) {
            throw new TypeError(
                `Invalid conic gradient color space: "${String(config.interpolation.colorSpace)}"`,
            );
        }

        if (
            config.interpolation.hue !== undefined &&
            !isGradientHueInterpolation(config.interpolation.hue)
        ) {
            throw new TypeError(
                `Invalid conic gradient hue interpolation: "${String(config.interpolation.hue)}"`,
            );
        }
    }

    private static _resolveConfig(
        input: GradientConicConfigInput = {},
    ): GradientConicConfig {
        const interpolation = {
            ...GradientConic.DEFAULT_CONFIG.interpolation,
            ...input.interpolation,
        };

        return {
            from: structuredClone(
                input.from ?? GradientConic.DEFAULT_CONFIG.from,
            ),
            position: structuredClone(
                input.position ?? GradientConic.DEFAULT_CONFIG.position,
            ),
            interpolation,
            isRepeating:
                input.isRepeating ?? GradientConic.DEFAULT_CONFIG.isRepeating,
        };
    }

    private static _parseConfigInput(input: string): GradientConicConfig {
        const tokens = splitTopLevelByWhitespace(input);
        const config: GradientConicConfigInput = {};
        let seenFrom = false;
        let seenPosition = false;
        let seenInterpolation = false;

        for (let index = 0; index < tokens.length; index += 1) {
            const token = tokens[index];

            if (token === "from") {
                if (seenFrom) {
                    throw new SyntaxError("Duplicate conic gradient from angle");
                }

                const angle = tokens[index + 1];

                if (angle === undefined) {
                    throw new SyntaxError(
                        "Invalid conic-gradient config: missing angle after from",
                    );
                }

                config.from = parseGradientAngle(angle);
                seenFrom = true;
                index += 1;
                continue;
            }

            if (token === "at") {
                if (seenPosition) {
                    throw new SyntaxError("Duplicate conic gradient position");
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

                config.position = parseGradientPosition(positionTokens);
                seenPosition = true;
                index += positionTokens.length;
                continue;
            }

            if (token === "in") {
                if (seenInterpolation) {
                    throw new SyntaxError("Duplicate conic gradient interpolation");
                }

                const colorSpace = tokens[index + 1];

                if (
                    colorSpace === undefined ||
                    !isGradientColorSpace(colorSpace)
                ) {
                    throw new SyntaxError(
                        "Invalid conic-gradient interpolation: missing color space",
                    );
                }

                const maybeHue = tokens[index + 2];
                const maybeHueKeyword = tokens[index + 3];

                if (maybeHue !== undefined) {
                    if (!isGradientHueInterpolation(maybeHue)) {
                        throw new SyntaxError(
                            `Invalid conic-gradient hue interpolation: "${maybeHue}"`,
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
                    seenInterpolation = true;
                    index += 3;
                    continue;
                }

                config.interpolation = {
                    colorSpace,
                };
                seenInterpolation = true;
                index += 1;
                continue;
            }

            throw new SyntaxError(`Unknown conic gradient config token: "${token}"`);
        }

        return GradientConic._resolveConfig(config);
    }

    private _serializeConfig(config: GradientConicConfig): string {
        const parts: string[] = [];

        if (!this._isDefaultFrom(config.from)) {
            parts.push(`from ${formatGradientAngle(config.from)}`);
        }

        if (!isDefaultGradientPosition(config.position)) {
            parts.push(`at ${formatGradientPosition(config.position)}`);
        }

        const interpolation = this._serializeInterpolation(config.interpolation);

        if (interpolation.length > 0) {
            parts.push(interpolation);
        }

        return parts.join(" ");
    }

    private _serializeInterpolation(interpolation: GradientInterpolation): string {
        if (this._isDefaultInterpolation(interpolation)) {
            return "";
        }

        if (interpolation.hue === undefined) {
            return `in ${interpolation.colorSpace}`;
        }

        return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
    }

    private _isDefaultFrom(
        from: GradientConicConfig["from"],
    ): boolean {
        return from.value === 0 && from.unit === "deg";
    }

    private _isDefaultInterpolation(
        interpolation: GradientInterpolation,
    ): boolean {
        return (
            interpolation.colorSpace ===
                GradientConic.DEFAULT_CONFIG.interpolation.colorSpace &&
            interpolation.hue === undefined
        );
    }
}
