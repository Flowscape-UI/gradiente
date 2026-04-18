import {
    type GradientLexerToken,
    TokenKind,
} from '../../token';
import {
    degToRad,
    expectToken,
    findNextNonWhitespaceIndex,
    getTokenAt,
    normalizeAngleDeg,
    parseAngleFromToken,
    radToDeg,
    roundTo,
} from '../../utils';
import type { ParseResult } from '../types';
import { parseGradientStopList } from '../helpers';
import type { LinearGradientDirectionNode, LinearGradientNode } from './types';
import type { GradientColorStopNode } from '../ast';

type LinearDirectionKeyword = 'to' | 'top' | 'bottom' | 'left' | 'right';

export function parseLinearGradient(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<LinearGradientNode> {
    const functionToken = getTokenAt(tokens, startIndex);

    if (
        functionToken === null ||
        (
            functionToken.kind !== TokenKind.FUNCTION_LINEAR_GRADIENT &&
            functionToken.kind !== TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT
        )
    ) {
        throw new Error('Expected linear gradient function token');
    }

    const repeat =
        functionToken.kind === TokenKind.FUNCTION_REPEATING_LINEAR_GRADIENT
            ? 'repeating'
            : 'normal';

    let index = startIndex + 1;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_OPEN);
        index = result.nextIndex;
    }

    const directionResult = parseLinearDirection(tokens, index);
    const direction = directionResult.node ?? createDefaultLinearDirection();

    index = directionResult.nextIndex;

    if (directionResult.node !== null) {
        const result = expectToken(tokens, index, TokenKind.COMMA);
        index = result.nextIndex;
    }

    const stopsResult = parseGradientStopList(source, tokens, index);
    const stops = repeat === 'repeating' ? expandColorStops(stopsResult.node) : stopsResult.node;
    index = stopsResult.nextIndex;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_CLOSE);
        index = result.nextIndex;
    }

    return {
        node: {
            kind: 'linear',
            repeat,
            direction,
            stops,
        },
        nextIndex: index,
    };
}

function parseLinearDirection(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<LinearGradientDirectionNode | null> {
    const index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    const token = tokens[index];

    if (token === undefined) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    if (token.kind === TokenKind.TO) {
        return parseLinearDirectionFromKeywords(tokens, index);
    }

    const angle = parseAngleFromToken(token);

    if (angle !== null) {
        const kind = TokenKind.DIMENSION;
        const dimensionToken = token as Extract<GradientLexerToken, { kind: typeof kind }>;

        return {
            node: createLinearDirectionFromAngle(
                dimensionToken.value,
                dimensionToken.unit,
                angle,
            ),
            nextIndex: index + 1,
        };
    }

    return {
        node: null,
        nextIndex: startIndex,
    };
}

function parseLinearDirectionFromKeywords(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<LinearGradientDirectionNode> {
    let index = startIndex;

    {
        const result = expectToken(tokens, index, TokenKind.TO);
        index = result.nextIndex;
    }

    const keywords: Array<'top' | 'bottom' | 'left' | 'right'> = [];

    while (true) {
        const nextIndex = findNextNonWhitespaceIndex(tokens, index);

        if (nextIndex === -1) {
            break;
        }

        const token = tokens[nextIndex];

        if (token === undefined) {
            break;
        }

        if (
            token.kind === TokenKind.TOP ||
            token.kind === TokenKind.BOTTOM ||
            token.kind === TokenKind.LEFT ||
            token.kind === TokenKind.RIGHT
        ) {
            keywords.push(token.kind);
            index = nextIndex + 1;
            continue;
        }

        break;
    }

    if (keywords.length === 0) {
        throw new Error('Expected at least one direction keyword after "to"');
    }

    return {
        node: createLinearDirectionFromKeywords(['to', ...keywords]),
        nextIndex: index,
    };
}

function createLinearDirectionFromKeywords(
    keywords: readonly LinearDirectionKeyword[],
): LinearGradientDirectionNode {
    const deg = parseKeywordsToDeg(keywords);

    if (deg === null) {
        throw new Error('Invalid direction keywords');
    }

    const rad = roundTo(degToRad(deg), 6);

    return {
        kind: 'angle',
        value: {
            kind: 'dimension',
            value: deg,
            unit: 'deg',
        },
        valueRaw: {
            kind: 'dimension',
            value: rad,
            unit: 'rad',
        },
        keywords: [...keywords],
    };
}

function createLinearDirectionFromAngle(
    value: number,
    unit: string,
    normalizedRad: number,
): LinearGradientDirectionNode {
    const fixedRad = roundTo(normalizedRad, 6);
    return {
        kind: 'angle',
        value: {
            kind: 'dimension',
            value,
            unit,
        },
        valueRaw: {
            kind: 'dimension',
            value: fixedRad,
            unit: 'rad',
        },
        keywords: parseRadToKeywords(fixedRad)
    };
}

function createDefaultLinearDirection(): LinearGradientDirectionNode {
    return createLinearDirectionFromKeywords(['to', 'top']);
}

function parseKeywordsToDeg(
    keywords: readonly LinearDirectionKeyword[],
): number | null {
    if (keywords.length === 0 || keywords[0] !== 'to') {
        return null;
    }

    const dirs = keywords.slice(1);
    const sorted = [...dirs].sort().join('-');

    switch (sorted) {
        case 'top':
            return 0;

        case 'right':
            return 90;

        case 'left':
            return 270;

        case 'bottom':
            return 180;

        case 'bottom-right':
        case 'right-bottom':
            return 135;

        case 'bottom-left':
        case 'left-bottom':
            return 225;

        case 'top-right':
        case 'right-top':
            return 45;

        case 'top-left':
        case 'left-top':
            return 315;

        default:
            return null;
    }
}

function parseDegToKeywords(angle: number): readonly LinearDirectionKeyword[] {
    const normalized = normalizeAngleDeg(angle);

    switch (normalized) {
        case 0:
            return ['to', 'top'];
        case 45:
            return ['to', 'top', 'right'];
        case 90:
            return ['to', 'right'];
        case 135:
            return ['to', 'bottom', 'right'];
        case 180:
            return ['to', 'bottom'];
        case 225:
            return ['to', 'bottom', 'left'];
        case 270:
            return ['to', 'left'];
        case 315:
            return ['to', 'top', 'left'];
        default:
            return [];
    }
}

function parseRadToKeywords(angle: number): readonly LinearDirectionKeyword[] {
    return parseDegToKeywords(radToDeg(angle));
}

function expandColorStops(
    stops: readonly GradientColorStopNode[],
): readonly GradientColorStopNode[] {
    if (stops.length < 2) {
        return stops;
    }

    const lastStop = stops[stops.length - 1];
    const lastPosition = lastStop?.position;

    if (!lastPosition || lastPosition.kind !== 'percentage') {
        return stops;
    }

    if (lastPosition.value >= 1) {
        return stops;
    }

    const percentageSum = roundTo(
        stops.reduce((sum, stop) => {
            const position = stop.position;

            if (!position || position.kind !== 'percentage') {
                return sum;
            }

            return sum + position.value;
        }, 0),
        3,
    );

    if (percentageSum <= 0) {
        return stops;
    }

    const newStops: GradientColorStopNode[] = [...stops];

    let offset = percentageSum;

    while (true) {
        let shouldContinue = false;

        for (let i = 0; i < stops.length; i++) {
            const stop = stops[i];
            const position = stop.position;

            if (!position || position.kind !== 'percentage') {
                continue;
            }

            const nextValue = roundTo(position.value + offset, 3);

            newStops.push({
                ...stop,
                position: {
                    kind: 'percentage',
                    value: nextValue,
                },
            });

            if (nextValue <= 1) {
                shouldContinue = true;
            }
        }

        const lastGeneratedStop = newStops[newStops.length - 1];
        const lastGeneratedPosition = lastGeneratedStop?.position;

        if (
            !lastGeneratedPosition ||
            lastGeneratedPosition.kind !== 'percentage' ||
            lastGeneratedPosition.value > 1
        ) {
            break;
        }

        if (!shouldContinue) {
            break;
        }

        offset = roundTo(offset + percentageSum, 3);
    }

    return newStops;
}