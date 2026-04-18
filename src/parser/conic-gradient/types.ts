import type {
    GradientColorStopNode,
    GradientDimensionNode,
    GradientLengthPercentageNode,
    GradientNodeBase,
} from "../ast";

export interface ConicGradientFromNode {
    kind: 'angle';
    value: GradientDimensionNode;
    valueRaw: GradientDimensionNode;
}

export interface ConicGradientPositionNode {
    kind: 'position';
    x: GradientLengthPercentageNode;
    y: GradientLengthPercentageNode;
    keywords: readonly ('left' | 'right' | 'top' | 'bottom' | 'center')[];
}

export interface ConicGradientNode extends GradientNodeBase {
    kind: 'conic';
    from: ConicGradientFromNode;
    position: ConicGradientPositionNode;
    stops: readonly GradientColorStopNode[];
}