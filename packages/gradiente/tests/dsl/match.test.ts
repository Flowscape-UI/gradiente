import { describe, expect, it } from "vitest";
import { validate } from "../../src/dsl";

describe('validate matcher', () => {
    describe('validate matcher - basic', () => {
        const pattern = '^[([config,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)].';

        it('matches single color-stop start', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                    ],
                    '^color-stop.'
                )
            ).toBe(true);

            expect(() =>
                validate(
                    [
                        { type: 'color-hint', value: '50%' },
                    ],
                    '^color-stop.'
                )
            ).toThrow();
        });

        it('matches config followed by color-stop', () => {
            expect(
                validate(
                    [
                        { type: 'config', value: 'to left' },
                        { type: 'color-stop', value: 'red' },
                    ],
                    '^[config,color-stop].'
                )
            ).toBe(true);

            expect(() =>
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'config', value: 'to left' },
                    ],
                    '^[config,color-stop].'
                )
            ).toThrow();
        });

        it('matches only color-stops', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-stop', value: 'blue' },
                        { type: 'color-stop', value: 'white' },
                    ],
                    pattern
                )
            ).toBe(true);
        });

        it('matches color-hint followed by color-stop in repeat branch', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-hint', value: '50%' },
                        { type: 'color-stop', value: 'blue' },
                    ],
                    pattern
                )
            ).toBe(true);
        });

        it('matches config + stop + repeated mixed tail', () => {
            expect(
                validate(
                    [
                        { type: 'config', value: 'to left' },
                        { type: 'color-stop', value: 'red 10% 20%' },
                        { type: 'color-stop', value: 'blue' },
                        { type: 'color-hint', value: '50%' },
                        { type: 'color-stop', value: 'white 80%' },
                        { type: 'color-stop', value: 'red 200%' },
                    ],
                    pattern
                )
            ).toBe(true);
        });
    });

    describe('validate matcher - invalid inputs', () => {
        const pattern = '^[([config,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)].';

        it('throws on empty classified inputs', () => {
            expect(() => validate([], pattern)).toThrow();
        });

        it('throws on invalid pattern before matching', () => {
            expect(() =>
                validate(
                    [{ type: 'color-stop', value: 'red' }],
                    '^|color-stop.'
                )
            ).toThrow();
        });

        it('matches exact sequence without leftovers', () => {
            expect(
                validate(
                    [
                        { type: 'config', value: 'to left' },
                        { type: 'color-stop', value: 'red' },
                    ],
                    '^[config,color-stop].'
                )
            ).toBe(true);
        });

        it('throws when config is not followed by color-stop', () => {
            expect(() =>
                validate(
                    [
                        { type: 'config', value: 'to left' },
                        { type: 'color-hint', value: '50%' },
                        { type: 'color-stop', value: 'blue' },
                    ],
                    pattern
                )
            ).toThrow();
        });

        it('throws when input starts with color-hint', () => {
            expect(() =>
                validate(
                    [
                        { type: 'color-hint', value: '50%' },
                        { type: 'color-stop', value: 'blue' },
                    ],
                    pattern
                )
            ).toThrow();
        });

        it('throws when pattern does not consume all inputs', () => {
            expect(() =>
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-stop', value: 'blue' },
                        { type: 'config', value: 'to left' },
                    ],
                    '^color-stop.'
                )
            ).toThrow();
        });

        it('throws when required color-stop is missing', () => {
            expect(() =>
                validate(
                    [
                        { type: 'config', value: 'to left' },
                    ],
                    '^[config,color-stop].'
                )
            ).toThrow();
        });

        it('throws when color-hint is not followed by color-stop', () => {
            expect(() =>
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-hint', value: '50%' },
                    ],
                    pattern
                )
            ).toThrow();
        });
    });

    describe('validate matcher - repeat', () => {
        const pattern = '^[([config,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)].';

        it('allows zero repeat items after initial branch', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                    ],
                    pattern
                )
            ).toBe(true);
        });

        it('allows many repeated color-stop items', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-stop', value: 'blue' },
                        { type: 'color-stop', value: 'white' },
                        { type: 'color-stop', value: 'black' },
                        { type: 'color-stop', value: 'yellow' },
                    ],
                    pattern
                )
            ).toBe(true);
        });

        it('allows many repeated hint-stop pairs', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                        { type: 'color-hint', value: '20%' },
                        { type: 'color-stop', value: 'blue' },
                        { type: 'color-hint', value: '60%' },
                        { type: 'color-stop', value: 'white' },
                    ],
                    pattern
                )
            ).toBe(true);
        });
    });

    describe('validate matcher - grouping and alternatives', () => {
        it('matches left branch of group', () => {
            expect(
                validate(
                    [
                        { type: 'config', value: 'to left' },
                        { type: 'color-stop', value: 'red' },
                    ],
                    '^([config,color-stop]|color-stop).'
                )
            ).toBe(true);
        });

        it('matches right branch of group', () => {
            expect(
                validate(
                    [
                        { type: 'color-stop', value: 'red' },
                    ],
                    '^([config,color-stop]|color-stop).'
                )
            ).toBe(true);
        });

        it('throws when neither branch matches', () => {
            expect(() =>
                validate(
                    [
                        { type: 'color-hint', value: '50%' },
                    ],
                    '^([config,color-stop]|color-stop).'
                )
            ).toThrow();
        });
    });

    describe('validate special cases and speed check', () => {
        const ITERATIONS_COUNT = 1_000_000;
        it('handles large input', () => {
            const input = [];

            for (let i = 0; i < ITERATIONS_COUNT; i++) {
                input.push({ type: 'color-stop', value: `color-${i}` });
            }

            expect(
                validate(input, '^[color-stop,~color-stop].')
            ).toBe(true);
        });

        it('handles large repeated hint-stop pairs', () => {
            const input = [{ type: 'color-stop', value: 'red' }];

            for (let i = 0; i < ITERATIONS_COUNT; i++) {
                input.push({ type: 'color-hint', value: `${i}%` });
                input.push({ type: 'color-stop', value: `color-${i}` });
            }

            expect(
                validate(input, '^[color-stop,~[color-hint,color-stop]].')
            ).toBe(true);
        });

        it('fails large input with invalid tail', () => {
            const input: { type: string; value: string }[] = [];

            for (let i = 0; i < ITERATIONS_COUNT; i++) {
                input.push({ type: 'color-stop', value: `color-${i}` });
            }

            input.push({ type: 'config', value: 'to left' });

            expect(() =>
                validate(input, '^[color-stop,~color-stop].')
            ).toThrow();
        });

        it('handles large repeated alternatives', () => {
            const input = [{ type: 'color-stop', value: 'red' }];

            for (let i = 0; i < ITERATIONS_COUNT; i++) {
                if (i % 2 === 0) {
                    input.push({ type: 'color-stop', value: `color-${i}` });
                } else {
                    input.push({ type: 'color-hint', value: `${i}%` });
                    input.push({ type: 'color-stop', value: `color-${i}` });
                }
            }

            expect(
                validate(input, '^[color-stop,~([color-stop,[color-hint,color-stop]])].')
            ).toBe(true);
        });
    });
});