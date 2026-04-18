import {
    type GradientLexerToken,
    TokenKind,
} from '../../token';
import {
    expectToken,
    findNextNonWhitespaceIndex,
    getTokenAt,
    parseAngleFromToken,
    roundTo,
} from '../../utils';
import type { ParseResult } from '../types';
import { parseGradientStopList } from '../helpers';
import type {
    ConicGradientNode,
    ConicGradientFromNode,
    ConicGradientPositionNode,
} from './types';
import type {
    GradientColorStopNode,
    GradientLengthPercentageNode,
} from '../ast';

type ConicPositionKeyword = 'left' | 'right' | 'top' | 'bottom' | 'center';

type ConicPreludeNode = {
    from: ConicGradientFromNode;
    position: ConicGradientPositionNode;
};

export function parseConicGradient(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<ConicGradientNode> {
    const functionToken = getTokenAt(tokens, startIndex);

    if (
        functionToken === null ||
        (
            functionToken.kind !== TokenKind.FUNCTION_CONIC_GRADIENT &&
            functionToken.kind !== TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT
        )
    ) {
        throw new Error('Expected conic gradient function token');
    }

    const repeat =
        functionToken.kind === TokenKind.FUNCTION_REPEATING_CONIC_GRADIENT
            ? 'repeating'
            : 'normal';

    let index = startIndex + 1;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_OPEN);
        index = result.nextIndex;
    }

    const preludeResult = parseConicPrelude(tokens, index);
    const prelude = preludeResult.node ?? createDefaultConicPrelude();
    index = preludeResult.nextIndex;

    if (preludeResult.node !== null) {
        const result = expectToken(tokens, index, TokenKind.COMMA);
        index = result.nextIndex;
    }

    const stopsResult = parseGradientStopList(source, tokens, index);
    const stops =
        repeat === 'repeating'
            ? expandColorStops(stopsResult.node)
            : stopsResult.node;
    index = stopsResult.nextIndex;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_CLOSE);
        index = result.nextIndex;
    }

    return {
        node: {
            kind: 'conic',
            repeat,
            from: prelude.from,
            position: prelude.position,
            stops,
        },
        nextIndex: index,
    };
}

function parseConicPrelude(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<ConicPreludeNode | null> {
    let index = startIndex;

    const fromResult = parseConicFrom(tokens, index);
    const from = fromResult.node ?? createDefaultConicFrom();
    index = fromResult.nextIndex;

    const positionResult = parseConicPosition(tokens, index);
    const position = positionResult.node ?? createDefaultConicPosition();
    index = positionResult.nextIndex;

    const consumedSomething =
        fromResult.node !== null ||
        positionResult.node !== null;

    if (!consumedSomething) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    return {
        node: {
            from,
            position,
        },
        nextIndex: index,
    };
}

function parseConicFrom(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<ConicGradientFromNode | null> {
    let index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    const fromToken = tokens[index];

    if (fromToken === undefined || fromToken.kind !== TokenKind.FROM) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    index += 1;

    const angleIndex = findNextNonWhitespaceIndex(tokens, index);

    if (angleIndex === -1) {
        throw new Error('Expected angle after "from"');
    }

    const angleToken = tokens[angleIndex];

    if (angleToken === undefined) {
        throw new Error('Expected angle token after "from"');
    }

    const angleRad = parseAngleFromToken(angleToken);

    if (angleRad === null) {
        throw new Error('Expected valid angle after "from"');
    }

    if (angleToken.kind !== TokenKind.DIMENSION) {
        throw new Error('Expected dimension token for conic angle');
    }

    return {
        node: createConicFromNode(
            angleToken.value,
            angleToken.unit,
            angleRad,
        ),
        nextIndex: angleIndex + 1,
    };
}

function parseConicPosition(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<ConicGradientPositionNode | null> {
    let index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    const atToken = tokens[index];

    if (atToken === undefined || atToken.kind !== TokenKind.AT) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    index += 1;

    let x: GradientLengthPercentageNode | null = null;
    let y: GradientLengthPercentageNode | null = null;
    const keywords: ConicPositionKeyword[] = [];

    while (true) {
        const nextIndex = findNextNonWhitespaceIndex(tokens, index);

        if (nextIndex === -1) {
            break;
        }

        const token = tokens[nextIndex];

        if (token === undefined) {
            break;
        }

        const lengthPercentage = parseLengthPercentageToken(token);

        if (lengthPercentage !== null) {
            if (x === null) {
                x = lengthPercentage;
            } else if (y === null) {
                y = lengthPercentage;
            } else {
                break;
            }

            index = nextIndex + 1;
            continue;
        }

        if (
            token.kind === TokenKind.LEFT ||
            token.kind === TokenKind.RIGHT ||
            token.kind === TokenKind.TOP ||
            token.kind === TokenKind.BOTTOM ||
            token.kind === TokenKind.CENTER
        ) {
            keywords.push(token.kind);
            index = nextIndex + 1;
            continue;
        }

        break;
    }

    return {
        node: createConicPositionNode(x, y, keywords),
        nextIndex: index,
    };
}

function createDefaultConicPrelude(): ConicPreludeNode {
    return {
        from: createDefaultConicFrom(),
        position: createDefaultConicPosition(),
    };
}

function createDefaultConicFrom(): ConicGradientFromNode {
    return createConicFromNode(0, 'deg', 0);
}

function createDefaultConicPosition(): ConicGradientPositionNode {
    return {
        kind: 'position',
        x: {
            kind: 'percentage',
            value: 0.5,
        },
        y: {
            kind: 'percentage',
            value: 0.5,
        },
        keywords: ['center'],
    };
}

function createConicFromNode(
    value: number,
    unit: string,
    normalizedRad: number,
): ConicGradientFromNode {
    return {
        kind: 'angle',
        value: {
            kind: 'dimension',
            value,
            unit,
        },
        valueRaw: {
            kind: 'dimension',
            value: roundTo(normalizedRad, 6),
            unit: 'rad',
        },
    };
}

function createConicPositionNode(
    x: GradientLengthPercentageNode | null,
    y: GradientLengthPercentageNode | null,
    keywords: readonly ConicPositionKeyword[],
): ConicGradientPositionNode {
    if (keywords.length > 0 && x === null && y === null) {
        return {
            kind: 'position',
            x: {
                kind: 'percentage',
                value: 0.5,
            },
            y: {
                kind: 'percentage',
                value: 0.5,
            },
            keywords: [...keywords],
        };
    }

    return {
        kind: 'position',
        x: x ?? {
            kind: 'percentage',
            value: 0.5,
        },
        y: y ?? {
            kind: 'percentage',
            value: 0.5,
        },
        keywords: [...keywords],
    };
}

function parseLengthPercentageToken(
    token: GradientLexerToken,
): GradientLengthPercentageNode | null {
    if (token.kind === TokenKind.PERCENTAGE) {
        return {
            kind: 'percentage',
            value: token.value,
        };
    }

    if (token.kind === TokenKind.DIMENSION) {
        return {
            kind: 'dimension',
            value: token.value,
            unit: token.unit,
        };
    }

    return null;
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

        for (const stop of stops) {
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