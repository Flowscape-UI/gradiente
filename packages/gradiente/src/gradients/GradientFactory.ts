import { type GradientAbi } from "../abi";
import { GradientTransformer } from "../gradient-transformer";
import { ConicGradient } from "./ConicGradient";
import { DiamondGradient } from "./DiamondGradient";
import { type GradientLike } from "./GradientBase";
import { LinearGradient } from "./LinearGradient";
import { MeshGradient } from "./MeshGradient";
import { RadialGradient } from "./RadialGradient";

export interface IGradientStatic<TGradient extends GradientLike = GradientLike> {
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

    public static create(input: string | GradientAbi): AnyGradient {
        if (typeof input === "string") {
            const functionName = this._getFunctionName(input);
            const adapter = this.get(functionName);

            if (!adapter) {
                throw new Error(`No gradient registered for: ${functionName}`);
            }

            return adapter.fromString(input) as AnyGradient;
        }

        const abi = input;
        const adapter = this.get(abi.functionName);

        if (!adapter) {
            throw new Error(`No gradient registered for: ${abi.functionName}`);
        }

        return adapter.fromAbi(abi) as AnyGradient;
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
        this.add("diamond-gradient", DiamondGradient);
        this.add("conic-gradient", ConicGradient);
        this.add("mesh-gradient", MeshGradient);
    }

    private static _getFunctionName(input: string): string {
        const source = input.trim();
        const openIndex = source.indexOf("(");

        if (openIndex <= 0) {
            throw new Error("Expected function opening parenthesis");
        }

        let functionName = source.slice(0, openIndex).trim();

        if (functionName.startsWith("repeating-")) {
            functionName = functionName.slice("repeating-".length);
        }

        return functionName;
    }
}

export type AnyGradient =
    | LinearGradient
    | RadialGradient
    | DiamondGradient
    | ConicGradient
    | MeshGradient;

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

export function transformTo(target: string, input: string | AnyGradient) {
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
): AnyGradient {
    return GradientTransformer.from(target, gradientType, input);
}
