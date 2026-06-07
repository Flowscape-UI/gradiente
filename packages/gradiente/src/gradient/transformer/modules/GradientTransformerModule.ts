import type { AnyGradient, IGradientTransformerModule } from "./types";

type GradientRuntimeClass<TGradient extends AnyGradient> = Function & {
    prototype: TGradient;
};

type GradientTransformerModuleOptions<TGradient extends AnyGradient> = {
    target: string;
    gradientType: TGradient["type"];
    gradientClass: GradientRuntimeClass<TGradient>;
    expectedName: string;
};

export abstract class GradientTransformerModule<
    TGradient extends AnyGradient,
    TOutput,
>
implements IGradientTransformerModule<TOutput> {
    public readonly target: string;
    public readonly gradientType: TGradient["type"];

    private readonly _gradientClass: GradientRuntimeClass<TGradient>;
    private readonly _expectedName: string;

    protected constructor(
        options: GradientTransformerModuleOptions<TGradient>,
    ) {
        this.target = options.target;
        this.gradientType = options.gradientType;
        this._gradientClass = options.gradientClass;
        this._expectedName = options.expectedName;
    }

    public to(input: AnyGradient): TOutput {
        return this.transform(this._expectGradient(input));
    }

    protected abstract transform(gradient: TGradient): TOutput;

    protected _expectGradient(input: AnyGradient): TGradient {
        if (!(input instanceof this._gradientClass)) {
            throw new Error(`Expected ${this._expectedName}`);
        }

        return input as TGradient;
    }
}

export abstract class GradientCssStringTransformerModule<
    TGradient extends AnyGradient,
> extends GradientTransformerModule<TGradient, string> {
    protected transform(gradient: TGradient): string {
        return gradient.toString();
    }
}
