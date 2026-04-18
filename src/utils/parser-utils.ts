import { TokenKind, type GradientLexerToken } from '../token';

export function isTriviaToken(token: GradientLexerToken): boolean {
    return token.kind === TokenKind.WHITESPACE;
}

export function getTokenAt(
    tokens: readonly GradientLexerToken[],
    index: number,
): GradientLexerToken | null {
    return tokens[index] ?? null;
}

export function findNextNonWhitespaceIndex(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): number {
    let index = startIndex;

    while (index < tokens.length) {
        const token = tokens[index];

        if (token === undefined) {
            break;
        }

        if (!isTriviaToken(token)) {
            return index;
        }

        index += 1;
    }

    return -1;
}

export function getNonWhitespaceTokenAt(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): GradientLexerToken | null {
    const index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        return null;
    }

    return tokens[index] ?? null;
}

export function skipWhitespace(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): number {
    return findNextNonWhitespaceIndex(tokens, startIndex);
}

export function consumeIf(
    tokens: readonly GradientLexerToken[],
    index: number,
    kind: GradientLexerToken['kind'],
): { matched: boolean; nextIndex: number; token: GradientLexerToken | null } {
    const nextIndex = findNextNonWhitespaceIndex(tokens, index);

    if (nextIndex === -1) {
        return {
            matched: false,
            nextIndex: index,
            token: null,
        };
    }

    const token = tokens[nextIndex] ?? null;

    if (token === null || token.kind !== kind) {
        return {
            matched: false,
            nextIndex: index,
            token: null,
        };
    }

    return {
        matched: true,
        nextIndex: nextIndex + 1,
        token,
    };
}

export function expectToken(
    tokens: readonly GradientLexerToken[],
    index: number,
    kind: GradientLexerToken['kind'],
    message?: string,
): { token: GradientLexerToken; nextIndex: number } {
    const nextIndex = findNextNonWhitespaceIndex(tokens, index);

    if (nextIndex === -1) {
        throw new Error(
            message ?? `Expected token "${kind}", but reached end of token stream`,
        );
    }

    const token = tokens[nextIndex];

    if (token === undefined || token.kind !== kind) {
        throw new Error(
            message ??
                `Expected token "${kind}", but received "${token?.kind ?? 'undefined'}"`,
        );
    }

    return {
        token,
        nextIndex: nextIndex + 1,
    };
}