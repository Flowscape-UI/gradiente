import { GradientRadial } from "../../../kind/radial";
import { GradientCssStringTransformerModule } from "../GradientTransformerModule";

export class ModuleTransformerRadialGradientToCss
extends GradientCssStringTransformerModule<GradientRadial> {
    constructor() {
        super({
            target: "css",
            gradientType: "radial-gradient",
            gradientClass: GradientRadial,
            expectedName: "GradientRadial",
        });
    }
}
