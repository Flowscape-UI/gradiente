import { RadialGradient, type GradientBase } from "../../../gradients";
import type { IGradientTransformerModule } from "../types";

export class ModuleTransformerRadialGradientToCss
    implements IGradientTransformerModule<string> {
    public readonly target = "css";
    public readonly gradientType = "radial-gradient";

    public to(input: GradientBase<any>): string {
        if (!(input instanceof RadialGradient)) {
            throw new Error("Expected RadialGradient");
        }

        return input.toString();
    }
}