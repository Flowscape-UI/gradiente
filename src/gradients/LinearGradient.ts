import { parseStringToAbi, type GradientAbi } from "../abi";
import { degToRad, gradToRad, normalizeAngleRad, radToDeg, roundTo, turnToRad, type AngleUnit } from "../utils";
import { GradientBase, type GradientData } from "./GradientBase";
import type { GradientCommonConfig } from "./types";

export type LinearGradientConfig = GradientCommonConfig & {
    angle: number,
}

export class LinearGradient extends GradientBase<LinearGradientConfig> {
    public readonly type = "linear-gradient";
    constructor(config: GradientData<LinearGradientConfig>) {
        super(config);
    }

    public static normalizeConfig(value: { value: number, unit: AngleUnit } | string): LinearGradientConfig {
        // 1) String keyword form
        if (typeof value === "string") {
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

            const allowed = new Set(['top', 'right', 'bottom', 'left']);
            for (const direction of directions) {
                if (!allowed.has(direction)) {
                    throw new SyntaxError(`Invalid linear gradient direction token: "${direction}"`);
                }
            }

            if (new Set(directions).size !== directions.length) {
                throw new SyntaxError("Linear gradient keyword direction cannot contain duplicate tokens");
            }

            const hasTop = directions.includes('top');
            const hasRight = directions.includes('right');
            const hasBottom = directions.includes('bottom');
            const hasLeft = directions.includes('left');

            if ((hasTop && hasBottom) || (hasLeft && hasRight)) {
                throw new SyntaxError("Linear gradient keyword direction contains conflicting tokens");
            }

            if (hasTop && hasLeft) {
                return { angle: degToRad(315) };
            } else if (hasTop && hasRight) {
                return { angle: degToRad(45) };
            } else if (hasBottom && hasLeft) {
                return { angle: degToRad(225) };
            } else if (hasBottom && hasRight) {
                return { angle: degToRad(135) };
            } else if (hasTop) {
                return { angle: degToRad(0) };
            } else if (hasRight) {
                return { angle: degToRad(90) };
            } else if (hasBottom) {
                return { angle: degToRad(180) };
            } else if (hasLeft) {
                return { angle: degToRad(270) };
            }

            throw new SyntaxError(`Unsupported linear gradient keyword direction: "${value}"`);
        }

        // 2) Numeric angle form
        switch (value.unit) {
            case 'deg':
                return { angle: normalizeAngleRad(degToRad(value.value)) };
            case 'rad':
                return { angle: normalizeAngleRad(value.value) };
            case 'turn':
                return { angle: normalizeAngleRad(turnToRad(value.value)) };
            case 'grad':
                return { angle: normalizeAngleRad(gradToRad(value.value)) };
            default:
                throw new SyntaxError(`Unsupported angle unit: "${value.unit}"`);
        }
    }

    public static fromString(input: string): LinearGradient {
        return LinearGradient.fromAbi(parseStringToAbi(input));
    }

    public static fromAbi(abi: GradientAbi): LinearGradient {
        let config = { angle: 0 };
        if (abi.inputs[0].type === 'config') {
            const inputValue = abi.inputs[0].value.trim().toLowerCase();
            if (inputValue.length === 0) {
                throw new SyntaxError('Linear gradient config cannot be empty');
            }
            if (inputValue.startsWith('to ')) {
                config = LinearGradient.normalizeConfig(inputValue);
            } else {
                const match = inputValue.match(
                    /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/i,
                );

                if (match === null) {
                    throw new SyntaxError(`Invalid linear gradient angle: "${inputValue}"`);
                }

                const rawValue = Number(match[1]);
                const unit = match[2].toLowerCase() as AngleUnit;

                if (!Number.isFinite(rawValue)) {
                    throw new SyntaxError(`Invalid linear gradient angle value: "${inputValue}"`);
                }

                config = LinearGradient.normalizeConfig({ value: rawValue, unit });
            }
        }

        const inputsWithoutConfig = abi.inputs[0]?.type === 'config' ? abi.inputs.slice(1) : abi.inputs;
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
        const configToString = this.config.angle === 0 ? '' : `${roundTo(radToDeg(this.config.angle), 3)}deg`;
        const stops = this._serializeStopsCompact();

        const parts = [
            configToString,
            ...stops
        ].filter(Boolean);

        return `${functionName}(${parts.join(', ')})`;
    }

    protected override _validateConfig(_: LinearGradientConfig): void { }
}