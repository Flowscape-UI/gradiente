import { describe, it, expect } from 'vitest';
import { degToRad, GradientData, LinearGradient, LinearGradientConfig } from '../../src';

describe.only('LinearGradient', () => {
    const gradientConfig: GradientData<LinearGradientConfig> = {
        isRepeating: false,
        config: { angle: 0 },
        stops: [
            { type: 'color-stop', value: 'red', position: 0 },
            { type: 'color-hint', value: '50%', position: 0.5 },
            { type: 'color-stop', value: 'blue', position: 1 },
        ],
    };
    const repeatingGradientConfig: GradientData<LinearGradientConfig> = {
        isRepeating: true,
        config: { angle: 0 },
        stops: [
            { type: 'color-stop', value: 'red', position: 0 },
            { type: 'color-hint', value: '50%', position: 0.5 },
            { type: 'color-stop', value: 'blue', position: 1 },
        ],
    };

    describe('Basic implementation', () => {
        it('sets the correct type during initialization', () => {
            const gradient = new LinearGradient(gradientConfig);
            const repeatingGradient = new LinearGradient(repeatingGradientConfig);

            // Check simple gradient
            expect(gradient.type).toBe('linear-gradient');
            expect(gradient.isRepeating).toBe(false);

            // Check repeating gradient
            expect(repeatingGradient.type).toBe('linear-gradient');
            expect(repeatingGradient.isRepeating).toBe(true);
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
            const gradient = new LinearGradient(gradientConfig);
            const first = gradient.toString();
            const second = gradient.toString();
            expect(first).toBe(second);
        });

        it('includes all stop values in the final string', () => {
            const gradient = new LinearGradient(gradientConfig);
            const result = gradient.toString();

            expect(result).toContain('red');
            expect(result).toContain('blue');
        });
    });

    describe('LinearGradient.clone()', () => {
        it('clone returns a LinearGradient instance', () => {
            const gradient = new LinearGradient(gradientConfig);
            const cloned = gradient.clone();
            expect(cloned).toBeInstanceOf(LinearGradient);
        });

        it('clone preserves the correct type', () => {
            const gradient = new LinearGradient(gradientConfig);
            const repeatingGradient = new LinearGradient(repeatingGradientConfig);

            const cloned = gradient.clone();
            const repeatingCloned = repeatingGradient.clone();

            expect(cloned.type).toBe('linear-gradient');
            expect(repeatingCloned.type).toBe('linear-gradient');
        });

        it('clone preserves config, repeating flag and stops', () => {
            const gradient = new LinearGradient(gradientConfig);
            const repeatingGradient = new LinearGradient(repeatingGradientConfig);

            const cloned = gradient.clone();
            const repeatingCloned = repeatingGradient.clone();

            expect(cloned.toJSON()).toEqual({ type: "linear-gradient", ...gradientConfig });
            expect(repeatingCloned.toJSON()).toEqual({ type: "linear-gradient", ...repeatingGradientConfig });
        });

        it('clone returns a different instance', () => {
            const gradient = new LinearGradient(gradientConfig);
            const gradientCopy = new LinearGradient(gradientConfig);
            const repeatingGradient = new LinearGradient(repeatingGradientConfig);

            const cloned = gradient.clone();
            const repeatingCloned = repeatingGradient.clone();

            expect(gradient).not.toBe(cloned);
            expect(gradient).not.toBe(gradientCopy);
            expect(gradient).not.toBe(repeatingGradient);
            expect(repeatingGradient).not.toBe(repeatingCloned);
        });

        // Mutability checks
        it('constructor does not keep external config reference', () => {
            const config = structuredClone(gradientConfig);
            const gradient = new LinearGradient(config);

            config.stops[0].value = 'blue';

            expect(gradient.toJSON()).toEqual({
                type: 'linear-gradient',
                ...gradientConfig,
            });
        });

        it('toJSON does not expose internal mutable state', () => {
            const gradient = new LinearGradient(gradientConfig);
            const json = gradient.toJSON();

            json.type = "cool-type";
            json.isRepeating = true;
            json.config.angle = 3.1415;
            json.stops[0].value = 'blue';
            json.stops[1].value = 'white';

            // Json copy should be changed without limits
            expect(json.type).toBe('cool-type');
            expect(json.isRepeating).toBe(true);
            expect(json.config.angle).toBe(3.1415);
            expect(json.stops[0].value).toBe('blue');
            expect(json.stops[1].value).toBe('white');

            // Original gradient does not change
            expect(gradient.type).toBe('linear-gradient');
            expect(gradient.isRepeating).toBe(false);
            expect(gradient.config.angle).toBe(0);
            expect(gradient.stops[0].value).toBe('red');
            expect(gradient.stops[gradient.stops.length - 1].value).toBe('blue');
        });

        it('clone preserves data but does not share json references with original', () => {
            const gradient = new LinearGradient(gradientConfig);
            const cloned = gradient.clone();

            const originalJson = gradient.toJSON();
            const clonedJson = cloned.toJSON();

            expect(clonedJson).toEqual(originalJson);
            expect(clonedJson).not.toBe(originalJson);
            expect(clonedJson.stops).not.toBe(originalJson.stops);
            expect(clonedJson.stops[0]).not.toBe(originalJson.stops[0]);
        });

        it('clone does not share state with original', () => {
            const gradient = new LinearGradient(gradientConfig);
            const cloned = gradient.clone();

            cloned.addStop({
                type: 'color-stop',
                value: 'blue',
                position: 0.55,
            });
            expect(gradient.stops).toHaveLength(gradientConfig.stops.length);
            expect(cloned.stops).toHaveLength(gradientConfig.stops.length + 1);
        });

        it('original does not mutate clone after cloning', () => {
            const gradient = new LinearGradient(gradientConfig);
            const cloned = gradient.clone();

            gradient.removeStop(0);

            // minus 2 because if there is color-hint on edges it also removes
            expect(gradient.stops).toHaveLength(gradientConfig.stops.length - 2);
            expect(cloned.stops).toHaveLength(gradientConfig.stops.length);
        });

        it('clone does not share config object with original', () => {
            const gradient = new LinearGradient(gradientConfig);
            const cloned = gradient.clone();

            const newConfig = 23;
            cloned.config.angle = newConfig;

            expect(gradient.config.angle).not.toBe(newConfig);
            expect(cloned.config.angle).not.toBe(newConfig);
        });
    });

    describe('LinearGradient.toString()', () => {
        it('should return a string type', () => {
            const gradient = new LinearGradient(gradientConfig);
            expect(typeof gradient.toString()).toBe('string');
        });

        it('should use `linear-gradient` for non-repeating gradients and `repeating-linear-gradient` for repeating', () => {
            const gradient = new LinearGradient(gradientConfig);
            const repeatingGradient = new LinearGradient(repeatingGradientConfig);

            expect(gradient.toString()).toContain('linear-gradient(');
            expect(gradient.toString()).not.toContain('repeating-linear-gradient(');
            expect(repeatingGradient.toString()).toContain('repeating-linear-gradient(');
        });

        it('should return CSS3 valid string', () => {
            const configCopy = { ...structuredClone(gradientConfig), config: { angle: 1.57079 } };
            const gradient = new LinearGradient(configCopy);
            const result = gradient.toString();
            expect(result).toBe('linear-gradient(to right, red 0%, 50%, blue 100%)');
        });

        it('should format standard angles using CSS directional keywords', () => {
            const gradientToTop = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: 0, // 0deg
                },
            });

            const gradientToTopRight = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(45), // 45deg
                },
            });

            const gradientToRight = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(90), // 90deg
                },
            });

            const gradientToBottomRight = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(135), // 135deg
                },
            });

            const gradientToBottom = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(180), // 180deg
                },
            });

            const gradientToBottomLeft = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(225), // 225deg
                },
            });

            const gradientToLeft = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(270), // 270deg
                },
            });

            const gradientToTopLeft = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(315), // 315deg
                },
            });

            const gradient130Deg = new LinearGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    angle: degToRad(130), // 130deg
                },
            });

            expect(gradientToTop.toString()).toContain('to top');
            expect(gradientToTopRight.toString()).toContain('to top right');
            expect(gradientToRight.toString()).toContain('to right');
            expect(gradientToBottomRight.toString()).toContain('to bottom right');
            expect(gradientToBottom.toString()).not.toContain('to bottom');
            expect(gradientToBottom.toString()).not.toContain('180deg');
            expect(gradientToBottom.toString()).toBe('linear-gradient(red 0%, 50%, blue 100%)');
            expect(gradientToBottomLeft.toString()).toContain('to bottom left');
            expect(gradientToLeft.toString()).toContain('to left');
            expect(gradientToTopLeft.toString()).toContain('to top left');
            expect(gradient130Deg.toString()).toContain('130deg');
        });

        it('should normalize overflow angles before formatting', () => {
            const gradient = new LinearGradient({
                ...gradientConfig,
                config: { ...gradientConfig.config, angle: degToRad(450) }, // 450deg = 90deg
            });
            expect(gradient.toString()).toContain('to right');
        });

        it('should normalize negative angles before formatting', () => {
            const gradient = new LinearGradient({
                ...gradientConfig,
                config: { ...gradientConfig.config, angle: -degToRad(90) }, // -90deg = 270deg
            });
            expect(gradient.toString()).toContain('to left');
        });

        it('should serialize simple two-stop gradient without explicit positions when stops are evenly distributed', () => {
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

        it('should not omit positions when a color-hint is present', () => {
            const gradient = new LinearGradient(gradientConfig);
            const result = gradient.toString();
            expect(result).toContain('50%');
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
    });

    describe('LinearGradient.fromAbi', () => {
        it('should create a LinearGradient instance from ABI', () => {
            const config = {
                functionName: 'linear-gradient',
                isRepeating: false,
                inputs: [
                    { type: 'color-stop', value: 'red' },
                    { type: 'color-stop', value: 'blue' },
                ],
            };
            const repeatingConfig = structuredClone({...config, isRepeating: true});

            const gradient = LinearGradient.fromAbi(config);
            const repeatingGradient = LinearGradient.fromAbi(repeatingConfig);

            expect(gradient).toBeInstanceOf(LinearGradient);
            expect(gradient.type).toBe('linear-gradient');
            expect(repeatingGradient.type).toBe('linear-gradient');

            expect(gradient.isRepeating).toBe(false);
            expect(repeatingGradient.isRepeating).toBe(true);
        });

        it('should return default angle when config is missing', () => {
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

        it.only('should parse keyword config from ABI', () => {
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