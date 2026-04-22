import { describe, it, expect } from 'vitest';
import { LinearGradient } from '../../src';

describe('LinearGradient', () => {
    describe('LinearGradient basic implementation', () => {
        it('sets the correct type during initialization', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.type).toBe('linear-gradient');
        });

        it('clone returns a LinearGradient instance', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned).toBeInstanceOf(LinearGradient);
        });

        it('clone preserves the correct type', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0.5 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned.type).toBe('linear-gradient');
        });

        it('clone preserves config, repeating flag and stops', () => {
            const gradient = new LinearGradient({
                isRepeating: true,
                config: { angle: 1.5 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned.toJSON()).toEqual({
                type: 'linear-gradient',
                isRepeating: true,
                config: { angle: 1.5 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });
        });

        it('clone returns a different instance', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned).not.toBe(gradient);
        });

        it('toString returns a string', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(typeof gradient.toString()).toBe('string');
        });

        it('toString uses linear-gradient for non-repeating gradients', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('linear-gradient(');
            expect(gradient.toString()).not.toContain('repeating-linear-gradient(');
        });

        it('toString uses repeating-linear-gradient for repeating gradients', () => {
            const gradient = new LinearGradient({
                isRepeating: true,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('repeating-linear-gradient(');
        });

        it('toString includes the configured angle', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 1.5707963267948966 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('rad');
        });

        it('toString includes color-stop values', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red');
            expect(result).toContain('blue');
        });

        it('serializes a non-repeating linear gradient with function name "linear-gradient"', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('linear-gradient(');
            expect(gradient.toString()).not.toContain('repeating-linear-gradient(');
        });

        it('serializes a repeating linear gradient with function name "repeating-linear-gradient"', () => {
            const gradient = new LinearGradient({
                isRepeating: true,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('repeating-linear-gradient(');
        });

        it('serializes the angle config in the output string', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('deg');
        });

        it('serializes simple two-stop gradient without explicit positions when stops are evenly distributed', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red');
            expect(result).toContain('blue');
            expect(result).not.toContain('red 0%');
            expect(result).not.toContain('blue 100%');
        });

        it('serializes multiple evenly distributed color-stops without explicit positions', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 / 3 },
                    { type: 'color-stop', value: 'brown', position: 2 / 3 },
                    { type: 'color-stop', value: 'white', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red');
            expect(result).toContain('blue');
            expect(result).toContain('brown');
            expect(result).toContain('white');

            expect(result).not.toContain('0%');
            expect(result).not.toContain('33');
            expect(result).not.toContain('66');
            expect(result).not.toContain('100%');
        });

        it('keeps explicit positions when color-stops are not evenly distributed', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 0.2 },
                    { type: 'color-stop', value: 'brown', position: 0.8 },
                    { type: 'color-stop', value: 'white', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red 0%');
            expect(result).toContain('blue 20%');
            expect(result).toContain('brown 80%');
            expect(result).toContain('white 100%');
        });

        it('serializes a color-hint when it is present and meaningful', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0.1 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 0.8 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red 10%');
            expect(result).toContain('50%');
            expect(result).toContain('blue 80%');
        });

        it('does not omit positions when a color-hint is present', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('50%');
        });

        it('collapses two adjacent identical color-stops into a double-position stop', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0.5 },
                    { type: 'color-stop', value: 'red', position: 0.6 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red 50% 60%');
            expect(result).toContain('blue 100%');
        });

        it('does not collapse adjacent color-stops when their values differ', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 0.6 },
                ],
            });

            const result = gradient.toString();

            expect(result).not.toContain('red 50% 60%');
            expect(result).toContain('red 50%');
            expect(result).toContain('blue 60%');
        });

        it('does not collapse identical color-stops when a color-hint exists between them', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0.5 },
                    { type: 'color-hint', value: '55%', position: 0.55 },
                    { type: 'color-stop', value: 'red', position: 0.6 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).not.toContain('red 50% 60%');
            expect(result).toContain('red 50%');
            expect(result).toContain('55%');
            expect(result).toContain('red 60%');
        });

        it('serializes a mixed gradient with explicit positions, a hint, and a repeated stop range', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI / 2 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0.1 },
                    { type: 'color-stop', value: 'red', position: 0.2 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 0.8 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red 10% 20%');
            expect(result).toContain('50%');
            expect(result).toContain('blue 80%');
        });

        it('keeps output deterministic for the same gradient state', () => {
            const gradient = new LinearGradient({
                isRepeating: true,
                config: { angle: Math.PI / 4 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'green', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const first = gradient.toString();
            const second = gradient.toString();

            expect(first).toBe(second);
        });

        it('includes all stop values in the final string', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: Math.PI },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'green', position: 0.3 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('red');
            expect(result).toContain('green');
            expect(result).toContain('blue');
        });

        it('produces a valid linear-gradient wrapper with comma-separated arguments', () => {
            const gradient = new LinearGradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result.startsWith('linear-gradient(')).toBe(true);
            expect(result.endsWith(')')).toBe(true);
            expect(result.includes(',')).toBe(true);
        });
    });

    describe('LinearGradient.fromAbi', () => {
        it('creates a LinearGradient instance from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient).toBeInstanceOf(LinearGradient);
            expect(gradient.type).toBe('linear-gradient');
        });

        it('uses the repeating flag from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: true,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.isRepeating).toBe(true);
        });

        it('uses default angle when config is missing', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.config).toEqual({
                angle: expect.any(Number),
            });
        });

        it('parses keyword config from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: 'to right' },
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.config).toEqual({
                angle: expect.any(Number),
            });
        });

        it('parses angle config in deg from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: '180deg' },
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.config).toEqual({
                angle: expect.any(Number),
            });
        });

        it('throws on invalid config from ABI', () => {
            expect(() =>
                LinearGradient.fromAbi({
                    functionName: 'linear-gradient',
                    isRepeating: false,
                    inputs: [
                        { type: 'config', value: 'to banana' },
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-stop', value: 'blue' },
                    ],
                }),
            ).toThrow();
        });

        it('normalizes two simple color-stops without explicit positions', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('normalizes explicit stop positions from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 20%' },
                    { type: 'color-stop', value: 'blue 80%' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0.2 },
                { type: 'color-stop', value: 'blue', position: 0.8 },
            ]);
        });

        it('normalizes a color-hint between two color-stops from ABI', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 10%' },
                    { type: 'color-hint', value: '50%' },
                    { type: 'color-stop', value: 'blue 80%' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0.1 },
                { type: 'color-hint', value: '50%', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 0.8 },
            ]);
        });

        it('expands a double-position color-stop into two normalized color-stops', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 20% 50%' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0.2 },
                { type: 'color-stop', value: 'red', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('preserves function-like color values when parsing ABI stops', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'rgb(255, 0, 0) 20%' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.stops[0]).toEqual({
                type: 'color-stop',
                value: 'rgb(255, 0, 0)',
                position: 0.2,
            });
        });

        it('interpolates missing positions between defined stops', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red 0%' },
                    { type: 'color-stop', value: 'green' },
                    { type: 'color-stop', value: 'blue 100%' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'green', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('assigns default first and last positions when omitted', () => {
            const gradient = LinearGradient.fromAbi({
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'green' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'green', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('throws when ABI contains unsupported input type for linear gradient normalization', () => {
            expect(() =>
                LinearGradient.fromAbi({
                    functionName: 'linear-gradient',
                    isRepeating: false,
                    inputs: [
                        { type: 'unknown', value: '???' } as any,
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-stop', value: 'blue' },
                    ],
                }),
            ).toThrow();
        });
    });

    describe('LinearGradient.fromString', () => {
        it('creates a LinearGradient from a simple string', () => {
            const gradient = LinearGradient.fromString(
                'linear-gradient(red, blue)',
            );

            expect(gradient).toBeInstanceOf(LinearGradient);
            expect(gradient.type).toBe('linear-gradient');
        });

        it('creates a repeating LinearGradient from string', () => {
            const gradient = LinearGradient.fromString(
                'repeating-linear-gradient(red, blue)',
            );

            expect(gradient).toBeInstanceOf(LinearGradient);
            expect(gradient.isRepeating).toBe(true);
        });

        it('can parse config and stops from string through ABI delegation', () => {
            const gradient = LinearGradient.fromString(
                'linear-gradient(to right, red 10%, 50%, blue 80%)',
            );

            expect(gradient.config).toEqual({
                angle: expect.any(Number),
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0.1 },
                { type: 'color-hint', value: '50%', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 0.8 },
            ]);
        });
    });
});