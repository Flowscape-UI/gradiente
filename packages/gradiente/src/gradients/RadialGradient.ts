
import { parseStringToAbi, splitTopLevelByWhitespace, type GradientAbi, type GradientAbiInput } from "../abi";
import { GradientBase, type GradientData } from "./GradientBase";
import type { GradientCommonConfig, GradientLengthPercentage, GradientPosition } from "./types";

export type RadialGradientShape = "circle" | "ellipse";

export type RadialGradientExtent =
    | "closest-side"
    | "closest-corner"
    | "farthest-side"
    | "farthest-corner";

export type RadialGradientSize =
    | {
        kind: "extent";
        value: RadialGradientExtent;
    }
    | {
        kind: "explicit";
        x: GradientLengthPercentage;
        y?: GradientLengthPercentage;
    };

export type RadialGradientConfig = GradientCommonConfig & {
    shape: RadialGradientShape;
    size: RadialGradientSize;
    position: GradientPosition;
};

export class RadialGradient extends GradientBase<RadialGradientConfig> {
    public readonly type = "radial-gradient";
    constructor(config: GradientData<RadialGradientConfig>) {
        super(config);
    }

    public static fromString(input: string): RadialGradient {
        return RadialGradient.fromAbi(parseStringToAbi(input));
    }

    public static fromAbi(abi: GradientAbi): RadialGradient {
        if (abi.functionName !== "radial-gradient") {
            throw new Error("Invalid function name for RadialGradient");
        }

        const config = this._parseConfig(abi.inputs);
        const inputsWithoutConfig = abi.inputs[0]?.type === 'config' ? abi.inputs.slice(1) : abi.inputs;
        const stops = this._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new RadialGradient({
            isRepeating: abi.isRepeating,
            config,
            stops,
        });
    }

    public override clone(): this {
        return new RadialGradient(this.toJSON()) as this;
    }

    public override toString(): string {
        const functionName = this.isRepeating
            ? `repeating-${this.type}`
            : this.type;

        const configStr = this._serializeRadialConfig(this.config);
        const stops = this._serializeStopsCompact();

        const parts = [
            configStr,
            ...stops
        ].filter(Boolean);

        return `${functionName}(${parts.join(', ')})`;
    }

    protected override _validateConfig(config: RadialGradientConfig): void {
        if (config.shape !== "circle" && config.shape !== "ellipse") {
            throw new Error("Invalid shape");
        }
        if (!config.position) {
            throw new Error("Position is required");
        }
        if (!config.size) {
            throw new Error("Size is required");
        }
    }


    private _serializeRadialConfig(config: RadialGradientConfig): string {
        const parts: string[] = [];

        // shape
        parts.push(config.shape);

        // size
        if (config.size.kind === "extent") {
            parts.push(config.size.value);
        } else {
            const x = this._formatLengthPercentage(config.size.x);
            const y = config.size.y ? ` ${this._formatLengthPercentage(config.size.y)}` : "";
            parts.push(`${x}${y}`);
        }

        // position
        parts.push(`at ${this._serializePosition(config.position)}`);

        // interpolation (если есть)
        if (config.interpolation) {
            if (config.interpolation.kind === "rectangular") {
                parts.push(`in ${config.interpolation.space}`);
            } else {
                let str = `in ${config.interpolation.space}`;
                if (config.interpolation.hueMethod) {
                    str += ` ${config.interpolation.hueMethod} hue`;
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

    private static _parseConfig(inputs: GradientAbiInput[]): RadialGradientConfig {
        let shape: RadialGradientShape = "ellipse";
        let size: RadialGradientSize = {
            kind: "extent",
            value: "farthest-corner",
        };
        let position: GradientPosition = {
            kind: "keywords",
            x: "center",
            y: "center",
        };

        for (const input of inputs) {
            if (input.type !== "config") continue;

            const tokens = splitTopLevelByWhitespace(input.value);

            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i];

                // shape
                if (t === "circle" || t === "ellipse") {
                    shape = t;
                    continue;
                }

                // size
                if (
                    t === "closest-side" ||
                    t === "closest-corner" ||
                    t === "farthest-side" ||
                    t === "farthest-corner"
                ) {
                    size = { kind: "extent", value: t };
                    continue;
                }

                // position
                if (t === "at") {
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
                        position = {
                            kind: "keywords",
                            x: xToken,
                            y: yToken,
                        };
                    } else {
                        position = {
                            kind: "values",
                            x: this._parseLengthPercentage(xToken),
                            y: this._parseLengthPercentage(yToken),
                        };
                    }

                    i += 2;
                    continue;
                }
            }
        }

        return { shape, size, position };
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
}