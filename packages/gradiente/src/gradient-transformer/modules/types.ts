import type { GradientLike } from "../../gradients";

export interface IGradientTransformerModule<TOutput = unknown> {
    readonly target: string;
    readonly gradientType: string;

    to(input: GradientLike): TOutput;
    from?(input: TOutput): GradientLike;
}

export interface ICanvasPaintResult {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}
