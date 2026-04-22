/***************************************************************************************************/
/* gradiente - Pattern Validator / Gradient DSL Core
/* -------------------------------------------------------------------------------------------------
/* File: pattern-validator.ts
/* Author: Nick C. (github: @NiceArti)
/* Organization: Flowscape UI
/* Project: gradiente
/* Created: 2026-04-19
/* License: MIT
/* Repository: https://github.com/flowscape-ui/gradiente
/*
/* Overview
/* -------------------------------------------------------------------------------------------------
/* This module implements the validation layer for the internal Gradient DSL pattern system used by
/* gradiente.
/*
/* The goal of this system is to describe valid sequences of gradient ABI input entities using a
/* small declarative pattern language. These patterns are later used to validate already classified
/* ABI inputs such as:
/*
/* - config
/* - color-stop
/* - color-hint
/*
/* Instead of hardcoding validation rules directly into each gradient parser, this module provides
/* a reusable DSL that allows expressing input rules in a compact and predictable way.
/*
/* Example
/* -------------------------------------------------------------------------------------------------
/* Pattern:
/*
/*   ^[(config|color-stop),~([color-hint,color-stop]|color-stop)].
/*
/* Input types:
/*
/*   ["config", "color-stop", "color-hint", "color-stop", "color-stop"]
/*
/* Meaning:
/*
/* - the pattern starts with "^"
/* - then a sequence begins
/* - the first element can be either:
/*   - config
/*   - color-stop
/* - after that, zero or more repetitions are allowed of:
/*   - [color-hint, color-stop]
/*   - or color-stop
/* - the pattern must end with "."
/*
/* Why this exists
/* -------------------------------------------------------------------------------------------------
/* Gradient inputs can have different legal orders depending on the gradient type.
/*
/* For example:
/*
/* - linear gradients may start with config or directly with color-stop
/* - mesh gradients may allow only color-stop
/* - custom gradients may define their own ABI rules
/*
/* This validator makes those rules explicit and reusable.
/*
/* Design philosophy
/* -------------------------------------------------------------------------------------------------
/* This is NOT a regular expression engine.
/* This is NOT a generic parser framework.
/*
/* It is a focused validator for a very small and very controlled DSL whose only purpose is to
/* validate Gradient ABI entity sequences.
/*
/* The system intentionally understands only a small set of entities and operators:
/*
/* Entities:
/* - config
/* - color-stop
/* - color-hint
/*
/* Operators:
/* - ^  -> pattern start
/* - .  -> pattern end
/* - () -> grouping
/* - [] -> ordered sequence
/* - |  -> logical OR
/* - &  -> logical AND
/* - !  -> logical NOT
/* - ~  -> repetition (0..n)
/* - ,  -> sequence separator inside []
/*
/* Validation pipeline
/* -------------------------------------------------------------------------------------------------
/* Pattern validation is performed in multiple stages:
/*
/* 1. Tokenization
/*    Converts a pattern string into a list of known DSL tokens.
/*
/* 2. Syntax validation
/*    Verifies:
/*    - pattern is not empty
/*    - pattern starts with "^"
/*    - pattern ends with "."
/*    - groups "()" are balanced
/*    - sequences "[]" are balanced
/*
/* 3. Semantic validation
/*    Uses a transition table to verify that token order is legal.
/*    Example:
/*    - "|" cannot appear right after "^"
/*    - "~" must be followed by a valid expression
/*    - ")" cannot be followed by an invalid token
/*
/* 4. Structure validation
/*    Verifies structural correctness that is not covered by syntax alone.
/*    Example:
/*    - empty groups "()" are forbidden
/*    - empty sequences "[]" are forbidden
/*    - invalid commas inside sequences are forbidden
/*
/* Matching
/* -------------------------------------------------------------------------------------------------
/* After a pattern has been validated, it can be used to validate classified Gradient ABI inputs.
/*
/* Matching is performed against already classified entities, not against raw gradient strings.
/*
/* Example classified input:
/*
/*   [
/*     { type: "config", value: "to left" },
/*     { type: "color-stop", value: "red 10% 20%" },
/*     { type: "color-hint", value: "50%" },
/*     { type: "color-stop", value: "white 80%" }
/*   ]
/*
/* Important notes
/* -------------------------------------------------------------------------------------------------
/* - This module validates patterns and classified input structure only.
/* - It does not parse actual gradient colors.
/* - It does not interpret CSS rendering rules.
/* - It does not interpolate colors.
/*
/* Those responsibilities belong to other parts of gradiente, such as ABI classification, gradient
/* parsing, normalization, and rendering adapters.
/*
/* Source of truth
/* -------------------------------------------------------------------------------------------------
/* The pattern is the source of truth for validation.
/*
/* The classified ABI input is checked against the pattern.
/* The pattern defines:
/* - what may appear
/* - in which order
/* - under what repetition rules
/*
/* Stability
/* -------------------------------------------------------------------------------------------------
/* This file is part of the core DSL infrastructure.
/* Changes here affect:
/* - pattern validation
/* - ABI input matching
/* - all gradient parsers that rely on pattern-based validation
/*
/* Modify carefully.
/***************************************************************************************************/

import { PatternTokenKind } from "./types";

/********************************************************************/
/*                        Pattern validating                        */
/********************************************************************/
export function validatePattern(input: string): boolean {
    validatePatternSyntax(input);
    validatePatternSemantic(input);
    validatePatternStructure(input);
    return true;
}

export function isPatternValid(input: string): boolean {
    try {
        validatePattern(input);
        return true;
    } catch {
        return false;
    }
}



/********************************************************************/
/*                     Pattern validating logic                     */
/********************************************************************/
export function validatePatternSyntax(input: string): boolean {
    const tokens = tokenizePattern(input);

    if (tokens.length === 0) {
        throw new Error("Pattern cannot be empty");
    }
    if (tokens[0] !== PatternTokenKind.START) {
        throw new Error("Pattern must start with ^");
    }
    if (tokens[tokens.length - 1] !== PatternTokenKind.END) {
        throw new Error("Pattern must end with \".\"");
    }

    let groupDepth = 0;
    let sequenceDepth = 0;

    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token === PatternTokenKind.GROUP_OPEN) {
            groupDepth += 1;
            continue;
        }
        if (token === PatternTokenKind.GROUP_CLOSE) {
            groupDepth -= 1;

            if (groupDepth < 0) {
                throw new Error(`Unexpected ")" at token index ${i}`);
            }

            continue;
        }

        if (token === PatternTokenKind.SEQUENCE_OPEN) {
            sequenceDepth += 1;
            continue;
        }
        if (token === PatternTokenKind.SEQUENCE_CLOSE) {
            sequenceDepth -= 1;

            if (sequenceDepth < 0) {
                throw new Error(`Unexpected "]" at token index ${i}`);
            }

            continue;
        }
    }

    if (groupDepth !== 0) {
        throw new Error("Unclosed group \"()\" in pattern");
    }
    if (sequenceDepth !== 0) {
        throw new Error("Unclosed sequence \"[]\" in pattern");
    }

    return true;
}

export function isPatternSyntaxValid(input: string): boolean {
    try {
        validatePatternSyntax(input);
        return true;
    } catch {
        return false;
    }
}



/********************************************************************/
/*                      Pattern semantic logic                      */
/********************************************************************/
const NEXT_TOKEN_MAP: Record<string, readonly string[]> = {
    "^": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
    "(": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
    "[": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],

    "|": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
    "&": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
    "!": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
    "~": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],

    ",": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],

    "config": [",", "|", "&", ")", "]", "."],
    "color-stop": [",", "|", "&", ")", "]", "."],
    "color-hint": [",", "|", "&", ")", "]", "."],

    ")": [",", "|", "&", ")", "]", "."],
    "]": [",", "|", "&", ")", "]", "."],

    ".": [],
};

export function validatePatternSemantic(input: string): boolean {
    const tokens = tokenizePattern(input);
    if (tokens.length === 0) {
        throw new Error("Pattern cannot be empty");
    }

    for (let i = 0; i < tokens.length - 1; i += 1) {
        const current = tokens[i];
        const next = tokens[i + 1];
        const allowedNext = NEXT_TOKEN_MAP[current];

        if (!allowedNext) {
            throw new Error(`No semantic transition rule defined for token "${current}"`);
        }
        if (!allowedNext.includes(next)) {
            throw new Error(
                `Token "${next}" is not allowed after "${current}" at index ${i + 1}`
            );
        }
    }

    return true;
}



/********************************************************************/
/*                      Pattern structure logic                      */
/********************************************************************/
export function validatePatternStructure(input: string): boolean {
    const tokens = tokenizePattern(input);

    for (let i = 0; i < tokens.length; i += 1) {
        const current = tokens[i];
        const next = tokens[i + 1];
        const previous = tokens[i - 1];

        if (
            current === PatternTokenKind.GROUP_OPEN &&
            next === PatternTokenKind.GROUP_CLOSE
        ) {
            throw new Error(`Empty group "()" is not allowed at token index ${i}`);
        }
        if (
            current === PatternTokenKind.SEQUENCE_OPEN &&
            next === PatternTokenKind.SEQUENCE_CLOSE
        ) {
            throw new Error(`Empty sequence "[]" is not allowed at token index ${i}`);
        }
        if (current === PatternTokenKind.COMMA) {
            if (previous === undefined) {
                throw new Error(`Unexpected "," at token index ${i}`);
            }
            if (next === undefined) {
                throw new Error(`Unexpected "," at token index ${i}`);
            }
            if (previous === PatternTokenKind.SEQUENCE_OPEN) {
                throw new Error(`Sequence cannot start with "," at token index ${i}`);
            }
            if (next === PatternTokenKind.SEQUENCE_CLOSE) {
                throw new Error(`Sequence cannot end with "," at token index ${i}`);
            }
            if (previous === PatternTokenKind.COMMA) {
                throw new Error(`Unexpected consecutive "," at token index ${i}`);
            }
            if (next === PatternTokenKind.COMMA) {
                throw new Error(`Unexpected consecutive "," at token index ${i}`);
            }
        }
    }

    return true;
}



/********************************************************************/
/*                    Pattern tokenization logic                    */
/********************************************************************/
export function tokenizePattern(input: string): PatternTokenKind[] {
    const source = input.trim();
    const tokens: PatternTokenKind[] = [];

    let index = 0;

    while (index < source.length) {
        const rest = source.slice(index);
        const char = source[index];

        if (/\s/.test(char)) {
            index += 1;
            continue;
        }

        if (rest.startsWith(PatternTokenKind.COLOR_STOP)) {
            tokens.push(PatternTokenKind.COLOR_STOP);
            index += PatternTokenKind.COLOR_STOP.length;
            continue;
        }
        if (rest.startsWith(PatternTokenKind.COLOR_HINT)) {
            tokens.push(PatternTokenKind.COLOR_HINT);
            index += PatternTokenKind.COLOR_HINT.length;
            continue;
        }
        if (rest.startsWith(PatternTokenKind.CONFIG)) {
            tokens.push(PatternTokenKind.CONFIG);
            index += PatternTokenKind.CONFIG.length;
            continue;
        }
        if (
            char === PatternTokenKind.START ||
            char === PatternTokenKind.END ||
            char === PatternTokenKind.GROUP_OPEN ||
            char === PatternTokenKind.GROUP_CLOSE ||
            char === PatternTokenKind.SEQUENCE_OPEN ||
            char === PatternTokenKind.SEQUENCE_CLOSE ||
            char === PatternTokenKind.COMMA ||
            char === PatternTokenKind.OR ||
            char === PatternTokenKind.AND ||
            char === PatternTokenKind.NOT ||
            char === PatternTokenKind.REPEAT
        ) {
            tokens.push(char as PatternTokenKind);
            index += 1;
            continue;
        }
        throw new Error(`Unexpected token near "${rest}" at index ${index}`);
    }

    return tokens;
}