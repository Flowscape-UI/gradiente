import type { GradientConic } from "../../kind/conic";
import type { GradientDiamond } from "../../kind/diamond";
import type { GradientLinear } from "../../kind/linear";
import type { GradientMesh } from "../../kind/mesh";
import type { GradientRadial } from "../../kind/radial";

export type AnyGradient =
    | GradientLinear
    | GradientRadial<string>
    | GradientDiamond
    | GradientConic
    | GradientMesh;

export type GradientTransformerTarget =
    | "css"
    | "canvas-2d"
    | "canvas-webgl"
    | "svg"
    | string;

export interface IGradientTransformerModule<TOutput = unknown> {
    readonly target: string;
    readonly gradientType: string;

    to(input: AnyGradient): TOutput;
    from?(input: TOutput): AnyGradient;
}

export interface ICanvasPaintResult {
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}

export interface ISvgGradientResult {
    id: string;
    href: string;
    url: string;
    type: "linearGradient" | "radialGradient" | "pattern";
    gradient: string;
    defs: string;
    svg: string;
}
