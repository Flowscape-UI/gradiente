import { describe, it, expect } from 'vitest';
import { tokenize, parseLinearGradient, degToRad, roundTo, parseRadialGradient } from '../src';


function parseRadial(source: string) {
    const tokens = tokenize(source);
    return parseRadialGradient(source, tokens, 0);
}

describe('parseRadialGradient', () => {
    describe.only('check basic parsing', () => {
        it.only('should return correct kind and repeat mode', () => {
            // Check normal radial-gradient
            const value = parseRadial('radial-gradient(red, blue)');
            expect(value.node.kind).toBe('radial');
            expect(value.node.repeat).toBe('normal');

            // Check repeating-radial-gradient
            const repeatingValue = parseRadial('repeating-radial-gradient(red 10%, blue 20%)');
            expect(repeatingValue.node.kind).toBe('radial');
            expect(repeatingValue.node.repeat).toBe('repeating');

            console.log(value.node)
        });

        it('should parse direction correctly', () => {
            const angleDeg = 90;
    
            const valueNormal = parseLinear('linear-gradient(to right, red, blue)').node.direction;
            const valueRepeating = parseLinear('repeating-linear-gradient(to right, red, blue)').node.direction;
    
            const expectedDirection = {
                kind: 'angle',
                value: {
                    kind: 'dimension',
                    value: angleDeg,
                    unit: 'deg',
                },
                valueRaw: {
                    kind: 'dimension',
                    value: roundTo(degToRad(angleDeg), 6),
                    unit: 'rad',
                },
                keywords: ['to', 'right'],
            };
    
            expect(valueNormal).toEqual(expectedDirection);
            expect(valueRepeating).toEqual(expectedDirection);
        });

        it('should check all direction keywords combinations', () => {
            const directions = [
                ['to', 'top'],
                ['to', 'bottom'],
                ['to', 'left'],
                ['to', 'right'],
                ['to', 'top', 'left'],
                ['to', 'top', 'right'],
                ['to', 'bottom', 'left'],
                ['to', 'bottom', 'right'],
            ] as const;
    
            const angles = [0, 180, 270, 90, 315, 45, 225, 135] as const;
    
            for (let i = 0; i < directions.length; i++) {
                const keyword = directions[i].join(' ');
                const deg = angles[i];
    
                const source = `linear-gradient(${keyword}, red, blue)`;
                const value = parseLinear(source).node.direction!;
    
                expect(value.value.value).toEqual(deg);
            }
        });
    });

    describe('check normal gradient stops parsing', () => {
        it('should parse color stops with single position', () => {
            const value = parseLinear('linear-gradient(red 50%, blue)').node.stops;
            expect(value).toEqual([
                {
                    kind: 'color-stop',
                    color: 'red',
                    position: {
                        kind: 'percentage',
                        value: 0.5,
                    },
                },
                {
                    kind: 'color-stop',
                    color: 'blue',
                    position: {
                        kind: 'percentage',
                        value: 1,
                    },
                },
            ]);
        });

        it('should parse color stops with multiple positions', () => {
            const value = parseLinear('linear-gradient(red 20% 40%, blue)').node.stops;
            console.log(value);
            
            // expect(value).toEqual([
            //     {
            //         kind: 'color-stop',
            //         color: 'red',
            //         positions: [
            //             {
            //                 kind: 'percentage',
            //                 value: 20,
            //             },
            //             {
            //                 kind: 'percentage',
            //                 value: 40,
            //             },
            //         ],
            //     },
            //     {
            //         kind: 'color-stop',
            //         color: 'blue',
            //         positions: [],
            //     },
            // ]);
        });
    });
});