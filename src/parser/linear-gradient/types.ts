import type { GradientDimensionNode, GradientNodeBase, GradientStopItemNode } from "../ast";

export interface LinearGradientDirectionNode  {
    kind: 'angle';
    value: GradientDimensionNode;
    valueRaw: GradientDimensionNode;
    keywords: readonly ('to' | 'top' | 'bottom' | 'left' | 'right')[];
}


export interface LinearGradientNode extends GradientNodeBase {
    kind: 'linear';
    direction: LinearGradientDirectionNode | null;
    stops: readonly GradientStopItemNode[];
}