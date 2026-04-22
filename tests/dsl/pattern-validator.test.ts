import { describe, it, expect } from 'vitest';
import {
    tokenizePattern,
    validatePatternSyntax,
    validatePatternSemantic,
    validatePatternStructure,
    validatePattern
} from '../../src/dsl';

const VALID_PATTERN = '^[(config|color-stop),~([color-hint,color-stop]|color-stop)].';
describe('Pattern validation', () => {
    describe('tokenizePattern', () => {
        it('Should tokenize a simple pattern', () => {
            expect(tokenizePattern('^color-stop.')).toEqual([
                '^',
                'color-stop',
                '.',
            ]);
        });

        it('Should tokenize sequence and group pattern', () => {
            expect(
                tokenizePattern(VALID_PATTERN)
            ).toEqual([
                '^', '[',
                '(', 'config',
                '|', 'color-stop',
                ')', ',',
                '~', '(',
                '[', 'color-hint',
                ',', 'color-stop',
                ']', '|',
                'color-stop', ')',
                ']', '.'
            ]);
        });

        it('Should ignore whitespace in pattern', () => {
            expect(
                tokenizePattern('^ [ ( config | color-stop ) , ~ ( [ color-hint , color-stop ] | color-stop ) ] .')
            ).toEqual([
                '^', '[', '(', 'config', '|', 'color-stop', ')', ',',
                '~', '(', '[', 'color-hint', ',', 'color-stop', ']', '|', 'color-stop', ')',
                ']', '.'
            ]);
        });

        it('Should tokenize comma inside sequence', () => {
            expect(tokenizePattern('^[config,color-stop].')).toEqual([
                '^', '[', 'config', ',', 'color-stop', ']', '.'
            ]);
        });

        it("Should throw an error for invalid patterns", () => {
            expect(() => tokenizePattern('^(config-color-stop).')).toThrow();
        });
    });

    describe('validatePatternSyntax', () => {
        it('Should validate correct pattern syntax', () => {
            expect(validatePatternSyntax(VALID_PATTERN)).toBe(true);
        });

        it('Should throw an error when pattern does not start with ^', () => {
            expect(() => validatePatternSyntax('(config|color-stop).')).toThrow();
        });

        it('Should throw an error when pattern does not end with .', () => {
            expect(() => validatePatternSyntax('^(config|color-stop)')).toThrow();
        });

        it('Should throw an error for unclosed sequence', () => {
            expect(() => validatePatternSyntax('^[config,color-stop.')).toThrow();
        });

        it('Should throw an error for unclosed group', () => {
            expect(() => validatePatternSyntax('^(config|color-stop~([color-hint,color-stop]|color-stop).')).toThrow("Unclosed group \"()\" in pattern");
        });
    });

    describe('validatePatternSemantic', () => {
        it('Should validate correct pattern semantics', () => {
            expect(validatePatternSemantic(VALID_PATTERN)).toBe(true);
        });

        it('Should throw an error for invalid semantic token order', () => {
            expect(() => validatePatternSemantic('^|color-stop.')).toThrow();
        });

        it('Should throw an error when pattern starts with binary operator', () => {
            expect(() => validatePatternSemantic('^|color-stop.')).toThrow();
        });

        it('Should throw an error when repeat is followed by invalid token', () => {
            expect(() => validatePatternSemantic('^~|color-stop.')).toThrow();
        });

        it('Should throw an error when token is not allowed after group close', () => {
            expect(() => validatePatternSemantic('^(color-stop)~color-stop.')).toThrow();
        });

        it('Should throw an error for invalid semantic token order', () => {
            expect(() => validatePatternSemantic('^|color-stop.')).toThrow();
        });
    });

    describe('validatePatternStructure', () => {
        it('Should validate correct pattern structure', () => {
            expect(validatePatternStructure(VALID_PATTERN)).toBe(true);
        });

        it('Should throw an error for consecutive commas in nested sequence', () => {
            expect(() => validatePatternStructure('^[[config,,color-stop],color-stop].')).toThrow();
        });

        it('Should throw an error for empty group', () => {
            expect(() => validatePatternStructure('^().')).toThrow();
        });

        it('Should throw an error for empty sequence', () => {
            expect(() => validatePatternStructure('^[].')).toThrow();
        });

        it('Should throw an error when sequence starts with comma', () => {
            expect(() => validatePatternStructure('^[,color-stop].')).toThrow();
        });

        it('Should throw an error when sequence ends with comma', () => {
            expect(() => validatePatternStructure('^[color-stop,].')).toThrow();
        });

        it('Should throw an error for double comma in sequence', () => {
            expect(() => validatePatternStructure('^[config,,color-stop].')).toThrow();
        });
    });

    describe('validatePattern', () => {
        it('Should validate a correct pattern', () => {
            expect(validatePattern(VALID_PATTERN)).toBe(true);
        });

        it('Should throw an error for pattern with syntax errors', () => {
            expect(() => validatePattern('^(config|color-stop)')).toThrow();
        });

        it('Should throw an error for pattern with semantic errors', () => {
            expect(() => validatePattern('^|color-stop.')).toThrow();
        });

        it('Should throw an error for pattern with structural errors', () => {
            expect(() => validatePattern('^[[config,,color-stop],color-stop].')).toThrow();
        });
    });
});