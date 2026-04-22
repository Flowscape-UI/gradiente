/***************************************************************************************************/
/* gradiente - Gradient ABI Builder / Input Classification Core
/* -------------------------------------------------------------------------------------------------
/* File: abi.ts
/* Author: Nick C. (github: @NiceArti)
/* Organization: Flowscape UI
/* Project: gradiente
/* Created: 2026-04-20
/* License: MIT
/* Repository: https://github.com/flowscape-ui/gradiente
/*
/* Overview
/* -------------------------------------------------------------------------------------------------
/* This module implements the ABI layer of gradiente.
/*
/* ABI in this context means:
/*
/*   a small structured intermediate representation built from a raw gradient string
/*
/* It exists between:
/*
/* - the original user input string
/* - and the real gradient parser / normalizer
/*
/* In other words:
/*
/* - raw string  -> difficult to reason about directly
/* - ABI         -> structured, typed, predictable
/* - parser      -> converts ABI into concrete gradient models
/*
/* This file is responsible for taking a gradient function string such as:
/*
/*   linear-gradient(to left, red 10% 20%, blue, 50%, white 80%)
/*
/* and converting it into a structured ABI object like:
/*
/*   {
/*     functionName: "linear-gradient",
/*     isRepeating: false,
/*     inputs: [
/*       { type: "config", value: "to left" },
/*       { type: "color-stop", value: "red 10% 20%" },
/*       { type: "color-stop", value: "blue" },
/*       { type: "color-hint", value: "50%" },
/*       { type: "color-stop", value: "white 80%" }
/*     ]
/*   }
/*
/* This ABI is then validated against a DSL pattern and later consumed by concrete gradient
/* parsers such as:
/*
/* - linear-gradient parser
/* - radial-gradient parser
/* - conic-gradient parser
/* - future custom gradient parsers
/*
/* Why this exists
/* ------------------------------------------------------------------------------------------------
/* Raw gradient strings are powerful but inconvenient to reason about directly.
/*
/* Example:
/*
/*   linear-gradient(to left, red 10% 20%, blue, 50%, white 80%)
/*
/* From a raw string alone, many things are still ambiguous for later stages:
/*
/* - what is the function name?
/* - is this repeating or not?
/* - where do top-level parameters begin and end?
/* - which input is config?
/* - which input is a color stop?
/* - which input is a color hint?
/*
/* Instead of forcing every gradient parser to solve all of that logic again, this file creates a
/* reusable ABI layer that answers those questions once.
/*
/* This makes the rest of the system simpler, cleaner, and more modular.
/*
/* What ABI means here
/* ------------------------------------------------------------------------------------------------
/* ABI is not used here in the low-level binary sense.
/* In gradiente, ABI means:
/*
/*   a stable intermediate input contract between the raw gradient string and the parser layer
/*
/* The ABI does not yet contain:
/*
/* - normalized angles
/* - normalized stop positions
/* - resolved defaults
/* - rendering-ready values
/*
/* Those belong to later stages.
/*
/* The ABI only answers:
/*
/* - what function is being called?
/* - is it repeating?
/* - what are the top-level user inputs?
/* - how should each top-level input be classified?
/*
/* Design philosophy
/* ------------------------------------------------------------------------------------------------
/* This module is intentionally focused and small in scope.
/*
/* It does NOT try to:
/*
/* - normalize gradient semantics
/* - understand CSS interpolation
/* - calculate color stop defaults
/* - convert values to renderer-ready structures
/* - interpret browser rendering behavior
/*
/* Its only job is:
/*
/*   string -> ABI
/*
/* This module exists to prepare input for the next layers, not to replace them.
/*
/* Processing pipeline
/* ------------------------------------------------------------------------------------------------
/* The ABI pipeline is intentionally staged:
/*
/* 1. Extract the outer function call
/*
/*    Example:
/*
/*      repeating-linear-gradient(to left, red, blue)
/*
/*    becomes:
/*
/*      functionName = "linear-gradient"
/*      isRepeating = true
/*      inputs = ["to left", "red", "blue"]
/*
/* 2. Split top-level inputs
/*
/*    Top-level input splitting is comma-based, but only at the outer level.
/*    Nested commas inside functions such as:
/*
/*      rgb(255, 0, 0)
/*
/*    must remain inside a single input chunk.
/*
/*    Example:
/*
/*      gradient(rgb(255, 0, 0), blue)
/*
/*    must produce:
/*
/*      ["rgb(255, 0, 0)", "blue"]
/*
/*    not:
/*
/*      ["rgb(255", "0", "0)", "blue"]
/*
/* 3. Classify input chunks
/*
/*    Each top-level input is classified into one of:
/*
/*    - config
/*    - color-stop
/*    - color-hint
/*
/* 4. Validate ABI against the pattern matcher
/*
/*    Once classified, the ABI inputs are checked against the current validation pattern.
/*
/*    This separates:
/*
/*    - low-level extraction/classification
/*    - structural input legality
/*
/* 5. Return GradientAbi
/*
/*    The result is then ready for parser-specific interpretation.
/*
/* Example walkthrough
/* ------------------------------------------------------------------------------------------------
/* Input:
/*
/*   repeating-linear-gradient(to left, red 10%, 50%, blue 80%)
/*
/* Step 1: outer function extraction
/*
/*   functionName = "linear-gradient"
/*   isRepeating = true
/*
/* Step 2: raw top-level inputs
/*
/*   [
/*     "to left",
/*     "red 10%",
/*     "50%",
/*     "blue 80%"
/*   ]
/*
/* Step 3: classified inputs
/*
/*   [
/*     { type: "config", value: "to left" },
/*     { type: "color-stop", value: "red 10%" },
/*     { type: "color-hint", value: "50%" },
/*     { type: "color-stop", value: "blue 80%" }
/*   ]
/*
/* Step 4: ABI result
/*
/*   {
/*     functionName: "linear-gradient",
/*     isRepeating: true,
/*     inputs: [...]
/*   }
/*
/* Core responsibilities
/* ------------------------------------------------------------------------------------------------
/* 1. parseStringToAbi
/*
/*    This is the public entry point of the ABI layer.
/*
/*    Responsibilities:
/*    - trim the input
/*    - validate that a function call exists
/*    - extract function name / repeating prefix / top-level inputs
/*    - classify the top-level inputs
/*    - validate the classified ABI against a pattern
/*    - return a stable GradientAbi object
/*
/* 2. extractOuterFunctionCall
/*
/*    Extracts the outer function call structure.
/*
/*    Responsibilities:
/*    - find the first opening parenthesis
/*    - read the function name
/*    - detect the repeating prefix
/*    - find the matching closing parenthesis
/*    - extract the function body
/*    - split top-level inputs
/*
/*    Example:
/*
/*      repeating-linear-gradient(red, blue)
/*
/*    becomes:
/*
/*      {
/*        functionName: "linear-gradient",
/*        isRepeating: true,
/*        inputs: ["red", "blue"]
/*      }
/*
/* 3. findOuterClosingParenIndex
/*
/*    Finds the correct closing parenthesis for the outer function call.
/*
/*    This is necessary because nested functions may appear inside inputs.
/*
/*    Example:
/*
/*      gradient(rgb(255, 0, 0), blue)
/*
/*    The outer closing ")" must not be confused with the inner ")" of rgb(...).
/*
/* 4. splitTopLevelInputs
/*
/*    Splits function body content into top-level chunks by commas only.
/*
/*    This is one of the most important helpers in the ABI layer.
/*
/*    It ensures that commas inside nested structures do not break the input incorrectly.
/*
/*    Supported nested structures include:
/*    - ()
/*    - {}
/*    - []
/*
/* 5. classifyInputs
/*
/*    Converts raw top-level string chunks into typed ABI input objects.
/*
/*    This is the bridge between:
/*
/*    - "raw chunk"
/*    - "typed semantic input"
/*
/*    Example:
/*
/*      "50%"      -> color-hint
/*      "red 10%"  -> color-stop
/*      "to left"  -> config
/*
/* 6. isColorHint
/*
/*    Checks whether an input chunk matches the allowed shape for a color hint.
/*
/*    This helper is intentionally low-level.
/*    It only answers:
/*
/*      "does this value look like a hint-like positional token?"
/*
/*    It does not answer whether the hint is legal in the current sequence.
/*    That is the responsibility of pattern validation.
/*
/* 7. isColorStop
/*
/*    Checks whether an input chunk begins with something that can be interpreted as a color.
/*
/*    This is done by extracting the first meaningful top-level chunk and asking the color layer
/*    (Culori) whether it can parse it as a valid color.
/*
/*    Example:
/*
/*      "red 10%"              -> true
/*      "rgb(255, 0, 0) 50%"   -> true
/*      "to left"              -> false
/*
/* 8. isConfig
/*
/*    Config is treated as the fallback classification category.
/*
/*    In ABI terms:
/*
/*      if an input is not a color-hint
/*      and not a color-stop
/*      then it is considered config
/*
/*    Example config values:
/*
/*    - to left
/*    - 180deg
/*    - circle at center
/*    - farthest-corner circle at 50% 115% in oklch
/*
/* Important architectural rule
/* ------------------------------------------------------------------------------------------------
/* The ABI layer is intentionally not the final authority on correctness.
/*
/* It extracts and classifies.
/* It does not decide everything by itself.
/*
/* Example:
/*
/*   linear-gradient(180deg, red, blue)
/*
/* Here "180deg" may look hint-like in isolation, but in actual gradient structure it belongs to
/* the config/prelude position.
/*
/* This is why ABI classification and pattern validation are separate responsibilities.
/*
/* The ABI layer identifies the pieces.
/* The pattern layer validates whether those pieces appear in a legal order.
/*
/* Pattern validation
/* ------------------------------------------------------------------------------------------------
/* After classification, ABI inputs are validated against a pattern.
/*
/* Example default pattern:
/*
/*   ^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),
/*     ~([color-hint,color-stop]|color-stop)].
/*
/* This allows the ABI layer to remain generic while still enforcing legal input order for a
/* particular gradient family.
/*
/* This pattern-based approach is one of the core design choices of gradiente.
/*
/* Source of truth
/* ------------------------------------------------------------------------------------------------
/* In the ABI layer, the raw gradient string is the source of truth for extraction.
/* After extraction, the classified ABI becomes the source of truth for parser validation.
/*
/* The ABI is therefore the bridge between:
/*
/* - unstructured string input
/* - structured parser logic
/*
/* Stability
/* ------------------------------------------------------------------------------------------------
/* This file is part of the core input preparation infrastructure.
/*
/* Changes here affect:
/* - function call extraction
/* - repeating function detection
/* - top-level input splitting
/* - color/config/hint classification
/* - ABI validation entry points
/* - all concrete gradient parsers that depend on ABI shape
/*
/* Modify carefully.
/***************************************************************************************************/


import { parse as parseColor } from "culori";
import { validate } from "./dsl";

const REPEATING_PREFIX = 'repeating-';
const PARAMS_VALIDATION_PATTERN = '^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].';

export type AbiInputType = 
    | "config"
    | "color-stop"
    | "color-hint";

export type GradientAbi = {
    functionName: string;
    isRepeating: boolean;
    inputs: GradientAbiInput[];
};

export type GradientAbiInput = {
    type: string;
    value: string;
}

export function parseStringToAbi(value: string, pattern: string = PARAMS_VALIDATION_PATTERN): GradientAbi {
    const source = value.trim();

    if (source.length === 0) {
        throw new Error('Expected function call, received empty string');
    }

    const {functionName, isRepeating, inputs} = extractOuterFunctionCall(source);
    const classified = classifyInputs(inputs);

    validate(classified, pattern);


    return {
        functionName,
        isRepeating,
        inputs: classified,
    }
}

export function isColorHint(value: string): boolean {
    return /^-?\d*\.?\d+(%|deg|rad|turn|grad|px|em|rem|vh|vw|vmin|vmax|cm|mm|in|pt|pc|q)?$/i.test(value.trim());
}

export function isColorStop(value: string): boolean {
    try {
        const chunk = splitTopLevelByWhitespace(value)[0];
        const color = parseColor(chunk);
        return color !== undefined;
    } catch {
        return false;
    }
}

export function isConfig(value: string): boolean {
    return !isColorHint(value) && !isColorStop(value);
}


/********************************************************************/
/*                    ABI classification helpers                    */
/********************************************************************/
function classifyInputs(inputs: string[]): GradientAbiInput[] {
    const normalizedTypes = inputs
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    if (normalizedTypes.length === 0) {
        return [];
    }

    return normalizedTypes.map((value, index) => {
        if (index === 0 && !isColorStop(value)) {
            return {
                type: 'config',
                value,
            };
        }
        if (isColorStop(value)) {
            return {
                type: 'color-stop',
                value,
            };
        }
        if (isColorHint(value)) {
            return {
                type: 'color-hint',
                value,
            };
        }
        return {
            type: 'config',
            value,
        };
    });
}

/********************************************************************/
/*                       Paren parser helpers                       */
/********************************************************************/
function extractOuterFunctionCall(value: string): {
    functionName: string,
    isRepeating: boolean,
    inputs: string[]
} {
    const openIndex = value.indexOf('(');

    if (openIndex <= 0) {
        throw new Error('Expected function opening parenthesis');
    }

    let functionName = value.slice(0, openIndex).trim();

    if (functionName.length === 0) {
        throw new Error('Expected function name before "("');
    }

    const isRepeating = functionName.startsWith(REPEATING_PREFIX);

    if (isRepeating) {
        functionName = functionName.slice(REPEATING_PREFIX.length);
    }

    const closeIndex = findOuterClosingParenIndex(value, openIndex);

    if (closeIndex === -1) {
        throw new Error('Unclosed function parenthesis');
    }

    const body = value.slice(openIndex + 1, closeIndex);
    const inputs = splitTopLevelInputs(body);

    return {
        functionName,
        isRepeating,
        inputs,
    };
}

function findOuterClosingParenIndex(value: string, openIndex: number): number {
    let depth = 0;

    for (let i = openIndex; i < value.length; i += 1) {
        const char = value[i];

        if (char === '(') {
            depth += 1;
            continue;
        }

        if (char === ')') {
            depth -= 1;

            if (depth === 0) {
                return i;
            }

            if (depth < 0) {
                return -1;
            }
        }
    }

    return -1;
}

function splitTopLevelInputs(value: string): string[] {
    const result: string[] = [];

    let current = '';
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];

        if (char === '(') {
            parenDepth += 1;
            current += char;
            continue;
        }

        if (char === ')') {
            parenDepth -= 1;
            current += char;
            continue;
        }

        if (char === '{') {
            braceDepth += 1;
            current += char;
            continue;
        }

        if (char === '}') {
            braceDepth -= 1;
            current += char;
            continue;
        }

        if (char === '[') {
            bracketDepth += 1;
            current += char;
            continue;
        }

        if (char === ']') {
            bracketDepth -= 1;
            current += char;
            continue;
        }

        if (
            char === ',' &&
            parenDepth === 0 &&
            braceDepth === 0 &&
            bracketDepth === 0
        ) {
            pushTrimmed(result, current);
            current = '';
            continue;
        }

        current += char;
    }

    pushTrimmed(result, current);

    return result;
}

function pushTrimmed(target: string[], value: string): void {
    const trimmed = value.trim();

    if (trimmed.length > 0) {
        target.push(trimmed);
    }
}

export function splitTopLevelByWhitespace(value: string): string[] {
    const source = value.trim();

    const result: string[] = [];
    let current = '';

    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;

    for (let i = 0; i < source.length; i += 1) {
        const char = source[i];

        if (char === '(') {
            parenDepth += 1;
            current += char;
            continue;
        }

        if (char === ')') {
            parenDepth -= 1;
            current += char;
            continue;
        }

        if (char === '{') {
            braceDepth += 1;
            current += char;
            continue;
        }

        if (char === '}') {
            braceDepth -= 1;
            current += char;
            continue;
        }

        if (char === '[') {
            bracketDepth += 1;
            current += char;
            continue;
        }

        if (char === ']') {
            bracketDepth -= 1;
            current += char;
            continue;
        }

        if (
            /\s/.test(char) &&
            parenDepth === 0 &&
            braceDepth === 0 &&
            bracketDepth === 0
        ) {
            if (current.trim().length > 0) {
                result.push(current.trim());
                current = '';
            }

            continue;
        }

        current += char;
    }

    if (current.trim().length > 0) {
        result.push(current.trim());
    }

    return result;
}