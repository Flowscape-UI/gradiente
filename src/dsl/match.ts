/***************************************************************************************************/
/* gradiente - Pattern Matcher / Gradient DSL Execution Core
/* -------------------------------------------------------------------------------------------------
/* File: match.ts
/* Author: Nick C. (github: @NiceArti)
/* Organization: Flowscape UI
/* Project: gradiente
/* Created: 2026-04-19
/* License: MIT
/* Repository: https://github.com/flowscape-ui/gradiente
/*
/* Overview
/* -------------------------------------------------------------------------------------------------
/* This module implements the execution layer of the internal Gradient DSL used by gradiente.
/*
/* If `pattern-validator.ts` is responsible for checking whether a pattern string is structurally
/* and semantically valid, this file is responsible for actually matching classified Gradient ABI
/* inputs against that validated pattern.
/*
/* In other words:
/*
/* - pattern-validator.ts answers:
/*  "Is this pattern legal?"
/*
/* - match.ts answers:
/*  "Does this classified input match this legal pattern?"
/*
/* Example
/* ------------------------------------------------------------------------------------------------
/* Pattern:
/*
/*   ^[([config,color-stop,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)].
/*
/* Classified input:
/*
/*   [
/*     { type: "config", value: "to left" },
/*     { type: "color-stop", value: "red 10%" },
/*     { type: "color-hint", value: "50%" },
/*     { type: "color-stop", value: "blue 80%" }
/*   ]
/*
/* Meaning:
/*
/* - the pattern starts from a valid root expression
/* - the first branch must be either:
/*   - [config, color-stop, color-stop]
/*   - or color-stop
/* - after the start branch, zero or more repetitions are allowed of:
/*   - [color-hint, color-stop]
/*   - or color-stop
/*
/* This module executes that matching logic against already classified ABI input entities.
/*
/* Why this exists
/* ------------------------------------------------------------------------------------------------
/* Gradient inputs are not validated directly from raw strings here.
/*
/* Before the matcher runs, the input string has already been transformed into classified ABI items:
/*
/* - config
/* - color-stop
/* - color-hint
/*
/* The matcher does not care about actual color syntax, CSS parsing, or rendering semantics.
/* It only cares about whether the input type sequence satisfies the pattern DSL.
/*
/* This makes the system:
/*
/* - deterministic
/* - reusable
/* - independent from gradient parsing internals
/* - extensible for custom gradient types
/*
/* Design philosophy
/* ------------------------------------------------------------------------------------------------
/* This is NOT a regular expression engine.
/* This is NOT a generic parser combinator library.
/*
/* This file is a focused execution engine for a very small DSL whose only job is to match
/* classified Gradient ABI inputs against validated pattern expressions.
/*
/* The matcher intentionally understands only a limited set of pattern constructs:
/*
/* Entities:
/* - config
/* - color-stop
/* - color-hint
/*
/* Structural operators:
/* - [] -> ordered sequence
/* - () -> grouped expression / branch container
/* - |  -> alternative inside groups
/* - ~  -> repetition (0..n)
/*
/* Matching model
/* ------------------------------------------------------------------------------------------------
/* Matching is performed against:
/*
/*   GradientAbiInput[]
/*
/* not against raw gradient strings.
/*
/* This is a deliberate architectural choice.
/*
/* The source of truth for matching is the validated pattern token stream.
/* The classified ABI input is the data being consumed by that pattern.
/*
/* The matcher therefore operates with two moving indices:
/*
/* - inputIndex   -> current position in classified ABI inputs
/* - patternIndex -> current position in pattern tokens
/*
/* A successful match consumes:
/*
/* - one or more ABI inputs
/* - one or more pattern tokens
/*
/* This is represented by `MatchResult`.
/*
/* MatchResult
/* ------------------------------------------------------------------------------------------------
/* Each internal matcher returns:
/*
/*   {
/*     matched: boolean,
/*     nextInputIndex: number,
/*     nextPatternIndex: number
/*   }
/*
/* This makes every matcher composable.
/*
/* Instead of returning only true/false, each matcher also reports:
/*
/* - how far input consumption advanced
/* - how far pattern traversal advanced
/*
/* This is critical for:
/*
/* - sequences
/* - grouped alternatives
/* - repeat operators
/*
/* Core matcher responsibilities
/* ------------------------------------------------------------------------------------------------
/* 1. matchExpression
/*
/*    The main orchestration function.
/*    It walks through the current pattern expression and repeatedly delegates matching of the next
/*    meaningful unit to `matchPrimary`.
/*
/*    It stops when it encounters a structural boundary, such as:
/*    - end token
/*    - group close
/*    - sequence close
/*    - OR separator
/*
/*    This allows expressions to be reused both at top level and inside nested groups or sequences.
/*
/* 2. matchPrimary
/*
/*    Dispatcher for the next matchable pattern unit.
/*
/*    Depending on the current token, it routes control to:
/*    - matchEntity
/*    - matchSequence
/*    - matchGroup
/*    - matchRepeat
/*
/*    This keeps the matcher modular and prevents all execution logic from collapsing into a single
/*    unreadable function.
/*
/* 3. matchEntity
/*
/*    Matches one primitive ABI input entity:
/*    - config
/*    - color-stop
/*    - color-hint
/*
/*    This is the smallest atomic matcher in the system.
/*
/* 4. matchSequence
/*
/*    Executes a sequence block:
/*
/*      [a,b,c]
/*
/*    Each item inside the sequence must match in order.
/*    Commas are treated as sequence separators and are skipped during execution.
/*
/*    The sequence ends strictly at its matching closing bracket `]`.
/*
/* 5. matchGroup
/*
/*    Executes a grouped expression:
/*
/*      (a|b|c)
/*
/*    The matcher extracts the group body, splits it by top-level OR operators, and then attempts
/*    each branch independently until one succeeds.
/*
/*    This is the branching mechanism of the DSL.
/*
/* 6. matchRepeat
/*
/*    Executes the repetition operator:
/*
/*      ~x
/*
/*    The sub-expression `x` is matched zero or more times.
/*
/*    Repetition stops when the inner expression no longer matches.
/*    A safety guard is included to ensure that repeated expressions must consume input; otherwise
/*    repetition would loop forever.
/*
/* Helper functions
/* ------------------------------------------------------------------------------------------------
/* This file also contains a few structural helpers that are essential to correct matching:
/*
/* - findMatchingToken
/*   Finds the matching closing token for:
/*   - ()
/*   - []
/*
/*   This is the basis for group and sequence boundary detection.
/*
/* - splitTopLevelOr
/*   Splits a group body into branches by top-level OR operators only.
/*
/*   Nested groups and sequences do not break the split.
/*   This ensures that complex expressions such as:
/*
/*     (a|[b,(c|d)])
/*
/*   are interpreted correctly.
/*
/* - getPrimaryEndIndex
/*   Computes the logical end of the current primary pattern unit.
/*
/*   This is especially important for repetition, because `~` itself is only the operator; the
/*   matcher must also know where the repeated sub-expression ends in the token stream.
/*
/* Execution order
/* ------------------------------------------------------------------------------------------------
/* Typical execution flow looks like this:
/*
/* 1. Pattern string is validated by the pattern validator
/* 2. Pattern string is tokenized
/* 3. Boundary tokens such as "^" and "." may be stripped by the caller
/* 4. Classified Gradient ABI inputs are passed into the matcher
/* 5. matchExpression begins matching from the current pattern/input position
/* 6. Nested structures are delegated to their specialized matchers
/* 7. Final success is determined by:
/*    - full required match
/*    - correct input consumption
/*    - correct pattern consumption
/*
/* Important notes
/* ------------------------------------------------------------------------------------------------
/* - This module does not tokenize patterns
/* - It does not validate pattern syntax
/* - It does not validate pattern semantics
/* - It does not classify raw gradient input strings
/* - It does not parse real gradient values
/* - It does not normalize gradient stops
/* - It does not render gradients
/*
/* Those responsibilities belong to other layers:
/*
/* - tokenizer
/* - pattern validator
/* - ABI classifier
/* - gradient parser
/* - normalization layer
/* - rendering adapters
/*
/* Source of truth
/* ------------------------------------------------------------------------------------------------
/* The pattern token stream is the source of truth for matching.
/*
/* The matcher does not "guess" valid input order.
/* It does not infer missing structure from the data.
/*
/* Instead:
/*
/* - the pattern declares the allowed structure
/* - the classified ABI input is consumed against that structure
/*
/* This makes the matcher predictable and strict by design.
/*
/* Stability
/* ------------------------------------------------------------------------------------------------
/* This file is part of the core DSL execution infrastructure.
/*
/* Changes here affect:
/* - classified ABI validation
/* - gradient parser correctness
/* - all gradient types that rely on pattern-driven matching
/* - performance characteristics of the DSL engine
/*
/* Modify carefully.
/***************************************************************************************************/



import type { GradientAbiInput } from "../abi";
import { PatternTokenKind } from "./types";

type MatchResult = {
    matched: boolean;
    nextInputIndex: number;
    nextPatternIndex: number;
};

export function matchExpression(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    let currentInputIndex = inputIndex;
    let currentPatternIndex = patternIndex;

    while (currentPatternIndex < patternTokens.length) {
        const token = patternTokens[currentPatternIndex];

        if (
            token === PatternTokenKind.END ||
            token === PatternTokenKind.GROUP_CLOSE ||
            token === PatternTokenKind.SEQUENCE_CLOSE ||
            token === PatternTokenKind.OR
        ) {
            break;
        }

        if (token === PatternTokenKind.COMMA) {
            currentPatternIndex += 1;
            continue;
        }

        const result = matchPrimary(
            classified,
            patternTokens,
            currentInputIndex,
            currentPatternIndex,
        );

        if (!result.matched) {
            return {
                matched: false,
                nextInputIndex: inputIndex,
                nextPatternIndex: patternIndex,
            };
        }

        currentInputIndex = result.nextInputIndex;
        currentPatternIndex = result.nextPatternIndex;
    }

    return {
        matched: true,
        nextInputIndex: currentInputIndex,
        nextPatternIndex: currentPatternIndex,
    };
}

function matchEntity(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    const expected = patternTokens[patternIndex];
    const current = classified[inputIndex];

    if (
        expected !== PatternTokenKind.CONFIG &&
        expected !== PatternTokenKind.COLOR_STOP &&
        expected !== PatternTokenKind.COLOR_HINT
    ) {
        throw new Error(`Expected entity token at pattern index ${patternIndex}`);
    }

    if (!current) {
        return {
            matched: false,
            nextInputIndex: inputIndex,
            nextPatternIndex: patternIndex,
        };
    }

    if (current.type !== expected) {
        return {
            matched: false,
            nextInputIndex: inputIndex,
            nextPatternIndex: patternIndex,
        };
    }

    return {
        matched: true,
        nextInputIndex: inputIndex + 1,
        nextPatternIndex: patternIndex + 1,
    };
}

function matchPrimary(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    const token = patternTokens[patternIndex];

    if (
        token === PatternTokenKind.CONFIG ||
        token === PatternTokenKind.COLOR_STOP ||
        token === PatternTokenKind.COLOR_HINT
    ) {
        return matchEntity(classified, patternTokens, inputIndex, patternIndex);
    }

    if (token === PatternTokenKind.SEQUENCE_OPEN) {
        return matchSequence(classified, patternTokens, inputIndex, patternIndex);
    }

    if (token === PatternTokenKind.GROUP_OPEN) {
        return matchGroup(classified, patternTokens, inputIndex, patternIndex);
    }

    if (token === PatternTokenKind.REPEAT) {
        return matchRepeat(classified, patternTokens, inputIndex, patternIndex);
    }

    throw new Error(`Unsupported primary token "${token}" at pattern index ${patternIndex}`);
}

function findMatchingToken(
    tokens: PatternTokenKind[],
    startIndex: number,
    openToken: PatternTokenKind,
    closeToken: PatternTokenKind,
): number {
    if (tokens[startIndex] !== openToken) {
        throw new Error(
            `Expected "${openToken}" at pattern index ${startIndex}, got "${tokens[startIndex]}"`
        );
    }

    let depth = 0;

    for (let i = startIndex; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token === openToken) {
            depth += 1;
            continue;
        }

        if (token === closeToken) {
            depth -= 1;

            if (depth === 0) {
                return i;
            }
        }
    }

    throw new Error(`Unclosed token pair "${openToken}${closeToken}"`);
}

function matchSequence(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    if (patternTokens[patternIndex] !== PatternTokenKind.SEQUENCE_OPEN) {
        throw new Error(`Expected "[" at pattern index ${patternIndex}`);
    }

    const closeIndex = findMatchingToken(
        patternTokens,
        patternIndex,
        PatternTokenKind.SEQUENCE_OPEN,
        PatternTokenKind.SEQUENCE_CLOSE,
    );

    let currentInputIndex = inputIndex;
    let currentPatternIndex = patternIndex + 1;

    while (currentPatternIndex < closeIndex) {
        const token = patternTokens[currentPatternIndex];

        if (token === PatternTokenKind.COMMA) {
            currentPatternIndex += 1;
            continue;
        }

        const result = matchPrimary(
            classified,
            patternTokens,
            currentInputIndex,
            currentPatternIndex,
        );

        if (!result.matched) {
            return {
                matched: false,
                nextInputIndex: inputIndex,
                nextPatternIndex: patternIndex,
            };
        }

        currentInputIndex = result.nextInputIndex;
        currentPatternIndex = result.nextPatternIndex;
    }

    return {
        matched: true,
        nextInputIndex: currentInputIndex,
        nextPatternIndex: closeIndex + 1,
    };
}

function splitTopLevelOr(tokens: PatternTokenKind[]): PatternTokenKind[][] {
    const result: PatternTokenKind[][] = [];
    let current: PatternTokenKind[] = [];

    let groupDepth = 0;
    let sequenceDepth = 0;

    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];

        if (token === PatternTokenKind.GROUP_OPEN) {
            groupDepth += 1;
            current.push(token);
            continue;
        }

        if (token === PatternTokenKind.GROUP_CLOSE) {
            groupDepth -= 1;
            current.push(token);
            continue;
        }

        if (token === PatternTokenKind.SEQUENCE_OPEN) {
            sequenceDepth += 1;
            current.push(token);
            continue;
        }

        if (token === PatternTokenKind.SEQUENCE_CLOSE) {
            sequenceDepth -= 1;
            current.push(token);
            continue;
        }

        if (
            token === PatternTokenKind.OR &&
            groupDepth === 0 &&
            sequenceDepth === 0
        ) {
            result.push(current);
            current = [];
            continue;
        }

        current.push(token);
    }

    if (current.length > 0) {
        result.push(current);
    }

    return result;
}

function matchGroup(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    if (patternTokens[patternIndex] !== PatternTokenKind.GROUP_OPEN) {
        throw new Error(`Expected "(" at pattern index ${patternIndex}`);
    }

    const closeIndex = findMatchingToken(
        patternTokens,
        patternIndex,
        PatternTokenKind.GROUP_OPEN,
        PatternTokenKind.GROUP_CLOSE,
    );

    const innerTokens = patternTokens.slice(patternIndex + 1, closeIndex);
    const branches = splitTopLevelOr(innerTokens);

    for (const branch of branches) {
        const result = matchExpression(
            classified,
            branch,
            inputIndex,
            0,
        );

        if (result.matched) {
            return {
                matched: true,
                nextInputIndex: result.nextInputIndex,
                nextPatternIndex: closeIndex + 1,
            };
        }
    }

    return {
        matched: false,
        nextInputIndex: inputIndex,
        nextPatternIndex: patternIndex,
    };
}

function matchRepeat(
    classified: GradientAbiInput[],
    patternTokens: PatternTokenKind[],
    inputIndex: number,
    patternIndex: number,
): MatchResult {
    if (patternTokens[patternIndex] !== PatternTokenKind.REPEAT) {
        throw new Error(`Expected "~" at pattern index ${patternIndex}`);
    }

    let currentInputIndex = inputIndex;
    let currentPatternIndex = patternIndex + 1;

    while (true) {
        const result = matchPrimary(
            classified,
            patternTokens,
            currentInputIndex,
            currentPatternIndex,
        );

        if (!result.matched) {
            break;
        }

        if (result.nextInputIndex === currentInputIndex) {
            throw new Error('Repeat expression did not consume input');
        }

        currentInputIndex = result.nextInputIndex;
    }

    const nextPatternIndex = getPrimaryEndIndex(patternTokens, currentPatternIndex);

    return {
        matched: true,
        nextInputIndex: currentInputIndex,
        nextPatternIndex,
    };
}

function getPrimaryEndIndex(
    patternTokens: PatternTokenKind[],
    patternIndex: number,
): number {
    const token = patternTokens[patternIndex];

    if (
        token === PatternTokenKind.CONFIG ||
        token === PatternTokenKind.COLOR_STOP ||
        token === PatternTokenKind.COLOR_HINT
    ) {
        return patternIndex + 1;
    }

    if (token === PatternTokenKind.SEQUENCE_OPEN) {
        return (
            findMatchingToken(
                patternTokens,
                patternIndex,
                PatternTokenKind.SEQUENCE_OPEN,
                PatternTokenKind.SEQUENCE_CLOSE,
            ) + 1
        );
    }

    if (token === PatternTokenKind.GROUP_OPEN) {
        return (
            findMatchingToken(
                patternTokens,
                patternIndex,
                PatternTokenKind.GROUP_OPEN,
                PatternTokenKind.GROUP_CLOSE,
            ) + 1
        );
    }

    if (token === PatternTokenKind.REPEAT) {
        return getPrimaryEndIndex(patternTokens, patternIndex + 1);
    }

    throw new Error(`Unsupported token "${token}" in getPrimaryEndIndex`);
}