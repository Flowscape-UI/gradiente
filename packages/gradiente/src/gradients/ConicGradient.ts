import {
    parseStringToAbi,
    splitTopLevelByWhitespace,
    type GradientAbi,
} from "../abi";
import { GradientBase, type GradientData } from "./GradientBase";
import type {
    GradientAngleUnit,
    GradientAngleValue,
    GradientInterpolation,
    GradientLengthPercentage,
    GradientPosition,
} from "./types";

export type ConicGradientConfig = {
    from: GradientAngleValue;
    position: GradientPosition;
    interpolation?: GradientInterpolation;
};

export class ConicGradient extends GradientBase<ConicGradientConfig> {
    public override readonly type = "conic-gradient";

    constructor(config: GradientData<ConicGradientConfig>) {
        super(config);
    }

    public override clone(): this {
        return new ConicGradient(this.toJSON()) as this;
    }

    public override toString(): string {
        const functionName = this.isRepeating
            ? `repeating-${this.type}`
            : this.type;

        const configStr = this._serializeConfig();
        const stops = this._serializeStopsCompact();

        const parts = [configStr, ...stops].filter(Boolean);

        return `${functionName}(${parts.join(", ")})`;
    }

    public static fromString(input: string): ConicGradient {
        return this.fromAbi(parseStringToAbi(input));
    }

    public static fromAbi(abi: GradientAbi): ConicGradient {
        if (abi.functionName !== "conic-gradient") {
            throw new Error("Invalid function name for ConicGradient");
        }

        const configInput = abi.inputs.find((input) => input.type === "config");
        const inputsWithoutConfig = abi.inputs.filter(
            (input) => input.type !== "config",
        );

        const config = this._parseConfig(configInput?.value);
        const stops = this._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new ConicGradient({
            isRepeating: abi.isRepeating,
            config,
            stops,
        });
    }

    protected override _validateConfig(config: ConicGradientConfig): void {
        void config;
    }

    private _serializeConfig(): string {
        const parts: string[] = [];

        if (!this._isDefaultFrom(this.config.from)) {
            const angle = this.config.from;
            parts.push(`from ${angle.value}${angle.unit}`);
        }

        if (!this._isDefaultPosition(this.config.position)) {
            parts.push(`at ${this._serializePosition(this.config.position)}`);
        }

        if (this.config.interpolation !== undefined) {
            parts.push(this._serializeInterpolation(this.config.interpolation));
        }

        return parts.join(" ");
    }

    private _serializePosition(position: GradientPosition): string {
        if (position.kind === "keywords") {
            return `${position.x} ${position.y}`;
        }
        const x = this._formatLengthPercentage(position.x);
        const y = position.y ? this._formatLengthPercentage(position.y) : "";
        return y === "" ? x : `${x} ${y}`;
    }

    private _formatLengthPercentage(value: GradientLengthPercentage): string {
        if (value.kind === "percent") {
            return `${value.value}%`;
        }
        return `${value.value}${value.unit}`;
    }


    private _serializeInterpolation(interpolation: GradientInterpolation): string {
        const { colorSpace, hue } = interpolation;

        if (hue === undefined) {
            return `in ${colorSpace}`;
        }

        return `in ${colorSpace} ${hue} hue`;
    }

    private _isDefaultFrom(from: GradientAngleValue): boolean {
        return from.value === 0 && from.unit === "deg";
    }

    private _isDefaultPosition(position: GradientPosition): boolean {
        return (
            position.kind === "keywords" &&
            position.x === "center" &&
            position.y === "center"
        );
    }

    private static _parseConfig(input?: string): ConicGradientConfig {
        const config: ConicGradientConfig = {
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
        };

        if (!input) {
            return config;
        }

        const tokens = splitTopLevelByWhitespace(input);

        const isLengthPercentage = (value: string | undefined): value is string => {
            if (value === undefined) {
                return false;
            }

            return (
                value.endsWith("%") ||
                /^-?\d*\.?\d+[a-zA-Z]+$/.test(value)
            );
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token === "from") {
                const angleToken = tokens[i + 1];

                if (angleToken === undefined) {
                    throw new Error("Invalid conic-gradient config: missing angle after from");
                }

                config.from = this._parseAngle(angleToken);
                i += 1;
                continue;
            }

            if (token === "at") {
                const xToken = tokens[i + 1];
                const yToken = tokens[i + 2];

                if (xToken === undefined) {
                    throw new Error("Invalid conic-gradient config: missing position after at");
                }

                // at center
                if (
                    xToken === "center" &&
                    (yToken === undefined || yToken === "in")
                ) {
                    config.position = {
                        kind: "keywords",
                        x: "center",
                        y: "center",
                    };

                    i += 1;
                    continue;
                }

                // at left / at right
                if (
                    (xToken === "left" || xToken === "right") &&
                    (yToken === undefined || yToken === "in")
                ) {
                    config.position = {
                        kind: "keywords",
                        x: xToken,
                        y: "center",
                    };

                    i += 1;
                    continue;
                }

                // at top / at bottom
                if (
                    (xToken === "top" || xToken === "bottom") &&
                    (yToken === undefined || yToken === "in")
                ) {
                    config.position = {
                        kind: "keywords",
                        x: "center",
                        y: xToken,
                    };

                    i += 1;
                    continue;
                }

                const isKeywordPosition =
                    (
                        xToken === "left" ||
                        xToken === "center" ||
                        xToken === "right"
                    ) &&
                    (
                        yToken === "top" ||
                        yToken === "center" ||
                        yToken === "bottom"
                    );

                if (isKeywordPosition) {
                    config.position = {
                        kind: "keywords",
                        x: xToken,
                        y: yToken,
                    };

                    i += 2;
                    continue;
                }

                if (isLengthPercentage(xToken) && isLengthPercentage(yToken)) {
                    config.position = {
                        kind: "values",
                        x: this._parseLengthPercentage(xToken),
                        y: this._parseLengthPercentage(yToken),
                    };

                    i += 2;
                    continue;
                }

                throw new Error(
                    `Invalid conic-gradient position: ${xToken} ${yToken ?? ""}`,
                );
            }

            if (token === "in") {
                const colorSpace = tokens[i + 1];
                const maybeHue = tokens[i + 2];
                const maybeHueKeyword = tokens[i + 3];

                if (colorSpace === undefined) {
                    throw new Error("Invalid conic-gradient interpolation: missing color space");
                }

                if (
                    maybeHueKeyword === "hue" &&
                    (
                        maybeHue === "shorter" ||
                        maybeHue === "longer" ||
                        maybeHue === "increasing" ||
                        maybeHue === "decreasing"
                    )
                ) {
                    config.interpolation = {
                        colorSpace: colorSpace as any,
                        hue: maybeHue as any,
                    };

                    i += 3;
                    continue;
                }

                config.interpolation = {
                    colorSpace: colorSpace as any,
                };

                i += 1;
                continue;
            }
        }

        return config;
    }

    private static _parseLengthPercentage(
        input: string,
    ): GradientLengthPercentage {
        if (input.endsWith("%")) {
            return {
                kind: "percent",
                value: parseFloat(input),
            };
        }

        const match = input.match(/^(-?\d*\.?\d+)([a-zA-Z]+)$/);

        if (!match) {
            throw new Error(`Invalid length-percentage: ${input}`);
        }

        return {
            kind: "length",
            value: parseFloat(match[1]),
            unit: match[2] as any,
        };
    }

    private static _parseAngle(input: string): GradientAngleValue {
        const match = input.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)$/);

        if (!match) {
            throw new Error(`Invalid angle: ${input}`);
        }

        return {
            kind: "angle",
            value: Number(match[1]),
            unit: match[2] as GradientAngleUnit,
        };
    }
}
