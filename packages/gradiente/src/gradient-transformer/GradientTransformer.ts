import { GradientFactory, type GradientBase } from "../gradients";
import { ModuleTransformerConicGradientToCanvas, ModuleTransformerConicGradientToCss, ModuleTransformerLinearGradientToCanvas, ModuleTransformerLinearGradientToCss, ModuleTransformerRadialGradientToCanvas, ModuleTransformerRadialGradientToCss } from "./modules";
import type { IGradientTransformerModule } from "./modules/types";

export class GradientTransformer {
    private static readonly _modules = new Map<string, IGradientTransformerModule>();
    private static _initialized = false;

    public static add(module: IGradientTransformerModule): void {
        this._ensureInitialized();
        this._modules.set(this._getKey(module.target, module.gradientType), module);
    }

    public static get(target: string, gradientType: string): IGradientTransformerModule | null {
        this._ensureInitialized();
        return this._modules.get(this._getKey(target, gradientType)) ?? null;
    }

    public static remove(target: string, gradientType: string): boolean {
        this._ensureInitialized();
        return this._modules.delete(this._getKey(target, gradientType));
    }

    public static to<TOutput = unknown>(
        target: string,
        input: string | GradientBase<any>,
    ): TOutput {
        const gradient = typeof input === "string"
            ? GradientFactory.create(input)
            : input;

        const module = this.get(target, gradient.type);

        if (!module) {
            throw new Error(
                `No transformer registered for target "${target}" and gradient "${gradient.type}"`,
            );
        }

        return module.to(gradient as GradientBase<any>) as TOutput;
    }

    public static from<TOutput = unknown>(
        target: string,
        gradientType: string,
        input: TOutput,
    ): GradientBase<any> {
        const module = this.get(target, gradientType);

        if (!module || !module.from) {
            throw new Error(
                `No reverse transformer registered for target "${target}" and gradient "${gradientType}"`,
            );
        }

        return module.from(input);
    }

    private static _ensureInitialized(): void {
        if (this._initialized) {
            return;
        }

        this._initialized = true;

        // CSS
        this.add(new ModuleTransformerLinearGradientToCss());
        this.add(new ModuleTransformerRadialGradientToCss());
        this.add(new ModuleTransformerConicGradientToCss());

        // Canvas2d
        this.add(new ModuleTransformerLinearGradientToCanvas());
        this.add(new ModuleTransformerRadialGradientToCanvas());
        this.add(new ModuleTransformerConicGradientToCanvas());
    }

    private static _getKey(target: string, gradientType: string): string {
        return `${target}:${gradientType}`;
    }
}