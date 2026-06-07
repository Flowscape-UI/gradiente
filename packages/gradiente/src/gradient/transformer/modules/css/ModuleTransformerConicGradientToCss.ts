import { GradientConic } from "../../../kind/conic";
import { GradientCssStringTransformerModule } from "../GradientTransformerModule";


export class ModuleTransformerConicGradientToCss
extends GradientCssStringTransformerModule<GradientConic> {
    constructor() {
        super({
            target: "css",
            gradientType: "conic-gradient",
            gradientClass: GradientConic,
            expectedName: "GradientConic",
        });
    }
}
