import { describe, it, expect } from 'vitest';
import { GradientData, RadialGradient, RadialGradientConfig } from '../../src';

describe('RadialGradient', () => {
    const gradientConfig: GradientData<RadialGradientConfig> = {
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
    };
    const repeatingGradientConfig: GradientData<RadialGradientConfig> = {
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
            { type: 'color-hint', value: '50%', position: 0.5 },
            { type: 'color-stop', value: 'blue', position: 1 },
        ],
    };



    describe('Basic implementation', () => {
        it('sets the correct type during initialization', () => {
            const gradient = new RadialGradient(gradientConfig);
            const repeatingGradient = new RadialGradient(repeatingGradientConfig);

            // Check simple gradient
            expect(gradient.type).toBe('radial-gradient');
            expect(gradient.isRepeating).toBe(false);

            // Check repeating gradient
            expect(repeatingGradient.type).toBe('radial-gradient');
            expect(repeatingGradient.isRepeating).toBe(true);
        });

        it('sets the correct interpolation during initialization', () => {
            const gradient = new RadialGradient({
                ...gradientConfig,
                config: {
                    shape: gradientConfig.config.shape,
                    size: gradientConfig.config.size,
                    position: gradientConfig.config.position,
                    interpolation: {
                        colorSpace: "a98-rgb",
                        hue: "increasing"
                    }
                }
            });

            expect(gradient.config.interpolation).toEqual({
                colorSpace: "a98-rgb"
            });
        });

        it('serializes multiple evenly distributed color-stops without explicit positions', () => {
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: {
                        kind: 'extent',
                        value: 'farthest-corner',
                    },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: {
                        kind: 'extent',
                        value: 'farthest-corner',
                    },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: {
                        kind: 'extent',
                        value: 'farthest-corner',
                    },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: {
                        kind: 'extent',
                        value: 'farthest-corner',
                    },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
            const gradient = new RadialGradient({
                isRepeating: false,
                config: {
                    shape: 'ellipse',
                    size: {
                        kind: 'extent',
                        value: 'farthest-corner',
                    },
                    position: {
                        kind: 'keywords',
                        x: 'center',
                        y: 'center',
                    },
                },
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
    });

    describe('RadialGradient.clone()', () => {
        it('clone returns a RadialGradient instance', () => {
            const gradient = new RadialGradient(gradientConfig);
            const cloned = gradient.clone();
            expect(cloned).toBeInstanceOf(RadialGradient);
        });

        it('clone preserves the correct type', () => {
            const gradient = new RadialGradient(gradientConfig);
            const repeatingGradient = new RadialGradient(repeatingGradientConfig);

            const cloned = gradient.clone();
            const repeatingCloned = repeatingGradient.clone();

            expect(cloned.type).toBe('radial-gradient');
            expect(repeatingCloned.type).toBe('radial-gradient');
        });

        it('clone preserves config, repeating flag and stops', () => {
            const gradient = new RadialGradient(gradientConfig);
            const repeatingGradient = new RadialGradient(repeatingGradientConfig);

            const cloned = gradient.clone();
            const repeatingCloned = repeatingGradient.clone();

            expect(cloned.toJSON()).toEqual({ type: "radial-gradient", ...gradientConfig });
            expect(repeatingCloned.toJSON()).toEqual({ type: "radial-gradient", ...repeatingGradientConfig });
        });

        it('clone returns a different instance', () => {
            const gradient = new RadialGradient(gradientConfig);
            const gradientCopy = new RadialGradient(gradientConfig);
            const repeatingGradient = new RadialGradient(repeatingGradientConfig);

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
            const gradient = new RadialGradient(config);

            config.stops[0].value = 'blue';

            expect(gradient.toJSON()).toEqual({
                type: 'radial-gradient',
                ...gradientConfig,
            });
        });

        it('toJSON does not expose internal mutable state', () => {
            const gradient = new RadialGradient(gradientConfig);
            const json = gradient.toJSON();

            json.type = "cool-type";
            json.isRepeating = true;
            json.config.shape = "cool-shape" as any;
            json.stops[0].value = 'blue';
            json.stops[1].value = 'white';

            // Json copy should be changed without limits
            expect(json.type).toBe('cool-type');
            expect(json.isRepeating).toBe(true);
            expect(json.config.shape).toBe('cool-shape');
            expect(json.stops[0].value).toBe('blue');
            expect(json.stops[1].value).toBe('white');

            // Original gradient does not change
            expect(gradient.type).toBe('radial-gradient');
            expect(gradient.isRepeating).toBe(false);
            expect(gradient.config.shape).toBe('ellipse');
            expect(gradient.stops[0].value).toBe('red');
            expect(gradient.stops[gradient.stops.length - 1].value).toBe('blue');
        });

        it('clone preserves data but does not share json references with original', () => {
            const gradient = new RadialGradient(gradientConfig);
            const cloned = gradient.clone();

            const originalJson = gradient.toJSON();
            const clonedJson = cloned.toJSON();

            expect(clonedJson).toEqual(originalJson);
            expect(clonedJson).not.toBe(originalJson);
            expect(clonedJson.stops).not.toBe(originalJson.stops);
            expect(clonedJson.stops[0]).not.toBe(originalJson.stops[0]);
        });

        it('clone does not share state with original', () => {
            const gradient = new RadialGradient(gradientConfig);
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
            const gradient = new RadialGradient(gradientConfig);
            const cloned = gradient.clone();

            gradient.removeStop(0);

            // minus 2 because if there is color-hint on edges it also removes
            expect(gradient.stops).toHaveLength(gradientConfig.stops.length - 2);
            expect(cloned.stops).toHaveLength(gradientConfig.stops.length);
        });

        it('clone does not share config object with original', () => {
            const gradient = new RadialGradient(gradientConfig);
            const cloned = gradient.clone();

            const newConfig = "cool-shape" as any;
            cloned.config.shape = newConfig;

            expect(gradient.config.shape).not.toBe(newConfig);
            expect(cloned.config.shape).not.toBe(newConfig);
        });
    });

    describe('RadialGradient.toString()', () => {
        it('should return a string type', () => {
            const gradient = new RadialGradient(gradientConfig);
            expect(typeof gradient.toString()).toBe('string');
        });

        it('should use `radial-gradient` for radial gradients', () => {
            const gradient = new RadialGradient(gradientConfig);
            const repeatingGradient = new RadialGradient(repeatingGradientConfig);

            expect(gradient.toString()).toContain('radial-gradient(');
            expect(gradient.toString()).not.toContain('repeating-radial-gradient(');
            expect(repeatingGradient.toString()).toContain('repeating-radial-gradient(');
        });

        it('should return CSS3 valid string', () => {
            const configCopy = {
                ...structuredClone(gradientConfig),
                config: {
                    shape: "circle",
                    size: {
                        kind: "extent",
                        value: "closest-side",
                    },
                    position: {
                        kind: "keywords",
                        x: "left",
                        y: "center",
                    },
                }
            };
            const gradient = new RadialGradient(configCopy);
            const result = gradient.toString();
            expect(result).toBe('radial-gradient(circle closest-side at left center, red 0%, 50%, blue 100%)');
        });

        it('should format standard positions using CSS position keywords', () => {
            const gradientAtCenter = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "center",
                        y: "center",
                    },
                },
            });

            const gradientAtTop = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "center",
                        y: "top",
                    },
                },
            });

            const gradientAtTopRight = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "right",
                        y: "top",
                    },
                },
            });

            const gradientAtRight = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "right",
                        y: "center",
                    },
                },
            });

            const gradientAtBottomRight = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "right",
                        y: "bottom",
                    },
                },
            });

            const gradientAtBottom = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "center",
                        y: "bottom",
                    },
                },
            });

            const gradientAtBottomLeft = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "left",
                        y: "bottom",
                    },
                },
            });

            const gradientAtLeft = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "left",
                        y: "center",
                    },
                },
            });

            const gradientAtTopLeft = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    shape: "ellipse",
                    size: {
                        kind: "extent",
                        value: "farthest-corner",
                    },
                    position: {
                        kind: "keywords",
                        x: "left",
                        y: "top",
                    },
                },
            });

            console.log(gradientAtCenter.toString());
            expect(gradientAtCenter.toString()).not.toContain("at center center");
            expect(gradientAtCenter.toString()).toBe("radial-gradient(red 0%, 50%, blue 100%)");

            expect(gradientAtTop.toString()).toContain("at center top");
            expect(gradientAtTopRight.toString()).toContain("at right top");
            expect(gradientAtRight.toString()).toContain("at right center");
            expect(gradientAtBottomRight.toString()).toContain("at right bottom");
            expect(gradientAtBottom.toString()).toContain("at center bottom");
            expect(gradientAtBottomLeft.toString()).toContain("at left bottom");
            expect(gradientAtLeft.toString()).toContain("at left center");
            expect(gradientAtTopLeft.toString()).toContain("at left top");
        });

        it('should serialize interpolation with hue path to string', () => {
            const gradient = new RadialGradient({
                ...gradientConfig,
                config: {
                    ...gradientConfig.config,
                    interpolation: {
                        colorSpace: 'oklch',
                        hue: 'longer',
                    },
                },
            });

            expect(gradient.toString()).toBe(
                'radial-gradient(in oklch longer hue, red 0%, 50%, blue 100%)'
            );
        });

        it.skip('should parse gradient string with interpolation and hue path and serialize it back to string', () => {
            const gradient = RadialGradient.fromString(
                'radial-gradient(in oklch longer hue, red, blue)'
            );
            expect(gradient.toString()).toBe(
                'radial-gradient(in oklch longer hue, red, blue)'
            );
        });

        it.skip('should parse gradient string with angle, interpolation and hue path and serialize it back to string', () => {
            const gradient = RadialGradient.fromString(
                'radial-gradient(53deg in oklab shorter hue, hsl(238, 65%, 62%) 0%, hsl(227, 84%, 40%) 40%, hsl(141, 97%, 53%) 100%)'
            );

            expect(gradient.toString()).toBe(
                'radial-gradient(53deg in oklab, hsl(238, 65%, 62%) 0%, hsl(227, 84%, 40%) 40%, hsl(141, 97%, 53%) 100%)'
            );
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

        it('creates a RadialGradient from a simple string', () => {
            const gradient = RadialGradient.fromString(
                'radial-gradient(ellipse 35% 70% at center, cyan, blue 60%, black)',
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