import {
    parse,
    type BuiltInGradientFunctionName,
    type GradientByFunctionName,
    type GradientTransformOutputByTarget,
    type GradientTransformTarget,
} from "../kind";
import {
    // CSS
    ModuleTransformerLinearGradientToCss,
    ModuleTransformerRadialGradientToCss,
    ModuleTransformerDiamondGradientToCss,
    ModuleTransformerConicGradientToCss,
    ModuleTransformerMeshGradientToCss,

    // Canvas 2D
    ModuleTransformerLinearGradientToCanvas,
    ModuleTransformerRadialGradientToCanvas,
    ModuleTransformerDiamondGradientToCanvas,
    ModuleTransformerConicGradientToCanvas,
    ModuleTransformerMeshGradientToCanvas,

    // Canvas WebGL
    ModuleTransformerLinearGradientToCanvasWebGL,
    ModuleTransformerRadialGradientToCanvasWebGL,
    ModuleTransformerDiamondGradientToCanvasWebGL,
    ModuleTransformerConicGradientToCanvasWebGL,
    ModuleTransformerMeshGradientToCanvasWebGL,

    // SVG
    ModuleTransformerLinearGradientToSvg,
    ModuleTransformerRadialGradientToSvg,
    ModuleTransformerConicGradientToSvg,
    ModuleTransformerDiamondGradientToSvg,
    ModuleTransformerMeshGradientToSvg,


    type IGradientTransformerModule,
    type AnyGradient,
} from "./modules";

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
        input: string | AnyGradient,
    ): TOutput {
        const gradient = typeof input === "string"
            ? parse(input)
            : input;

        const module = this.get(target, gradient.type);

        if (!module) {
            throw new Error(
                `No transformer registered for target "${target}" and gradient "${gradient.type}"`,
            );
        }

        return module.to(gradient) as TOutput;
    }

    public static from<TOutput = unknown>(
        target: string,
        gradientType: string,
        input: TOutput,
    ): AnyGradient {
        const module = this.get(target, gradientType);

        if (!module || !module.from) {
            throw new Error(
                `No reverse transformer registered for target "${target}" and gradient "${gradientType}"`,
            );
        }

        return module.from(input) as AnyGradient;
    }

    private static _ensureInitialized(): void {
        if (this._initialized) {
            return;
        }

        this._initialized = true;

        // CSS
        this.add(new ModuleTransformerLinearGradientToCss());
        this.add(new ModuleTransformerRadialGradientToCss());
        this.add(new ModuleTransformerDiamondGradientToCss());
        this.add(new ModuleTransformerConicGradientToCss());
        this.add(new ModuleTransformerMeshGradientToCss());

        // Canvas2d
        this.add(new ModuleTransformerLinearGradientToCanvas());
        this.add(new ModuleTransformerRadialGradientToCanvas());
        this.add(new ModuleTransformerDiamondGradientToCanvas());
        this.add(new ModuleTransformerConicGradientToCanvas());
        this.add(new ModuleTransformerMeshGradientToCanvas());

        // CanvasWebGL
        this.add(new ModuleTransformerLinearGradientToCanvasWebGL());
        this.add(new ModuleTransformerRadialGradientToCanvasWebGL());
        this.add(new ModuleTransformerDiamondGradientToCanvasWebGL());
        this.add(new ModuleTransformerConicGradientToCanvasWebGL());
        this.add(new ModuleTransformerMeshGradientToCanvasWebGL());

        // SVG
        this.add(new ModuleTransformerLinearGradientToSvg());
        this.add(new ModuleTransformerRadialGradientToSvg());
        this.add(new ModuleTransformerConicGradientToSvg());
        this.add(new ModuleTransformerDiamondGradientToSvg());
        this.add(new ModuleTransformerMeshGradientToSvg());
    }

    private static _getKey(target: string, gradientType: string): string {
        return `${target}:${gradientType}`;
    }
}



export function transformTo<TTarget extends GradientTransformTarget>(
    target: TTarget,
    input: string | AnyGradient,
): GradientTransformOutputByTarget[TTarget];
export function transformTo<TOutput = unknown>(
    target: string,
    input: string | AnyGradient,
): TOutput;
export function transformTo<TOutput = unknown>(
    target: string,
    input: string | AnyGradient,
): TOutput {
    return GradientTransformer.to<TOutput>(target, input);
}

export function transformFrom<TFunctionName extends BuiltInGradientFunctionName>(
    target: string,
    gradientType: TFunctionName,
    input: unknown,
): GradientByFunctionName[TFunctionName];
export function transformFrom<TInput = unknown>(
    target: string,
    gradientType: string,
    input: TInput,
): AnyGradient;
export function transformFrom<TInput = unknown>(
    target: string,
    gradientType: string,
    input: TInput,
): AnyGradient {
    return GradientTransformer.from<TInput>(target, gradientType, input);
}
