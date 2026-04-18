# Contributing to Gradiente

Thank you for your interest in contributing to Gradiente.

Gradiente is a lightweight, renderer-agnostic gradient toolkit for modern rendering systems.
The project aims to provide a robust and composable foundation for gradient processing across platforms.

Please read this document before contributing.

---

## Before Contributing

Review the project direction and architecture guidelines first:

* [`VISION.md`](./VISION.md)
* [`AGENTS.md`](./AGENTS.md)

Contributions should align with the project's architecture and long-term vision.

---

## Development Setup

Install dependencies:

```bash
pnpm install
```

Run development build:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Run type checks:

```bash
pnpm typecheck
```

Build package:

```bash
pnpm build
```

---

## Contribution Guidelines

### Keep Changes Focused

* One PR / commit should address one concern
* Avoid bundling unrelated fixes/refactors/features together

---

### Match Project Philosophy

Gradiente prioritizes:

* Renderer-agnostic core architecture
* Lightweight design
* Minimal public API surface
* Composable functional utilities
* Strong TypeScript typings

---

### Tests Are Expected

When practical:

* New features should include tests
* Bug fixes should include regression coverage
* Parser/serializer changes should include roundtrip validation

---

### Public API Changes

Be thoughtful when changing public exports or API contracts.

Public API additions should provide:

* Broad usefulness
* Architectural value
* Clear composability benefits

Avoid unnecessary API surface expansion.

---

## Coding Standards

* Use TypeScript with strict typing
* Avoid `any` unless absolutely necessary
* Prefer pure functions over class-heavy abstractions
* Keep files focused and reasonably small
* Add comments for non-obvious math or logic

---

## Documentation

If your change affects public behavior or API:

* Update relevant documentation
* Update examples when applicable
* Add changelog entries for notable user-facing changes

---

## Questions / Discussion

For major architectural ideas or breaking changes, open an issue before implementing.

Early discussion is preferred over large speculative PRs.

---

Thank you for helping improve Gradiente.