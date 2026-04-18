import { TokenKind, type GradientLexerToken } from './token';

export function isGradientFunctionToken(
    token: GradientLexerToken,
): boolean {
    return (
        token.kind === TokenKind.FUNCTION_LINEAR_GRADIENT ||
        token.kind === TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT ||
        token.kind === TokenKind.FUNCTION_RADIAL_GRADIENT ||
        token.kind === TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT ||
        token.kind === TokenKind.FUNCTION_CONIC_GRADIENT ||
        token.kind === TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT ||
        token.kind === TokenKind.FUNCTION_DIAMOND_GRADIENT ||
        token.kind === TokenKind.FUNCTION_REPEATING_DIAMOND_GRADIENT ||
        token.kind === TokenKind.FUNCTION_MESH_GRADIENT
    );
}

export function isKeywordToken(token: GradientLexerToken): boolean {
    switch (token.kind) {
        case TokenKind.TO:
        case TokenKind.TOP:
        case TokenKind.BOTTOM:
        case TokenKind.LEFT:
        case TokenKind.RIGHT:
        case TokenKind.AT:
        case TokenKind.FROM:
        case TokenKind.CENTER:
        case TokenKind.CIRCLE:
        case TokenKind.ELLIPSE:
        case TokenKind.CLOSEST_SIDE:
        case TokenKind.CLOSEST_CORNER:
        case TokenKind.FARTHEST_SIDE:
        case TokenKind.FARTHEST_CORNER:
        case TokenKind.IN:
        case TokenKind.SHORTER:
        case TokenKind.LONGER:
        case TokenKind.INCREASING:
        case TokenKind.DECREASING:
        case TokenKind.HUE:
            return true;
        default:
            return false;
    }
}

export function isNumericToken(token: GradientLexerToken): boolean {
    return (
        token.kind === TokenKind.NUMBER ||
        token.kind === TokenKind.PERCENTAGE ||
        token.kind === TokenKind.DIMENSION
    );
}