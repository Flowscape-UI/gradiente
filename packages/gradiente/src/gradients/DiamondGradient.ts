import {
    parseStringToAbi,
    type GradientAbi,
} from "../abi";
import {
    type GradientData,
    type GradientType
} from "./GradientBase";
import {
    RadialGradient,
    type RadialGradientConfig,
} from "./RadialGradient";

export type DiamondGradientConfig = RadialGradientConfig;

export class DiamondGradient extends RadialGradient {
    public readonly type: GradientType = "diamond-gradient";

    constructor(input: Partial<GradientData<DiamondGradientConfig>>) {
        super(input);
    }

    public static override fromString(input: string): DiamondGradient {
        return DiamondGradient.fromAbi(parseStringToAbi(input));
    }

    public static override fromAbi(abi: GradientAbi): DiamondGradient {
        if (abi.functionName !== "diamond-gradient") {
            throw new Error("Invalid function name for DiamondGradient");
        }

        const config = this._parseConfig(abi.inputs);
        const inputsWithoutConfig = abi.inputs[0]?.type === "config"
            ? abi.inputs.slice(1)
            : abi.inputs;
        const stops = this._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new DiamondGradient({
            isRepeating: abi.isRepeating,
            config,
            stops,
        });
    }

    public override clone(): this {
        return new DiamondGradient(this.toJSON()) as this;
    }
}
