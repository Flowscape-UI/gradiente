export const TokenKind = {
    // punctuation
    PAREN_OPEN: 'paren-open',
    PAREN_CLOSE: 'paren-close',
    COMMA: 'comma',
    SLASH: 'slash',

    // gradient functions
    FUNCTION_LINEAR_GRADIENT: 'function-linear-gradient',
    FUNCTION_REPEATING_LINEAR_GRADIENT: 'function-repeating-linear-gradient',
    FUNCTION_RADIAL_GRADIENT: 'function-radial-gradient',
    FUNCTION_REPEATING_RADIAL_GRADIENT: 'function-repeating-radial-gradient',
    FUNCTION_CONIC_GRADIENT: 'function-conic-gradient',
    FUNCTION_REPEATING_CONIC_GRADIENT: 'function-repeating-conic-gradient',

    // custom / experimental
    FUNCTION_DIAMOND_GRADIENT: 'function-diamond-gradient',
    FUNCTION_REPEATING_DIAMOND_GRADIENT: 'function-repeating-diamond-gradient',
    FUNCTION_MESH_GRADIENT: 'function-mesh-gradient',

    // keywords
    TO: 'to',
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',

    AT: 'at',
    FROM: 'from',
    CENTER: 'center',

    CIRCLE: 'circle',
    ELLIPSE: 'ellipse',

    CLOSEST_SIDE: 'closest-side',
    CLOSEST_CORNER: 'closest-corner',
    FARTHEST_SIDE: 'farthest-side',
    FARTHEST_CORNER: 'farthest-corner',

    IN: 'in',
    SHORTER: 'shorter',
    LONGER: 'longer',
    INCREASING: 'increasing',
    DECREASING: 'decreasing',
    HUE: 'hue',

    // generic lexer kinds
    IDENT: 'ident',
    NUMBER: 'number',
    PERCENTAGE: 'percentage',
    DIMENSION: 'dimension',
    FUNCTION: 'function',
    HASH: 'hash',
    STRING: 'string',
    WHITESPACE: 'whitespace',
    EOF: 'eof',
    UNKNOWN: 'unknown',
} as const;

export type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];
export interface TokenBase {
    kind: TokenKind;
    start: number;
    end: number;
    raw: string;
}

export interface PunctuationToken extends TokenBase {
    kind:
    | typeof TokenKind.PAREN_OPEN
    | typeof TokenKind.PAREN_CLOSE
    | typeof TokenKind.COMMA
    | typeof TokenKind.SLASH;
}

export interface KeywordToken extends TokenBase {
    kind:
    | typeof TokenKind.TO
    | typeof TokenKind.TOP
    | typeof TokenKind.BOTTOM
    | typeof TokenKind.LEFT
    | typeof TokenKind.RIGHT
    | typeof TokenKind.AT
    | typeof TokenKind.FROM
    | typeof TokenKind.CENTER
    | typeof TokenKind.CIRCLE
    | typeof TokenKind.ELLIPSE
    | typeof TokenKind.CLOSEST_SIDE
    | typeof TokenKind.CLOSEST_CORNER
    | typeof TokenKind.FARTHEST_SIDE
    | typeof TokenKind.FARTHEST_CORNER
    | typeof TokenKind.IN
    | typeof TokenKind.SHORTER
    | typeof TokenKind.LONGER
    | typeof TokenKind.INCREASING
    | typeof TokenKind.DECREASING
    | typeof TokenKind.HUE;
}

export interface GradientFunctionToken extends TokenBase {
    kind:
    | typeof TokenKind.FUNCTION_LINEAR_GRADIENT
    | typeof TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT
    | typeof TokenKind.FUNCTION_RADIAL_GRADIENT
    | typeof TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT
    | typeof TokenKind.FUNCTION_CONIC_GRADIENT
    | typeof TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT
    | typeof TokenKind.FUNCTION_DIAMOND_GRADIENT
    | typeof TokenKind.FUNCTION_REPEATING_DIAMOND_GRADIENT
    | typeof TokenKind.FUNCTION_MESH_GRADIENT;
    name: string;
}

export interface FunctionToken extends TokenBase {
    kind: typeof TokenKind.FUNCTION;
    name: string;
}

export interface IdentToken extends TokenBase {
    kind: typeof TokenKind.IDENT;
    value: string;
}

export interface NumberToken extends TokenBase {
    kind: typeof TokenKind.NUMBER;
    value: number;
    sign: -1 | 1;
}

export interface PercentageToken extends TokenBase {
    kind: typeof TokenKind.PERCENTAGE;
    value: number;
    sign: -1 | 1;
}

export interface DimensionToken extends TokenBase {
    kind: typeof TokenKind.DIMENSION;
    value: number;
    sign: -1 | 1;
    unit: string;
}

export interface HashToken extends TokenBase {
    kind: typeof TokenKind.HASH;
    value: string;
}

export interface StringToken extends TokenBase {
    kind: typeof TokenKind.STRING;
    value: string;
    quote: '"' | "'";
}

export interface WhitespaceToken extends TokenBase {
    kind: typeof TokenKind.WHITESPACE;
}

export interface EofToken extends TokenBase {
    kind: typeof TokenKind.EOF;
}

export interface UnknownToken extends TokenBase {
    kind: typeof TokenKind.UNKNOWN;
}

export type GradientLexerToken =
    | PunctuationToken
    | KeywordToken
    | GradientFunctionToken
    | FunctionToken
    | IdentToken
    | NumberToken
    | PercentageToken
    | DimensionToken
    | HashToken
    | StringToken
    | WhitespaceToken
    | EofToken
    | UnknownToken;

export const GradientFunctionNameToToken = {
    'linear-gradient': TokenKind.FUNCTION_LINEAR_GRADIENT,
    'repeating-linear-gradient': TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT,
    'radial-gradient': TokenKind.FUNCTION_RADIAL_GRADIENT,
    'repeating-radial-gradient': TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT,
    'conic-gradient': TokenKind.FUNCTION_CONIC_GRADIENT,
    'repeating-conic-gradient': TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT,
    'diamond-gradient': TokenKind.FUNCTION_DIAMOND_GRADIENT,
    'repeating-diamond-gradient': TokenKind.FUNCTION_REPEATING_DIAMOND_GRADIENT,
    'mesh-gradient': TokenKind.FUNCTION_MESH_GRADIENT,
} as const;

export const KeywordNameToToken = {
    to: TokenKind.TO,
    top: TokenKind.TOP,
    bottom: TokenKind.BOTTOM,
    left: TokenKind.LEFT,
    right: TokenKind.RIGHT,
    at: TokenKind.AT,
    from: TokenKind.FROM,
    center: TokenKind.CENTER,
    circle: TokenKind.CIRCLE,
    ellipse: TokenKind.ELLIPSE,
    'closest-side': TokenKind.CLOSEST_SIDE,
    'closest-corner': TokenKind.CLOSEST_CORNER,
    'farthest-side': TokenKind.FARTHEST_SIDE,
    'farthest-corner': TokenKind.FARTHEST_CORNER,
    in: TokenKind.IN,
    shorter: TokenKind.SHORTER,
    longer: TokenKind.LONGER,
    increasing: TokenKind.INCREASING,
    decreasing: TokenKind.DECREASING,
    hue: TokenKind.HUE,
} as const;