import { describe, it, expect } from 'vitest';
import { parseStringToAbi } from '../src/abi';

describe('parseStringToAbi', () => {
    it('parses function color with spaces inside', () => {
        expect(
            parseStringToAbi('linear-gradient(oklch(0.5 0.2 120), blue)')
        ).toEqual({
            functionName: 'linear-gradient',
            isRepeating: false,
            inputs: [
                { type: 'color-stop', value: 'oklch(0.5 0.2 120)' },
                { type: 'color-stop', value: 'blue' },
            ],
        });
    });

    describe('basic parsing', () => {
        it('parses simple linear gradient with two color stops', () => {
            expect(parseStringToAbi('linear-gradient(red, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses function name and trims spaces', () => {
            expect(parseStringToAbi('   linear-gradient( red , blue )   ')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses config followed by color stops', () => {
            expect(parseStringToAbi('linear-gradient(to left, red, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: 'to left' },
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses config with angle', () => {
            expect(parseStringToAbi('linear-gradient(180deg, red, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: '180deg' },
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses color hint between color stops', () => {
            expect(parseStringToAbi('linear-gradient(red, 50%, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-hint', value: '50%' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses color stop with one position', () => {
            expect(parseStringToAbi('linear-gradient(red 10%, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 10%' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses color stop with two positions', () => {
            expect(parseStringToAbi('linear-gradient(red 10% 20%, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 10% 20%' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });
    });

    describe('repeating gradients', () => {
        it('extracts repeating prefix correctly', () => {
            expect(parseStringToAbi('repeating-linear-gradient(red, blue)')).toEqual({
                functionName: 'linear-gradient',
                isRepeating: true,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses repeating gradient with config and hints', () => {
            expect(
                parseStringToAbi('repeating-linear-gradient(to left, red 10%, 50%, blue 80%)')
            ).toEqual({
                functionName: 'linear-gradient',
                isRepeating: true,
                inputs: [
                    { type: 'config', value: 'to left' },
                    { type: 'color-stop', value: 'red 10%' },
                    { type: 'color-hint', value: '50%' },
                    { type: 'color-stop', value: 'blue 80%' },
                ],
            });
        });
    });

    describe('complex values', () => {
        it('parses rgb color stop', () => {
            expect(
                parseStringToAbi('linear-gradient(rgb(255, 0, 0), blue)')
            ).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'rgb(255, 0, 0)' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });

        it('parses multiple mixed inputs', () => {
            expect(
                parseStringToAbi('linear-gradient(to left, red 10% 20%, blue, 50%, white 80%, red 200%)')
            ).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: 'to left' },
                    { type: 'color-stop', value: 'red 10% 20%' },
                    { type: 'color-stop', value: 'blue' },
                    { type: 'color-hint', value: '50%' },
                    { type: 'color-stop', value: 'white 80%' },
                    { type: 'color-stop', value: 'red 200%' },
                ],
            });
        });

        it('ignores trailing comma inside function body split result by trimming empty entries', () => {
            expect(
                parseStringToAbi('linear-gradient(red, blue,)')
            ).toEqual({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });
        });
    });

    describe('validation errors', () => {
        it('throws for empty input', () => {
            expect(() => parseStringToAbi('')).toThrow();
        });

        it('throws when function has no opening paren', () => {
            expect(() => parseStringToAbi('linear-gradient')).toThrow();
        });

        it('throws when function name is missing', () => {
            expect(() => parseStringToAbi('(red, blue)')).toThrow();
        });

        it('throws when function call is unclosed', () => {
            expect(() => parseStringToAbi('linear-gradient(red, blue')).toThrow();
        });

        it('throws when config is not followed by color-stop', () => {
            expect(() => parseStringToAbi('linear-gradient(to left, 50%, blue)')).toThrow();
        });

        it('throws when input starts with color-hint', () => {
            expect(() => parseStringToAbi('linear-gradient(50%, blue)')).toThrow();
        });

        it('throws when color-hint is last', () => {
            expect(() => parseStringToAbi('linear-gradient(red, 50%)')).toThrow();
        });

        it('throws when two color-hints go in sequence', () => {
            expect(() => parseStringToAbi('linear-gradient(rgb(255, 0, 0), 20%, 50%, blue)')).toThrow();
        });

        it('throws when there are not enough color stops after config', () => {
            expect(() => parseStringToAbi('linear-gradient(to left, red)')).toThrow();
        });
    });

    describe('custom pattern support', () => {
        it('accepts custom pattern with color-stop only', () => {
            const pattern = '^[color-stop,~color-stop].';

            expect(
                parseStringToAbi('mesh-gradient(red, blue, white)', pattern)
            ).toEqual({
                functionName: 'mesh-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                    { type: 'color-stop', value: 'white' },
                ],
            });
        });

        it('throws when custom color-stop-only pattern receives config', () => {
            const pattern = '^[color-stop,~color-stop].';

            expect(() =>
                parseStringToAbi('mesh-gradient(to left, red, blue)', pattern)
            ).toThrow();
        });
    });
});