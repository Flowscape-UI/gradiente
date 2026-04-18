import {
    GradientFunctionNameToToken,
    KeywordNameToToken,
    TokenKind,
    type DimensionToken,
    type EofToken,
    type FunctionToken,
    type GradientFunctionToken,
    type GradientLexerToken,
    type HashToken,
    type IdentToken,
    type KeywordToken,
    type NumberToken,
    type PercentageToken,
    type PunctuationToken,
    type UnknownToken,
    type WhitespaceToken,
} from '../token';
import {
    advance,
    createLexerState,
    createSpan,
    currentChar,
    isDigitChar,
    isEnd,
    isIdentifierChar,
    isIdentifierStartChar,
    isSignChar,
    isWhitespaceChar,
    peekChar,
    readWhile,
    type LexerState,
} from './base';

function readWhitespaceToken(state: LexerState): WhitespaceToken {
    const start = state.position;
    readWhile(state, isWhitespaceChar);
    const span = createSpan(state.source, start, state.position);

    return {
        kind: TokenKind.WHITESPACE,
        start: span.start,
        end: span.end,
        raw: span.raw,
    };
}

function readPunctuationToken(state: LexerState): PunctuationToken | null {
    const start = state.position;
    const char = currentChar(state);

    if (char === null) {
        return null;
    }

    let kind: PunctuationToken['kind'] | null = null;

    switch (char) {
        case '(':
            kind = TokenKind.PAREN_OPEN;
            break;
        case ')':
            kind = TokenKind.PAREN_CLOSE;
            break;
        case ',':
            kind = TokenKind.COMMA;
            break;
        case '/':
            kind = TokenKind.SLASH;
            break;
        default:
            kind = null;
            break;
    }

    if (kind === null) {
        return null;
    }

    advance(state);
    const span = createSpan(state.source, start, state.position);

    return {
        kind,
        start: span.start,
        end: span.end,
        raw: span.raw,
    };
}

function readHashToken(state: LexerState): HashToken | null {
    const start = state.position;
    const char = currentChar(state);

    if (char !== '#') {
        return null;
    }

    advance(state);

    const value = readWhile(state, (nextChar) => {
        if (nextChar === null) {
            return false;
        }

        return isIdentifierChar(nextChar);
    });

    const span = createSpan(state.source, start, state.position);

    return {
        kind: TokenKind.HASH,
        start: span.start,
        end: span.end,
        raw: span.raw,
        value,
    };
}

function readIdentifierLikeToken(
    state: LexerState,
): IdentToken | KeywordToken | FunctionToken | GradientFunctionToken | null {
    const start = state.position;
    const char = currentChar(state);

    if (!isIdentifierStartChar(char)) {
        return null;
    }

    const value = readWhile(state, isIdentifierChar);
    const next = currentChar(state);

    if (next === '(') {
        const gradientKind = GradientFunctionNameToToken[
            value as keyof typeof GradientFunctionNameToToken
        ];

        const span = createSpan(state.source, start, state.position);

        if (gradientKind !== undefined) {
            return {
                kind: gradientKind,
                start: span.start,
                end: span.end,
                raw: span.raw,
                name: value,
            };
        }

        return {
            kind: TokenKind.FUNCTION,
            start: span.start,
            end: span.end,
            raw: span.raw,
            name: value,
        };
    }

    const keywordKind = KeywordNameToToken[value as keyof typeof KeywordNameToToken];
    const span = createSpan(state.source, start, state.position);

    if (keywordKind !== undefined) {
        return {
            kind: keywordKind,
            start: span.start,
            end: span.end,
            raw: span.raw,
        };
    }

    return {
        kind: TokenKind.IDENT,
        start: span.start,
        end: span.end,
        raw: span.raw,
        value,
    };
}

function isNumberStart(state: LexerState): boolean {
    const char = currentChar(state);
    const next = peekChar(state);

    if (isDigitChar(char)) {
        return true;
    }

    if (char === '.' && isDigitChar(next)) {
        return true;
    }

    if (isSignChar(char)) {
        if (isDigitChar(next)) {
            return true;
        }

        if (next === '.' && isDigitChar(peekChar(state, 2))) {
            return true;
        }
    }

    return false;
}

function readNumberRaw(state: LexerState): { rawNumber: string; sign: -1 | 1; value: number } {
    let sign: -1 | 1 = 1;

    if (currentChar(state) === '+') {
        advance(state);
    } else if (currentChar(state) === '-') {
        sign = -1;
        advance(state);
    }

    const integerPart = readWhile(state, isDigitChar);

    let fractionPart = '';
    if (currentChar(state) === '.' && isDigitChar(peekChar(state))) {
        advance(state);
        fractionPart = readWhile(state, isDigitChar);
    }

    const rawNumber =
        fractionPart.length > 0 ? `${integerPart}.${fractionPart}` : integerPart;

    const numeric = Number(rawNumber);
    const value = sign === -1 ? -numeric : numeric;

    return {
        rawNumber,
        sign,
        value,
    };
}

function readNumberLikeToken(
    state: LexerState,
): NumberToken | PercentageToken | DimensionToken | null {
    if (!isNumberStart(state)) {
        return null;
    }

    const start = state.position;
    const { sign, value } = readNumberRaw(state);

    if (currentChar(state) === '%') {
        advance(state);
        const span = createSpan(state.source, start, state.position);

        return {
            kind: TokenKind.PERCENTAGE,
            start: span.start,
            end: span.end,
            raw: span.raw,
            value,
            sign,
        };
    }

    if (isIdentifierStartChar(currentChar(state))) {
        const unit = readWhile(state, isIdentifierChar);
        const span = createSpan(state.source, start, state.position);

        return {
            kind: TokenKind.DIMENSION,
            start: span.start,
            end: span.end,
            raw: span.raw,
            value,
            sign,
            unit,
        };
    }

    const span = createSpan(state.source, start, state.position);

    return {
        kind: TokenKind.NUMBER,
        start: span.start,
        end: span.end,
        raw: span.raw,
        value,
        sign,
    };
}

function readUnknownToken(state: LexerState): UnknownToken {
    const start = state.position;
    advance(state);
    const span = createSpan(state.source, start, state.position);

    return {
        kind: TokenKind.UNKNOWN,
        start: span.start,
        end: span.end,
        raw: span.raw,
    };
}

function readEofToken(state: LexerState): EofToken {
    return {
        kind: TokenKind.EOF,
        start: state.position,
        end: state.position,
        raw: '',
    };
}

export function nextToken(state: LexerState): GradientLexerToken {
    if (isEnd(state)) {
        return readEofToken(state);
    }

    const char = currentChar(state);

    if (isWhitespaceChar(char)) {
        return readWhitespaceToken(state);
    }

    const punctuationToken = readPunctuationToken(state);
    if (punctuationToken !== null) {
        return punctuationToken;
    }

    const hashToken = readHashToken(state);
    if (hashToken !== null) {
        return hashToken;
    }

    const numberLikeToken = readNumberLikeToken(state);
    if (numberLikeToken !== null) {
        return numberLikeToken;
    }

    const identifierLikeToken = readIdentifierLikeToken(state);
    if (identifierLikeToken !== null) {
        return identifierLikeToken;
    }

    return readUnknownToken(state);
}

export function tokenize(source: string): GradientLexerToken[] {
    const state = createLexerState(source);
    const tokens: GradientLexerToken[] = [];

    while (true) {
        const token = nextToken(state);
        tokens.push(token);

        if (token.kind === TokenKind.EOF) {
            break;
        }
    }

    return tokens;
}