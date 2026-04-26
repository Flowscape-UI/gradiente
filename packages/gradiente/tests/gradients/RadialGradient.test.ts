import { describe, it, expect } from 'vitest';
import { RadialGradient } from '../../src';

describe('RadialGradient', () => {
    describe('RadialGradient basic implementation', () => {
        it('sets the correct type during initialization', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.type).toBe('radial-gradient');
        });

        it('clone returns a RadialGradient instance', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'circle',
                    size: { kind: 'extent', value: 'closest-side' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned).toBeInstanceOf(RadialGradient);
        });

        it('clone preserves the correct type', () => {
            const gradient = new RadialGradient({
                isRepeating: true,
                config: {
                    shape: 'circle',
                    size: { kind: 'extent', value: 'farthest-side' },
                    position: {
                        kind: 'values',
                        x: { kind: 'percent', value: 49 },
                        y: { kind: 'percent', value: 45 },
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned.type).toBe('radial-gradient');
        });

        it('clone preserves config, repeating flag and stops', () => {
            const gradient = new RadialGradient({
                isRepeating: true,
                config: {
                    shape: 'circle',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'values',
                        x: { kind: 'percent', value: 49 },
                        y: { kind: 'percent', value: 45 },
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned.toJSON()).toEqual({
                type: 'radial-gradient',
                isRepeating: true,
                config: {
                    shape: 'circle',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'values',
                        x: { kind: 'percent', value: 49 },
                        y: { kind: 'percent', value: 45 },
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });
        });

        it('clone returns a different instance', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            expect(cloned).not.toBe(gradient);
        });
    });

    describe('RadialGradient.toString', () => {
        it('returns a string', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(typeof gradient.toString()).toBe('string');
        });

        it('uses radial-gradient for non-repeating gradients', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('radial-gradient(');
            expect(gradient.toString()).not.toContain('repeating-radial-gradient(');
        });

        it('uses repeating-radial-gradient for repeating gradients', () => {
            const gradient = new RadialGradient({
                isRepeating: true,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            expect(gradient.toString()).toContain('repeating-radial-gradient(');
        });

        it('includes serialized config', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'circle',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'values',
                        x: { kind: 'percent', value: 49 },
                        y: { kind: 'percent', value: 45 },
                    },
                },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const result = gradient.toString();

            expect(result).toContain('circle');
            expect(result).toContain('farthest-corner');
            expect(result).toContain('at 49% 45%');
        });

        it('includes color-stop values', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: { kind: 'extent', value: 'farthest-corner' },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
    });

    describe('RadialGradient.fromAbi', () => {
        it('creates a RadialGradient from a simple ABI', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient).toBeInstanceOf(RadialGradient);
            expect(gradient.type).toBe('radial-gradient');
            expect(gradient.isRepeating).toBe(false);
        });

        it('preserves repeating flag from ABI', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
                isRepeating: true,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.isRepeating).toBe(true);
        });

        it('uses default config when ABI has no config input', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            });

            expect(gradient.config).toEqual({
                shape: 'ellipse',
                size: { kind: 'extent', value: 'farthest-corner' },
                position: {
                    kind: 'keywords',
                    x: 'center',
                    y: 'center',
                },
            });
        });

        it('parses config input from ABI', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'config', value: 'circle farthest-corner at 49% 45%' },
                    { type: 'color-stop', value: 'red 10%' },
                    { type: 'color-stop', value: 'blue 80%' },
                ],
            });

            expect(gradient.config).toEqual({
                shape: 'circle',
                size: { kind: 'extent', value: 'farthest-corner' },
                position: {
                    kind: 'values',
                    x: { kind: 'percent', value: 49 },
                    y: { kind: 'percent', value: 45 },
                },
            });
        });

        it('normalizes stop positions from ABI', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
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

        it('assigns default first and last positions when omitted', () => {
            const gradient = RadialGradient.fromAbi({
                functionName: 'radial-gradient',
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

        it('throws when ABI contains unsupported input type for stop normalization', () => {
            expect(() =>
                RadialGradient.fromAbi({
                    functionName: 'radial-gradient',
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

    describe('RadialGradient.fromString', () => {
        it('creates a RadialGradient from a simple string', () => {
            const gradient = RadialGradient.fromString(
                'radial-gradient(red, blue)',
            );

            expect(gradient).toBeInstanceOf(RadialGradient);
            expect(gradient.type).toBe('radial-gradient');
        });

        it('creates a repeating RadialGradient from string', () => {
            const gradient = RadialGradient.fromString(
                'repeating-radial-gradient(red, blue)',
            );

            expect(gradient).toBeInstanceOf(RadialGradient);
            expect(gradient.isRepeating).toBe(true);
        });

        it('can parse config and stops from string through ABI delegation', () => {
            const gradient = RadialGradient.fromString(
                'radial-gradient(circle farthest-corner at 49% 45%, red 10%, 50%, blue 80%)',
            );

            expect(gradient.config).toEqual({
                shape: 'circle',
                size: { kind: 'extent', value: 'farthest-corner' },
                position: {
                    kind: 'values',
                    x: { kind: 'percent', value: 49 },
                    y: { kind: 'percent', value: 45 },
                },
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0.1 },
                { type: 'color-hint', value: '50%', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 0.8 },
            ]);
        });
    });
});