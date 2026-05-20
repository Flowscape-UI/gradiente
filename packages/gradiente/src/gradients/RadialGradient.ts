
import {
    parseStringToAbi,
    splitTopLevelByWhitespace,
    type GradientAbi,
    type GradientAbiInput
} from "../abi";
import type {
    GradientInterpolation,
    GradientLengthPercentage,
    GradientPosition
} from "./types";
import {
    GradientBase,
    type GradientData
} from "./GradientBase";
import { isGradientPolarColorSpace } from "./helpers";

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


export type RadialGradientConfig = {
    shape: RadialGradientShape;
    size: RadialGradientSize;
    position: GradientPosition;
    interpolation?: GradientInterpolation;
};

export class RadialGradient extends GradientBase<RadialGradientConfig> {
    private static readonly DEFAULT_CONFIG: GradientData<RadialGradientConfig> = {
        isRepeating: false,
        stops: [
            {
                type: "color-stop",
                value: "red",
                position: 0,
            },
            {
                type: "color-stop",
                value: "blue",
                position: 1,
            },
        ],
        config: {
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
        }
    };
    public readonly type = "radial-gradient";


    constructor(input: Partial<GradientData<RadialGradientConfig>>) {
        const config: GradientData<RadialGradientConfig> = {
            ...RadialGradient.DEFAULT_CONFIG,
            ...input,
        };
        if (config.config.interpolation) {
            config.config.interpolation = RadialGradient._normalizeConfigInterpolation(config.config.interpolation);
        }
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
        const functionName = this.isRepeating ? `repeating-${this.type}` : this.type;
        const configToString = this._parseConfigToString(this.config);
        const stops = this._serializeStopsCompact();
        const parts = [
            configToString,
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


    private _parseConfigToString(config: RadialGradientConfig): string {
        const configParts: string[] = [];

        const radialConfigString = this._parseRadialConfigToString(config);

        if (radialConfigString.length > 0) {
            configParts.push(radialConfigString);
        }

        if (config.interpolation !== undefined) {
            configParts.push(this._parseInterpolationToString(config.interpolation));
        }

        return configParts.join(" ");
    }

    private _parseRadialConfigToString(config: RadialGradientConfig): string {
        const parts: string[] = [];

        if (!this._isDefaultRadialShape(config.shape)) {
            parts.push(config.shape);
        }

        if (!this._isDefaultRadialSize(config.size)) {
            parts.push(this._parseRadialSizeToString(config.size));
        }

        if (!this._isDefaultRadialPosition(config.position)) {
            parts.push(`at ${this._serializePosition(config.position)}`);
        }

        return parts.join(" ");
    }

    private _parseRadialSizeToString(size: RadialGradientSize): string {
        if (size.kind === "extent") {
            return size.value;
        }

        const x = this._formatLengthPercentage(size.x);

        if (size.y === undefined) {
            return x;
        }

        const y = this._formatLengthPercentage(size.y);

        return `${x} ${y}`;
    }

    private _parseInterpolationToString(
        interpolation: GradientInterpolation,
    ): string {
        const { colorSpace, hue } = interpolation;

        if (hue === undefined) {
            return `in ${colorSpace}`;
        }

        return `in ${colorSpace} ${hue} hue`;
    }

    private _isDefaultRadialShape(shape: RadialGradientShape): boolean {
        return shape === "ellipse";
    }

    private _isDefaultRadialSize(size: RadialGradientSize): boolean {
        return size.kind === "extent" && size.value === "farthest-corner";
    }

    private _isDefaultRadialPosition(position: GradientPosition): boolean {
        return (
            position.kind === "keywords" &&
            position.x === "center" &&
            position.y === "center"
        );
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
        let interpolation: GradientInterpolation | undefined;

        const isLengthPercentage = (value: string | undefined): value is string => {
            if (value === undefined) {
                return false;
            }

            return (
                value.endsWith("%") ||
                /^-?\d*\.?\d+[a-zA-Z]+$/.test(value)
            );
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

                // extent size
                if (
                    t === "closest-side" ||
                    t === "closest-corner" ||
                    t === "farthest-side" ||
                    t === "farthest-corner"
                ) {
                    size = { kind: "extent", value: t };
                    continue;
                }

                // explicit size:
                // circle 40%
                // ellipse 35% 70%
                if (isLengthPercentage(t)) {
                    const nextToken = tokens[i + 1];

                    if (shape === "ellipse" && isLengthPercentage(nextToken)) {
                        size = {
                            kind: "explicit",
                            x: this._parseLengthPercentage(t),
                            y: this._parseLengthPercentage(nextToken),
                        };

                        i += 1;
                        continue;
                    }

                    size = {
                        kind: "explicit",
                        x: this._parseLengthPercentage(t),
                    };

                    continue;
                }

                // position
                if (t === "at") {
                    const xToken = tokens[i + 1];
                    const yToken = tokens[i + 2];

                    // at center
                    if (
                        xToken === "center" &&
                        (yToken === undefined || yToken === "in")
                    ) {
                        position = {
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
                        position = {
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
                        position = {
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
                        position = {
                            kind: "keywords",
                            x: xToken,
                            y: yToken,
                        };

                        i += 2;
                        continue;
                    }

                    if (isLengthPercentage(xToken) && isLengthPercentage(yToken)) {
                        position = {
                            kind: "values",
                            x: this._parseLengthPercentage(xToken),
                            y: this._parseLengthPercentage(yToken),
                        };

                        i += 2;
                        continue;
                    }

                    throw new Error(
                        `Invalid radial-gradient position: ${xToken ?? ""} ${yToken ?? ""}`,
                    );
                }

                // interpolation
                if (t === "in") {
                    const colorSpace = tokens[i + 1];
                    const maybeHue = tokens[i + 2];
                    const maybeHueKeyword = tokens[i + 3];

                    if (!colorSpace) {
                        throw new Error("Invalid radial-gradient interpolation: missing color space");
                    }

                    if (
                        maybeHue !== undefined &&
                        maybeHueKeyword === "hue"
                    ) {
                        interpolation = this._normalizeConfigInterpolation({
                            colorSpace: colorSpace as any,
                            hue: maybeHue as any,
                        });

                        i += 3;
                        continue;
                    }

                    interpolation = this._normalizeConfigInterpolation({
                        colorSpace: colorSpace as any,
                    });

                    i += 1;
                    continue;
                }
            }
        }

        return { shape, size, position, interpolation };
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

    private static _normalizeConfigInterpolation(value: GradientInterpolation): GradientInterpolation {
        const { colorSpace, hue } = value;

        if (hue === undefined) {
            return { colorSpace };
        }

        if (!isGradientPolarColorSpace(colorSpace)) {
            return { colorSpace };
        }

        return {
            colorSpace,
            hue,
        };
    }

}