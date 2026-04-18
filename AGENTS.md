# Repository Guidelines

Gradiente is a lightweight, renderer-agnostic gradient toolkit for modern rendering systems.

This file documents repository conventions, architecture rules, and development guidelines.

Project vision: [`VISION.md`](VISION.md)
Project overview: [`README.md`](README.md)

---

## Project Structure

* `src/` - Library source code
* `tests/` - Vitest test suite
* `docs/` - VitePress documentation site
* `dist/` - Build output

---

## Architecture Rules

### Core Must Stay Renderer-Agnostic

Core logic must not depend on:

* DOM APIs
* Browser globals
* CSSOM / Canvas / WebGL runtime objects
* Framework-specific APIs

Renderer/platform integrations belong in adapters or serializers.

---

### Internal Gradient Model Is Source of Truth

All parsing, transformation, validation, and serialization should operate on Gradiente's internal gradient model.

Platform-specific formats are adapters only.

---

### Prefer Pure Functions

Gradiente favors:

* Pure functions
* Immutable data transforms
* Composable utility APIs

Avoid unnecessary class-heavy abstractions.

---

### Keep Public API Minimal

New public exports should meet at least one of:

* Broad practical usefulness
* Architectural necessity
* Strong composability value

Avoid exporting internal helpers prematurely.

---

## Testing Rules

* All parsers require roundtrip tests
* All serializers require snapshot/contract tests
* New gradient transforms require edge-case coverage
* Bug fixes should include regression tests where practical

---

## Contribution Rules

* One PR / change = one focused concern
* Avoid bundling unrelated refactors
* Large architecture changes should align with `VISION.md`

---

## Coding Standards

* Language: TypeScript (ESM)
* Prefer strict typing; avoid `any`
* Add comments for non-obvious math/logic
* Prefer clarity over cleverness
* Keep files reasonably small and focused

---

## Long-Term Philosophy

Gradiente is infrastructure.

The goal is not to own rendering pipelines or editor logic -
the goal is to provide the best gradient foundation possible.