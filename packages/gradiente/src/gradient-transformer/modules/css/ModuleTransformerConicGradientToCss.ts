import { ConicGradient, type GradientBase } from "../../../gradients";
import type { IGradientTransformerModule } from "../types";


export class ModuleTransformerConicGradientToCss
    implements IGradientTransformerModule<string> {
    public readonly target = "css";
    public readonly gradientType = "conic-gradient";

    public to(input: GradientBase<any>): string {
        if (!(input instanceof ConicGradient)) {
            throw new Error("Expected ConicGradient");
        }

        return input.toString();
    }
}