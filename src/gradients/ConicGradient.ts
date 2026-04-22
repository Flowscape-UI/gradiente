import { parseStringToAbi, splitTopLevelByWhitespace, type GradientAbi } from "../abi";
import { GradientBase, type GradientData } from "./GradientBase";
import type {
    GradientAngleUnit,
    GradientAngleValue,
    GradientCommonConfig,
    GradientLengthPercentage,
    GradientPosition,
} from "./types";

export type ConicGradientConfig = GradientCommonConfig & {
    from: GradientAngleValue;
    position: GradientPosition;
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

        const parts = [
            configStr,
            ...stops
        ].filter(Boolean);

        return `${functionName}(${parts.join(', ')})`;
    }

    public static fromString(input: string): ConicGradient {
        return this.fromAbi(parseStringToAbi(input));
    }

    public static fromAbi(abi: GradientAbi): ConicGradient {
        if (abi.functionName !== "conic-gradient") {
            throw new Error("Invalid function name for ConicGradient");
        }

        const configInput = abi.inputs.find((input) => input.type === "config");
        const inputsWithoutConfig = abi.inputs.filter((input) => input.type !== "config");

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

        // from angle
        const angle = this.config.from;
        parts.push(`from ${angle.value}${angle.unit}`);

        // position
        parts.push(`at ${this._serializePosition(this.config.position)}`);

        // interpolation (если есть)
        if (this.config.interpolation) {
            const i = this.config.interpolation;

            if (i.kind === "rectangular") {
                parts.push(`in ${i.space}`);
            } else {
                let str = `in ${i.space}`;
                if (i.hueMethod) {
                    str += ` ${i.hueMethod} hue`;
                }
                parts.push(str);
            }
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

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token === "from") {
                config.from = this._parseAngle(tokens[i + 1]);
                i += 1;
                continue;
            }

            if (token === "at") {
                const xToken = tokens[i + 1];
                const yToken = tokens[i + 2];

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
                } else {
                    config.position = {
                        kind: "values",
                        x: this._parseLengthPercentage(xToken),
                        y: this._parseLengthPercentage(yToken),
                    };
                }

                i += 2;
                continue;
            }

            if (token === "in") {
                const space = tokens[i + 1];
                const hueMethod = tokens[i + 2];
                const hueKeyword = tokens[i + 3];

                if (
                    hueKeyword === "hue" &&
                    (
                        hueMethod === "shorter" ||
                        hueMethod === "longer" ||
                        hueMethod === "increasing" ||
                        hueMethod === "decreasing"
                    )
                ) {
                    config.interpolation = {
                        kind: "polar",
                        space,
                        hueMethod,
                    } as ConicGradientConfig["interpolation"];

                    i += 3;
                    continue;
                }

                config.interpolation = {
                    kind: "rectangular",
                    space,
                } as ConicGradientConfig["interpolation"];

                i += 1;
            }
        }

        return config;
    }

    private static _parseLengthPercentage(input: string): GradientLengthPercentage {
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