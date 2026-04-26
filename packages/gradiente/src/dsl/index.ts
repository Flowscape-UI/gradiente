import type { GradientAbiInput } from "../abi";
import { matchExpression } from "./match";
import { tokenizePattern, validatePattern } from "./pattern-validator";

export * from "./pattern-validator";
export * from "./match";
export * from "./types";

export function isValid(input: GradientAbiInput[], pattern: string): boolean {
    try {
        validate(input, pattern);
        return true;
    } catch {
        return false;
    }
}

export function validate(classified: GradientAbiInput[], pattern: string): boolean {
    validatePattern(pattern);

    const patternTokens = tokenizePattern(pattern);
    const bodyTokens = patternTokens.slice(1, -1);

    const result = matchExpression(classified, bodyTokens, 0, 0);

    if (!result.matched) {
        throw new Error('Input does not match pattern');
    }

    if (result.nextInputIndex !== classified.length) {
        throw new Error('Pattern did not consume all inputs');
    }

    if (result.nextPatternIndex !== bodyTokens.length) {
        throw new Error('Input ended before pattern was fully matched');
    }

    return true;
}