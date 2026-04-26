import { parseStringToAbi, type GradientAbi } from "../abi";
import { GradientTransformer } from "../gradient-transformer";
import { ConicGradient } from "./ConicGradient";
import { type IGradientBase, GradientBase } from "./GradientBase";
import { LinearGradient } from "./LinearGradient";
import { RadialGradient } from "./RadialGradient";

export interface IGradientStatic<TGradient extends GradientBase = GradientBase> {
    fromAbi(abi: GradientAbi): TGradient;
    fromString(input: string): TGradient;
}

export class GradientFactory {
    private static readonly _registry = new Map<string, IGradientStatic>();
    private static _initialized = false;

    public static add(type: string, value: IGradientStatic): void {
        this._ensureInitialized();
        this._registry.set(type, value);
    }

    public static get(functionName: string): IGradientStatic | null {
        this._ensureInitialized();
        return this._registry.get(functionName) ?? null;
    }

    public static remove(functionName: string): boolean {
        return this._registry.delete(functionName);
    }

    public static create(input: string | GradientAbi): IGradientBase<any> {
        const abi = typeof input === "string"
            ? parseStringToAbi(input)
            : input;

        const adapter = this.get(abi.functionName);

        if (!adapter) {
            throw new Error(`No gradient registered for: ${abi.functionName}`);
        }

        return adapter.fromAbi(abi);
    }

    public static isValid(input: string): boolean {
        try {
            this.create(input);
            return true;
        } catch {
            return false;
        }
    }


    private static _ensureInitialized(): void {
        if (this._initialized) {
            return;
        }

        this._initialized = true;
        this.add("linear-gradient", LinearGradient);
        this.add("radial-gradient", RadialGradient);
        this.add("conic-gradient", ConicGradient);
    }
}

export type AnyGradient =
    | LinearGradient
    | RadialGradient
    | ConicGradient;

export function parse(input: string): AnyGradient {
    return GradientFactory.create(input) as AnyGradient;
}

export function isGradient(input: string): boolean {
    return GradientFactory.isValid(input);
}

export function format(input: string | AnyGradient): string {
    if (typeof input === "string") {
        return parse(input).toString();
    }
    return input.toString();
}

export function transformTo(target: string, input: string | GradientBase<any>) {
    const gradient =
        typeof input === "string"
            ? parse(input)
            : input;

    return GradientTransformer.to(target, gradient);
}

export function transformFrom<TInput = unknown>(
    target: string,
    gradientType: string,
    input: TInput,
): GradientBase<any> {
    return GradientTransformer.from(target, gradientType, input);
}