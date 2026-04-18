export interface LexerState {
    source: string;
    length: number;
    position: number;
}

export interface SourceSpan {
    start: number;
    end: number;
    raw: string;
}

export function createLexerState(source: string): LexerState {
    return {
        source,
        length: source.length,
        position: 0,
    };
}

export function isEnd(state: LexerState): boolean {
    return state.position >= state.length;
}

export function currentChar(state: LexerState): string | null {
    if (isEnd(state)) {
        return null;
    }

    return state.source[state.position] ?? null;
}

export function peekChar(state: LexerState, offset = 1): string | null {
    const index = state.position + offset;

    if (index < 0 || index >= state.length) {
        return null;
    }

    return state.source[index] ?? null;
}

export function advance(state: LexerState, step = 1): void {
    state.position = Math.max(0, Math.min(state.position + step, state.length));
}


export function isWhitespaceChar(char: string | null): boolean {
    return char === ' ' || char === '\n' || char === '\r' || char === '\t' || char === '\f';
}

export function isDigitChar(char: string | null): boolean {
    return char !== null && char >= '0' && char <= '9';
}

export function isSignChar(char: string | null): boolean {
    return char === '+' || char === '-';
}

export function isIdentifierStartChar(char: string | null): boolean {
    if (char === null) {
        return false;
    }

    return (
        (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        char === '_' ||
        char === '-'
    );
}

export function isIdentifierChar(char: string | null): boolean {
    if (char === null) {
        return false;
    }

    return isIdentifierStartChar(char) || isDigitChar(char);
}

export function isAlphaChar(char: string | null): boolean {
    if (char === null) {
        return false;
    }

    return (
        (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z')
    );
}

export function readWhile(
    state: LexerState,
    predicate: (char: string | null) => boolean,
): string {
    const start = state.position;

    while (!isEnd(state) && predicate(currentChar(state))) {
        advance(state);
    }

    return state.source.slice(start, state.position);
}


export function createSpan(
    source: string,
    start: number,
    end: number,
): SourceSpan {
    return {
        start,
        end,
        raw: source.slice(start, end),
    };
}