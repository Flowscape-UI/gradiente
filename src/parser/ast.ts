import type { ConicGradientNode } from "./conic-gradient";
import type { LinearGradientNode } from "./linear-gradient";
import type { RadialGradientNode } from "./radial-gradient";

export type GradientKind =
    | 'linear'
    | 'radial'
    | 'conic'
    | 'diamond'
    | 'mesh';

export type GradientRepeatMode = 'normal' | 'repeating';

export interface GradientNodeBase {
    kind: GradientKind;
    repeat: GradientRepeatMode;
}

export interface GradientColorStopNode {
    kind: 'color-stop';
    color: string;
    position: GradientLengthPercentageNode;
}


export type GradientStopItemNode = GradientColorStopNode;

export interface GradientNumberNode {
    kind: 'number';
    value: number;
}

export interface GradientPercentageNode {
    kind: 'percentage';
    value: number;
}

export interface GradientDimensionNode {
    kind: 'dimension';
    value: number;
    unit: string;
}

export type GradientNumericNode =
    | GradientNumberNode
    | GradientPercentageNode
    | GradientDimensionNode;

export type GradientLengthPercentageNode =
    | GradientPercentageNode
    | GradientDimensionNode;

export interface GradientPositionNode {
    x: GradientLengthPercentageNode | null;
    y: GradientLengthPercentageNode | null;
    keywords: readonly string[];
}


export type GradientNode =
    | LinearGradientNode
    | RadialGradientNode
    | ConicGradientNode