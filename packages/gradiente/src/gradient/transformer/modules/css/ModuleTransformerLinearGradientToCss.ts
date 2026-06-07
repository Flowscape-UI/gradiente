import { GradientLinear } from "../../../kind/linear";
import { GradientCssStringTransformerModule } from "../GradientTransformerModule";

export class ModuleTransformerLinearGradientToCss
extends GradientCssStringTransformerModule<GradientLinear> {
    constructor() {
        super({
            target: "css",
            gradientType: "linear-gradient",
            gradientClass: GradientLinear,
            expectedName: "GradientLinear",
        });
    }
}
