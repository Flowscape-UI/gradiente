import type { GradientAbi } from "../../abi";
import type {
    AnyGradient,
    ICanvasPaintResult,
    ISvgGradientResult,
} from "../transformer/modules";
import type { IWebGLPaintResult } from "../transformer/modules/webgl/types";
import type { IGradient } from "./base";
import { GradientConic } from "./conic";
import { GradientDiamond } from "./diamond";
import { GradientLinear } from "./linear";
import { GradientMesh } from "./mesh";
import { GradientRadial } from "./radial";

export type BuiltInGradientFunctionName =
    | "linear-gradient"
    | "radial-gradient"
    | "diamond-gradient"
    | "conic-gradient"
    | "mesh-gradient";

export type GradientByFunctionName = {
    "linear-gradient": GradientLinear;
    "radial-gradient": GradientRadial<string>;
    "diamond-gradient": GradientDiamond;
    "conic-gradient": GradientConic;
    "mesh-gradient": GradientMesh;
};

export type GradientTransformOutputByTarget = {
    css: string;
    "canvas-2d": ICanvasPaintResult;
    "canvas-webgl": IWebGLPaintResult;
    svg: ISvgGradientResult;
};

export type GradientTransformTarget = keyof GradientTransformOutputByTarget;

type GradientInstance = IGradient<object>;

type BuiltInGradientRegistry = {
    [TType in BuiltInGradientFunctionName]:
        IGradientStatic<GradientByFunctionName[TType]>;
};

const REPEATING_PREFIX = "repeating-";

const BUILT_IN_GRADIENTS = {
    "linear-gradient": GradientLinear,
    "radial-gradient": GradientRadial,
    "diamond-gradient": GradientDiamond,
    "conic-gradient": GradientConic,
    "mesh-gradient": GradientMesh,
} satisfies BuiltInGradientRegistry;

export interface IGradientStatic<
    TGradient extends GradientInstance = GradientInstance,
> {
    fromAbi(abi: GradientAbi): TGradient;
    fromString(input: string): TGradient;
}

export class GradientFactory {
    private static readonly _registry =
        new Map<string, IGradientStatic<GradientInstance>>();
    private static _initialized = false;

    public static add<TGradient extends GradientInstance>(
        type: string,
        value: IGradientStatic<TGradient>,
    ): void {
        this._ensureInitialized();
        this._registry.set(
            this._normalizeFunctionName(type),
            value as IGradientStatic<GradientInstance>,
        );
    }

    public static get<TFunctionName extends BuiltInGradientFunctionName>(
        functionName: TFunctionName,
    ): IGradientStatic<GradientByFunctionName[TFunctionName]> | null;
    public static get<TGradient extends GradientInstance = GradientInstance>(
        functionName: string,
    ): IGradientStatic<TGradient> | null;
    public static get(functionName: string): IGradientStatic | null {
        this._ensureInitialized();

        return this._registry.get(this._normalizeFunctionName(functionName)) ??
            null;
    }

    public static remove(functionName: string): boolean {
        this._ensureInitialized();

        return this._registry.delete(this._normalizeFunctionName(functionName));
    }

    public static create<TFunctionName extends BuiltInGradientFunctionName>(
        input: GradientAbi & { functionName: TFunctionName },
    ): GradientByFunctionName[TFunctionName];
    public static create(input: string | GradientAbi): AnyGradient;
    public static create(input: string | GradientAbi): AnyGradient {
        if (typeof input === "string") {
            const functionName = this._readFunctionName(input);
            const adapter = this.get(functionName);

            if (!adapter) {
                throw new Error(`No gradient registered for: ${functionName}`);
            }

            return adapter.fromString(input) as AnyGradient;
        }

        const functionName = this._normalizeFunctionName(input.functionName);
        const adapter = this.get(functionName);

        if (!adapter) {
            throw new Error(`No gradient registered for: ${functionName}`);
        }

        return adapter.fromAbi({
            ...input,
            functionName,
        }) as AnyGradient;
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

        this.add("linear-gradient", BUILT_IN_GRADIENTS["linear-gradient"]);
        this.add("radial-gradient", BUILT_IN_GRADIENTS["radial-gradient"]);
        this.add("diamond-gradient", BUILT_IN_GRADIENTS["diamond-gradient"]);
        this.add("conic-gradient", BUILT_IN_GRADIENTS["conic-gradient"]);
        this.add("mesh-gradient", BUILT_IN_GRADIENTS["mesh-gradient"]);
    }

    private static _readFunctionName(input: string): string {
        const source = input.trim();
        const openIndex = source.indexOf("(");

        if (openIndex <= 0) {
            throw new Error("Expected gradient function call");
        }

        return this._normalizeFunctionName(source.slice(0, openIndex));
    }

    private static _normalizeFunctionName(input: string): string {
        const functionName = input.trim().toLowerCase();

        return functionName.startsWith(REPEATING_PREFIX)
            ? functionName.slice(REPEATING_PREFIX.length)
            : functionName;
    }
}

export function parse(input: string): AnyGradient {
    return GradientFactory.create(input);
}

export function isGradient(input: string): boolean {
    return GradientFactory.isValid(input);
}

export function format(input: string | AnyGradient): string {
    return typeof input === "string"
        ? parse(input).toString()
        : input.toString();
}