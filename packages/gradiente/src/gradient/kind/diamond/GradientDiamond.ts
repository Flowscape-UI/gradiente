import {
    parseStringToAbi,
    type GradientAbi,
} from "../../../abi";
import { GradientRadial } from "../radial";
import type {
    GradientDiamondConfigInput,
    GradientDiamondJSON,
    GradientDiamondStop,
    GradientDiamondType,
    IGradientDiamond,
} from "./types";

export class GradientDiamond
extends GradientRadial<GradientDiamondType>
implements IGradientDiamond {
    protected static override readonly gradientType: string = "diamond-gradient";

    constructor(
        stops: GradientDiamondStop[],
        config?: GradientDiamondConfigInput,
    ) {
        super(stops, config);
    }

    public static override fromString(input: string): GradientDiamond {
        return GradientDiamond.fromAbi(parseStringToAbi(input));
    }

    public static override fromAbi(abi: GradientAbi): GradientDiamond {
        if (abi.functionName !== "diamond-gradient") {
            throw new Error("Invalid function name for GradientDiamond");
        }

        const config = this._parseConfig(abi.inputs);
        const inputsWithoutConfig = abi.inputs[0]?.type === "config"
            ? abi.inputs.slice(1)
            : abi.inputs;
        const stops = this._normalizeAbiInputsToStops(inputsWithoutConfig);

        return new GradientDiamond(stops, {
            ...config,
            isRepeating: abi.isRepeating,
        });
    }

    public override clone(): this {
        const snapshot = this.toJSON();

        return new GradientDiamond(snapshot.stops, snapshot.config) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof GradientDiamond &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override toJSON(): GradientDiamondJSON {
        return super.toJSON() as GradientDiamondJSON;
    }
}
