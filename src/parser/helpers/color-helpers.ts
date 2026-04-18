import { getTokenRangeSourceSlice } from "../../source";
import { TokenKind, type GradientLexerToken } from "../../token";
import { findNextNonWhitespaceIndex, roundTo, toPercent } from "../../utils";
import type { GradientColorStopNode, GradientLengthPercentageNode } from "../ast";
import type { ParseResult } from "../types";


export function parseColorStop(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<GradientColorStopNode> {
    const colorResult = parseColorSource(source, tokens, startIndex);
    let index = colorResult.nextIndex;

    const positions: GradientLengthPercentageNode[] = [];

    while (true) {
        const nextIndex = findNextNonWhitespaceIndex(tokens, index);

        if (nextIndex === -1) {
            break;
        }

        const token = tokens[nextIndex];

        if (token === undefined) {
            break;
        }

        if (token.kind === TokenKind.PERCENTAGE || token.kind === TokenKind.DIMENSION) {
            positions.push(toLengthPercentageNode(token));
            index = nextIndex + 1;

            if (positions.length === 2) {
                break;
            }

            continue;
        }

        break;
    }

    return {
        node: {
            kind: 'color-stop',
            color: colorResult.node,
            position: positions[0],
        },
        nextIndex: index,
    };
}

function toLengthPercentageNode(
    token: Extract<
        GradientLexerToken,
        { kind: typeof TokenKind.PERCENTAGE } | { kind: typeof TokenKind.DIMENSION }
    >,
): GradientLengthPercentageNode {
    if (token.kind === TokenKind.PERCENTAGE) {
        return {
            kind: 'percentage',
            value: roundTo(toPercent(token.value), 5),
        };
    }

    return {
        kind: 'dimension',
        value: token.value,
        unit: token.unit,
    };
}

function parseColorSource(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<string> {
    const token = tokens[startIndex];

    if (token === undefined) {
        throw new Error('Expected color token');
    }

    if (
        token.kind === TokenKind.IDENT ||
        token.kind === TokenKind.HASH
    ) {
        return {
            node: token.raw,
            nextIndex: startIndex + 1,
        };
    }

    if (token.kind === TokenKind.FUNCTION) {
        const endIndex = findBalancedFunctionEndIndex(tokens, startIndex);

        return {
            node: getTokenRangeSourceSlice(source, tokens, startIndex, endIndex),
            nextIndex: endIndex + 1,
        };
    }

    throw new Error(`Expected color source, received "${token.kind}"`);
}

function findBalancedFunctionEndIndex(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): number {
    const functionToken = tokens[startIndex];
    const openParenToken = tokens[startIndex + 1];

    if (functionToken?.kind !== TokenKind.FUNCTION) {
        throw new Error('Expected generic function token');
    }

    if (openParenToken?.kind !== TokenKind.PAREN_OPEN) {
        throw new Error('Expected "(" after function token');
    }

    let depth = 0;

    for (let index = startIndex + 1; index < tokens.length; index += 1) {
        const token = tokens[index];

        if (token === undefined) {
            break;
        }

        if (token.kind === TokenKind.PAREN_OPEN) {
            depth += 1;
            continue;
        }

        if (token.kind === TokenKind.PAREN_CLOSE) {
            depth -= 1;

            if (depth === 0) {
                return index;
            }
        }
    }

    throw new Error('Unclosed function color source');
}