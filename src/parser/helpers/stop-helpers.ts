import { TokenKind, type GradientLexerToken } from "../../token";
import { findNextNonWhitespaceIndex } from "../../utils";
import type {
    GradientStopItemNode,
    GradientColorStopNode,
} from "../ast";
import type { ParseResult } from "../types";
import { parseColorStop } from "./color-helpers";

export function parseGradientStopList(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<readonly GradientStopItemNode[]> {
    const items: GradientStopItemNode[] = [];
    let index = startIndex;

    while (true) {
        const itemResult = parseGradientStopItem(source, tokens, index);
        items.push(itemResult.node);
        index = itemResult.nextIndex;

        const nextIndex = findNextNonWhitespaceIndex(tokens, index);

        if (nextIndex === -1) {
            break;
        }

        const token = tokens[nextIndex];

        if (token === undefined) {
            break;
        }

        if (token.kind === TokenKind.COMMA) {
            index = nextIndex + 1;
            continue;
        }

        if (token.kind === TokenKind.PAREN_CLOSE) {
            break;
        }

        throw new Error(`Expected comma or ")" in stop list, received "${token.kind}"`);
    }

    if (items.length < 2) {
        throw new Error('Linear gradient requires at least two stop items');
    }

    return {
        node: normalizeGradientStopList(items),
        nextIndex: index,
    };
}

export function parseGradientStopItem(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<GradientStopItemNode> {
    const index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        throw new Error('Expected stop item, but reached end of token stream');
    }

    const token = tokens[index];

    if (token === undefined) {
        throw new Error('Expected stop item, but token was undefined');
    }

    return parseColorStop(source, tokens, index);
}

function normalizeGradientStopList(
    items: readonly GradientStopItemNode[],
): readonly GradientStopItemNode[] {
    const colorStopIndexes = items.flatMap((item, index) =>
        item.kind === 'color-stop' ? [index] : []
    );

    if (colorStopIndexes.length < 2) {
        return items;
    }

    const normalized = [...items];

    const getColorStop = (itemIndex: number): GradientColorStopNode => {
        const item = normalized[itemIndex];

        if (item.kind !== 'color-stop') {
            throw new Error('Expected color-stop');
        }

        return item;
    };

    const setColorStopPosition = (itemIndex: number, value: number): void => {
        const stop = getColorStop(itemIndex);

        normalized[itemIndex] = {
            ...stop,
            position: {
                kind: 'percentage',
                value,
            },
        };
    };

    const getColorStopPosition = (itemIndex: number): number | null => {
        const stop = getColorStop(itemIndex);
        const position = stop.position;

        if (!position) {
            return null;
        }

        if (position.kind !== 'percentage') {
            return null;
        }

        return position.value;
    };

    const firstItemIndex = colorStopIndexes[0];
    const lastItemIndex = colorStopIndexes[colorStopIndexes.length - 1];

    if (firstItemIndex !== undefined && getColorStopPosition(firstItemIndex) === null) {
        setColorStopPosition(firstItemIndex, 0);
    }

    if (lastItemIndex !== undefined && getColorStopPosition(lastItemIndex) === null) {
        setColorStopPosition(lastItemIndex, 1);
    }

    let anchorStart = 0;

    while (anchorStart < colorStopIndexes.length) {
        const startItemIndex = colorStopIndexes[anchorStart];

        if (startItemIndex === undefined) {
            break;
        }

        const startValue = getColorStopPosition(startItemIndex);

        if (startValue === null) {
            anchorStart += 1;
            continue;
        }

        let anchorEnd = anchorStart + 1;

        while (anchorEnd < colorStopIndexes.length) {
            const endItemIndex = colorStopIndexes[anchorEnd];

            if (endItemIndex === undefined) {
                break;
            }

            const endValue = getColorStopPosition(endItemIndex);

            if (endValue !== null) {
                const gapCount = anchorEnd - anchorStart - 1;

                if (gapCount > 0) {
                    const step = (endValue - startValue) / (gapCount + 1);

                    for (let i = 1; i <= gapCount; i += 1) {
                        const gapItemIndex = colorStopIndexes[anchorStart + i];

                        if (gapItemIndex === undefined) {
                            continue;
                        }

                        setColorStopPosition(gapItemIndex, startValue + step * i);
                    }
                }

                break;
            }

            anchorEnd += 1;
        }

        anchorStart = anchorEnd;
    }

    return normalized;
}