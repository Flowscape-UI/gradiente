import { TokenKind, type GradientLexerToken } from './token';

export function getSourceSlice(
    source: string,
    start: number,
    end: number,
): string {
    return source.slice(start, end);
}

export function getTokenSourceSlice(
    source: string,
    startToken: GradientLexerToken,
    endToken: GradientLexerToken,
): string {
    return source.slice(startToken.start, endToken.end);
}

export function getTokenRangeSourceSlice(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
    endIndex: number,
): string {
    const startToken = tokens[startIndex];
    const endToken = tokens[endIndex];

    if (startToken === undefined || endToken === undefined) {
        throw new Error(`Invalid token range: ${startIndex}..${endIndex}`);
    }

    return source.slice(startToken.start, endToken.end);
}

export function findBalancedFunctionEndIndex(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): number {
    const startToken = tokens[startIndex];

    if (
        startToken === undefined ||
        !(
            startToken.kind === TokenKind.FUNCTION ||
            startToken.kind === TokenKind.FUNCTION_LINEAR_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_RADIAL_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_CONIC_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_DIAMOND_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_REPEATING_DIAMOND_GRADIENT ||
            startToken.kind === TokenKind.FUNCTION_MESH_GRADIENT
        )
    ) {
        throw new Error(`Token at index ${startIndex} is not a function token`);
    }

    const openParenToken = tokens[startIndex + 1];

    if (openParenToken?.kind !== TokenKind.PAREN_OPEN) {
        throw new Error(`Expected "(" after function token at index ${startIndex}`);
    }

    let depth = 0;

    for (let index = startIndex + 1; index < tokens.length; index++) {
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

            continue;
        }
    }

    throw new Error(`Unclosed function starting at token index ${startIndex}`);
}