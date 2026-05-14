import { parseStringToAbi, type GradientAbi } from "../abi";
import {
    angleValueFromString,
    degToRad,
    isAngle,
    normalizeAngleDeg,
    normalizeAngleRad,
    radToDeg
} from "../utils";
import {
    GradientBase,
    type GradientData
} from "./GradientBase";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
    isGradientPolarColorSpace,
    type GradientColorSpace,
    type GradientHueInterpolation
} from "./helpers";


export type GradientInterpolation = {
    colorSpace: GradientColorSpace;
    hue?: GradientHueInterpolation;
};

export type LinearGradientConfig = {
    angle: number,
    interpolation?: GradientInterpolation,
}

type LinearGradientConfigToken =
    | {
        type: 'angle';
        value: string;
    }
    | {
        type: 'colorSpace';
        value: GradientColorSpace;
    }
    | {
        type: 'hue';
        value: GradientHueInterpolation;
    };

export class LinearGradient extends GradientBase<LinearGradientConfig> {
    public readonly type = "linear-gradient";
    constructor(config: GradientData<LinearGradientConfig>) {
        config.config.angle = normalizeAngleRad(config.config.angle);
        if (config.config.interpolation) {
            config.config.interpolation = LinearGradient._normalizeConfigInterpolation(config.config.interpolation);
        }
        super(config);
    }

    public static normalizeConfig(value: string): LinearGradientConfig {
        const tokenizedValue = LinearGradient._tokenizeConfigInput(value);

        // Check for dublicates
        const seen = new Set<LinearGradientConfigToken['type']>();
        for (const token of tokenizedValue) {
            if (seen.has(token.type)) {
                throw new SyntaxError(
                    `Duplicate linear gradient config token: "${token.type}"`
                );
            }
            seen.add(token.type);
        }

        // Continue assebling config
        const angleToken = tokenizedValue.find((token) => token.type === 'angle');
        const colorSpaceToken = tokenizedValue.find((token) => token.type === 'colorSpace');
        const hueToken = tokenizedValue.find((token) => token.type === 'hue');
        const assembledConfig: Required<LinearGradientConfig> = {
            angle: 3.141593,
            interpolation: {
                hue: "shorter",
                colorSpace: "oklab",
            }
        };

        if (angleToken) {
            const value = angleToken.value;
            if (value.startsWith("to ")) {
                const tokens = value
                    .trim()
                    .toLowerCase()
                    .split(/\s+/)
                    .filter(Boolean);

                if (tokens.length === 0) {
                    throw new SyntaxError("Linear gradient angle keyword cannot be empty");
                }
                if (tokens[0] !== "to") {
                    throw new SyntaxError("Linear gradient keyword direction must start with \"to\"");
                }

                const directions = tokens.slice(1);
                if (directions.length === 0 || directions.length > 2) {
                    throw new SyntaxError("Linear gradient keyword direction must contain one or two direction tokens");
                }

                const allowed = new Set(["top", "right", "bottom", "left"]);
                for (const direction of directions) {
                    if (!allowed.has(direction)) {
                        throw new SyntaxError(`Invalid linear gradient direction token: "${direction}"`);
                    }
                }

                if (new Set(directions).size !== directions.length) {
                    throw new SyntaxError("Linear gradient keyword direction cannot contain duplicate tokens");
                }

                const hasTop = directions.includes("top");
                const hasRight = directions.includes("right");
                const hasBottom = directions.includes("bottom");
                const hasLeft = directions.includes("left");

                if ((hasTop && hasBottom) || (hasLeft && hasRight)) {
                    throw new SyntaxError("Linear gradient keyword direction contains conflicting tokens");
                }

                if (hasTop && hasLeft) {
                    assembledConfig.angle = degToRad(315);
                } else if (hasTop && hasRight) {
                    assembledConfig.angle = degToRad(45);
                } else if (hasBottom && hasLeft) {
                    assembledConfig.angle = degToRad(225);
                } else if (hasBottom && hasRight) {
                    assembledConfig.angle = degToRad(135);
                } else if (hasTop) {
                    assembledConfig.angle = degToRad(0);
                } else if (hasRight) {
                    assembledConfig.angle = degToRad(90);
                } else if (hasBottom) {
                    assembledConfig.angle = degToRad(180);
                } else if (hasLeft) {
                    assembledConfig.angle = degToRad(270);
                } else {
                    throw new SyntaxError(`Unsupported linear gradient keyword direction: "${value}"`);
                }
            } else {
                assembledConfig.angle = normalizeAngleRad(angleValueFromString(value));
            }
        }
        if (colorSpaceToken) {
            assembledConfig.interpolation.colorSpace = colorSpaceToken.value;
        }
        if (hueToken) {
            assembledConfig.interpolation.hue = hueToken.value;
        }

        return assembledConfig;
    }

    public static fromString(input: string): LinearGradient {
        return LinearGradient.fromAbi(parseStringToAbi(input));
    }

    public static fromAbi(abi: GradientAbi): LinearGradient {
        let config = { angle: 3.141592 };

        if (abi.inputs[0].type === "config") {
            const inputValue = abi.inputs[0].value.trim().toLowerCase();
            if (inputValue.length === 0) {
                throw new SyntaxError("Linear gradient config cannot be empty");
            }
            config = LinearGradient.normalizeConfig(inputValue);
        }

        const inputsWithoutConfig = abi.inputs[0]?.type === "config" ? abi.inputs.slice(1) : abi.inputs;
        const stops = LinearGradient._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new LinearGradient({
            isRepeating: abi.isRepeating,
            config: config,
            stops: stops,
        });
    }

    public override clone(): this {
        return new LinearGradient(this.toJSON()) as this;
    }

    public override toString(): string {
        const functionName = this.isRepeating ? `repeating-${this.type}` : this.type;
        const configToString = this._parseConfigToString(this.config);
        const stops = this._serializeStopsCompact();
        const parts = [
            configToString,
            ...stops
        ].filter(Boolean);

        return `${functionName}(${parts.join(", ")})`;
    }

    protected override _validateConfig(_: LinearGradientConfig): void { }

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

    private _parseConfigToString(config: LinearGradientConfig): string {
        const { angle, interpolation } = config;
        const configParts: string[] = [];
        const angleString = this._parseAngleToString(angle);

        if (angleString.length > 0) {
            configParts.push(angleString);
        }

        if (interpolation !== undefined) {
            configParts.push(this._parseInterpolationToString(interpolation));
        }

        return configParts.join(" ");
    }

    private _parseAngleToString(angle: number): string {
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
                return ""; // default CSS direction
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

    private _parseInterpolationToString(
        interpolation: GradientInterpolation,
    ): string {
        const { colorSpace, hue } = interpolation;

        if (hue === undefined) {
            return `in ${colorSpace}`;
        }

        return `in ${colorSpace} ${hue} hue`;
    }

    private static _tokenizeConfigInput(value: string): LinearGradientConfigToken[] {
        const inputValue = value.trim().toLowerCase();

        if (inputValue.length === 0) {
            throw new SyntaxError('Linear gradient config cannot be empty');
        }

        const parts = inputValue.split(/\s+/);
        const tokens: LinearGradientConfigToken[] = [];

        for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];

            if (part === 'in') {
                const colorSpace = parts[index + 1];

                if (colorSpace === undefined || !isGradientColorSpace(colorSpace)) {
                    throw new SyntaxError(`Expected color space after "in"`);
                }

                tokens.push({
                    type: 'colorSpace',
                    value: colorSpace,
                });

                index += 1;
                continue;
            }

            if (isAngle(part)) {
                tokens.push({
                    type: 'angle',
                    value: part,
                });

                continue;
            }

            if (part === 'to') {
                const directionParts: string[] = [];

                const firstDirection = parts[index + 1];
                const secondDirection = parts[index + 2];

                if (firstDirection !== undefined) {
                    directionParts.push(firstDirection);
                }

                if (
                    secondDirection === 'left' ||
                    secondDirection === 'right'
                ) {
                    directionParts.push(secondDirection);
                }

                const direction = `to ${directionParts.join(' ')}`;

                tokens.push({
                    type: 'angle',
                    value: direction,
                });

                index += directionParts.length;
                continue;
            }

            if (isGradientHueInterpolation(part)) {
                const nextPart = parts[index + 1];

                if (nextPart !== 'hue') {
                    throw new SyntaxError(`Expected "hue" after "${part}"`);
                }

                tokens.push({
                    type: 'hue',
                    value: part,
                });

                index += 1;
                continue;
            }

            throw new SyntaxError(`Unknown linear gradient config token: "${part}"`);
        }

        return tokens;
    }
}