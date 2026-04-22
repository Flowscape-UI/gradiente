import { LinearGradient, type GradientBase } from "../../../gradients";
import type { IGradientTransformerModule } from "../types";

export class ModuleTransformerLinearGradientToCss
    implements IGradientTransformerModule<string> {
    public readonly target = "css";
    public readonly gradientType = "linear-gradient";

    public to(input: GradientBase<any>): string {
        if (!(input instanceof LinearGradient)) {
            throw new Error("Expected LinearGradient");
        }
        return input.toString();
    }
}