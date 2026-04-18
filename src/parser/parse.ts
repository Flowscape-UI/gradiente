import { tokenize } from '../lexer';
import { getTokenAt } from '../utils';
import { TokenKind } from '../token';

import { parseLinearGradient } from './linear-gradient';
import { parseRadialGradient } from './radial-gradient';
import { parseConicGradient } from './conic-gradient';

import type { GradientNode } from './ast';

export function parse(value: string): GradientNode {
    const tokens = tokenize(value);

    const firstToken = getTokenAt(tokens, 0);

    if (firstToken === null) {
        throw new Error('Empty input');
    }

    switch (firstToken.kind) {
        case TokenKind.FUNCTION_LINEAR_GRADIENT:
        case TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT: {
            const result = parseLinearGradient(value, tokens, 0);
            return result.node;
        }

        case TokenKind.FUNCTION_RADIAL_GRADIENT:
        case TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT: {
            const result = parseRadialGradient(value, tokens, 0);
            return result.node;
        }

        case TokenKind.FUNCTION_CONIC_GRADIENT:
        case TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT: {
            const result = parseConicGradient(value, tokens, 0);
            return result.node;
        }

        default:
            throw new Error(`Unsupported gradient type: ${firstToken.kind}`);
    }
}