import type {
    GradientColorStopNode,
    GradientLengthPercentageNode,
    GradientNodeBase,
} from "../ast";

export type RadialGradientShape = 'circle' | 'ellipse';

export type RadialGradientSizeKeyword =
    | 'closest-side'
    | 'closest-corner'
    | 'farthest-side'
    | 'farthest-corner';

export interface RadialGradientPositionNode {
    kind: 'position';
    x: GradientLengthPercentageNode;
    y: GradientLengthPercentageNode;
    keywords: readonly string[];
}

export interface RadialGradientSizeNode {
    kind: 'size';
    shape: RadialGradientShape;
    keyword: RadialGradientSizeKeyword;
    radiusX: GradientLengthPercentageNode;
    radiusY: GradientLengthPercentageNode;
}

export interface RadialGradientNode extends GradientNodeBase {
    kind: 'radial';
    shape: RadialGradientShape;
    size: RadialGradientSizeNode;
    position: RadialGradientPositionNode;
    stops: readonly GradientColorStopNode[];
}