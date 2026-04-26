import type { GradientBase } from "../../gradients";

export interface IGradientTransformerModule<TOutput = unknown> {
    readonly target: string;
    readonly gradientType: string;

    to(input: GradientBase<any>): TOutput;
    from?(input: TOutput): GradientBase<any>;
}

export interface ICanvasPaintResult {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}