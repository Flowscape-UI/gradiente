import {
    type GradientLexerToken,
    TokenKind,
} from '../../token';
import {
    expectToken,
    findNextNonWhitespaceIndex,
    getTokenAt,
} from '../../utils';
import type { ParseResult } from '../types';
import { parseGradientStopList } from '../helpers';
import type {
    RadialGradientNode,
    RadialGradientShape,
    RadialGradientSizeKeyword,
    RadialGradientPositionNode,
    RadialGradientSizeNode,
} from './types';
import type { GradientColorStopNode, GradientLengthPercentageNode } from '../ast';

export function parseRadialGradient(
    source: string,
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<RadialGradientNode> {
    const functionToken = getTokenAt(tokens, startIndex);

    if (
        functionToken === null ||
        (
            functionToken.kind !== TokenKind.FUNCTION_RADIAL_GRADIENT &&
            functionToken.kind !== TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT
        )
    ) {
        throw new Error('Expected radial gradient function token');
    }

    const repeat =
        functionToken.kind === TokenKind.FUNCTION_REPEATING_RADIAL_GRADIENT
            ? 'repeating'
            : 'normal';

    let index = startIndex + 1;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_OPEN);
        index = result.nextIndex;
    }

    const configResult = parseRadialConfig(tokens, index);
    const config = configResult.node ?? createDefaultRadialConfig();
    index = configResult.nextIndex;

    if (configResult.node !== null) {
        const result = expectToken(tokens, index, TokenKind.COMMA);
        index = result.nextIndex;
    }

    const stopsResult = parseGradientStopList(source, tokens, index);
    const stops = repeat === 'repeating'
        ? expandColorStops(stopsResult.node)
        : stopsResult.node;
    index = stopsResult.nextIndex;

    {
        const result = expectToken(tokens, index, TokenKind.PAREN_CLOSE);
        index = result.nextIndex;
    }

    return {
        node: {
            kind: 'radial',
            repeat,
            shape: config.shape,
            size: config.size,
            position: config.position,
            stops,
        },
        nextIndex: index,
    };
}

type RadialConfigNode = {
    shape: RadialGradientShape;
    size: RadialGradientSizeNode;
    position: RadialGradientPositionNode;
};

function parseRadialConfig(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<RadialConfigNode | null> {
    let index = findNextNonWhitespaceIndex(tokens, startIndex);

    if (index === -1) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    const shapeResult = parseRadialShape(tokens, index);
    const shape = shapeResult.node ?? 'ellipse';
    index = shapeResult.nextIndex;

    const sizeResult = parseRadialSize(tokens, index, shape);
    const size = sizeResult.node ?? createDefaultRadialSize(shape);
    index = sizeResult.nextIndex;

    const positionResult = parseRadialPosition(tokens, index);
    const position = positionResult.node ?? createDefaultRadialPosition();
    index = positionResult.nextIndex;

    const consumedSomething =
        shapeResult.node !== null ||
        sizeResult.node !== null ||
        positionResult.node !== null;

    if (!consumedSomething) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    return {
        node: {
            shape,
            size,
            position,
        },
        nextIndex: index,
    };
}

function parseRadialShape(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<RadialGradientShape | null> {
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

    if (token.kind === TokenKind.CIRCLE) {
        return {
            node: 'circle',
            nextIndex: index + 1,
        };
    }

    if (token.kind === TokenKind.ELLIPSE) {
        return {
            node: 'ellipse',
            nextIndex: index + 1,
        };
    }

    return {
        node: null,
        nextIndex: startIndex,
    };
}

function parseRadialSize(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
    shape: RadialGradientShape,
): ParseResult<RadialGradientSizeNode | null> {
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

    const keyword = parseRadialSizeKeyword(token.kind);

    if (keyword !== null) {
        return {
            node: createRadialSizeFromKeyword(shape, keyword),
            nextIndex: index + 1,
        };
    }

    const firstSize = parseLengthPercentageToken(token);

    if (firstSize === null) {
        return {
            node: null,
            nextIndex: startIndex,
        };
    }

    let nextIndex = findNextNonWhitespaceIndex(tokens, index + 1);
    let secondSize: GradientLengthPercentageNode | null = null;

    if (nextIndex !== -1) {
        const nextToken = tokens[nextIndex];

        if (nextToken !== undefined) {
            secondSize = parseLengthPercentageToken(nextToken);
        }
    }

    if (shape === 'circle') {
        return {
            node: createRadialSizeFromRadii(shape, firstSize, firstSize),
            nextIndex: index + 1,
        };
    }

    if (secondSize !== null && nextIndex !== -1) {
        return {
            node: createRadialSizeFromRadii(shape, firstSize, secondSize),
            nextIndex,
        };
    }

    return {
        node: createRadialSizeFromRadii(shape, firstSize, firstSize),
        nextIndex: index + 1,
    };
}

function parseRadialPosition(
    tokens: readonly GradientLexerToken[],
    startIndex: number,
): ParseResult<RadialGradientPositionNode | null> {
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

    const keywords: string[] = [];
    let x: GradientLengthPercentageNode | null = null;
    let y: GradientLengthPercentageNode | null = null;

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
        node: createRadialPositionNode(x, y, keywords),
        nextIndex: index,
    };
}

function createDefaultRadialConfig(): RadialConfigNode {
    return {
        shape: 'ellipse',
        size: createDefaultRadialSize('ellipse'),
        position: createDefaultRadialPosition(),
    };
}

function createDefaultRadialSize(
    shape: RadialGradientShape,
): RadialGradientSizeNode {
    return createRadialSizeFromKeyword(shape, 'farthest-corner');
}

function createDefaultRadialPosition(): RadialGradientPositionNode {
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

function createRadialPositionNode(
    x: GradientLengthPercentageNode | null,
    y: GradientLengthPercentageNode | null,
    keywords: readonly string[],
): RadialGradientPositionNode {
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
            keywords,
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
        keywords,
    };
}

function createRadialSizeFromKeyword(
    shape: RadialGradientShape,
    keyword: RadialGradientSizeKeyword,
): RadialGradientSizeNode {
    return {
        kind: 'size',
        shape,
        keyword,
        radiusX: {
            kind: 'percentage',
            value: 1,
        },
        radiusY: {
            kind: 'percentage',
            value: shape === 'circle' ? 1 : 1,
        },
    };
}

function createRadialSizeFromRadii(
    shape: RadialGradientShape,
    radiusX: GradientLengthPercentageNode,
    radiusY: GradientLengthPercentageNode,
): RadialGradientSizeNode {
    return {
        kind: 'size',
        shape,
        keyword: 'farthest-corner',
        radiusX,
        radiusY,
    };
}

function parseRadialSizeKeyword(kind: GradientLexerToken['kind']): RadialGradientSizeKeyword | null {
    switch (kind) {
        case TokenKind.CLOSEST_SIDE:
            return 'closest-side';
        case TokenKind.CLOSEST_CORNER:
            return 'closest-corner';
        case TokenKind.FARTHEST_SIDE:
            return 'farthest-side';
        case TokenKind.FARTHEST_CORNER:
            return 'farthest-corner';
        default:
            return null;
    }
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

    const percentageSum = stops.reduce((sum, stop) => {
        const position = stop.position;

        if (!position || position.kind !== 'percentage') {
            return sum;
        }

        return sum + position.value;
    }, 0);

    if (percentageSum <= 0) {
        return stops;
    }

    const newStops: GradientColorStopNode[] = [...stops];
    let offset = percentageSum;

    while ((newStops[newStops.length - 1]?.position.value ?? 0) <= 1) {
        for (const stop of stops) {
            const position = stop.position;

            if (!position || position.kind !== 'percentage') {
                continue;
            }

            newStops.push({
                ...stop,
                position: {
                    kind: 'percentage',
                    value: position.value + offset,
                },
            });
        }

        offset += percentageSum;
    }

    return newStops;
}