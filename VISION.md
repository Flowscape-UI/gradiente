# Gradiente Vision

Gradiente is a lightweight gradient toolkit for modern rendering systems.

It provides a unified way to parse, transform, validate, sample, and serialize gradients across platforms and rendering environments.

This document explains the current direction and philosophy of the project.
Gradiente is still early and evolving rapidly.

Project overview and developer docs: [`README.md`](README.md)
Contribution guide: [`CONTRIBUTING.md`](CONTRIBUTING.md)

Gradiente started as an internal infrastructure library built to support FlowScape and other advanced canvas/editor systems.

The goal is to create a robust, renderer-agnostic gradient engine that can serve as foundational infrastructure for graphics tooling across the web ecosystem.

---

## Vision

Gradiente aims to become the standard low-level gradient library for JavaScript and TypeScript applications.

A toolkit that works consistently across:

* CSS
* Canvas 2D
* WebGL / GPU pipelines
* PixiJS
* Konva
* Custom renderers
* Design / visual editor systems

---

## Core Principles

### Renderer Agnostic Core

Gradiente core must remain independent from any rendering environment.

Core should not depend on:

* DOM APIs
* Browser globals
* Framework-specific APIs
* Renderer-specific objects

---

### Unified Gradient Model

Gradiente provides one internal gradient representation across all platforms.

Platform-specific formats should be adapters, not core primitives.

---

### Lightweight by Default

Gradiente should stay small and focused.

Avoid unnecessary abstractions, dependencies, and runtime overhead.

---

### Composable API

Prefer small pure functions and data transformations over large class hierarchies.

The library should feel ergonomic and predictable in both simple and advanced use cases.

---

## Current Priorities

Priority:

* Core gradient data model
* Validation and normalization pipeline
* CSS parser / serializer
* Color interpolation via Culori integration
* Sampling and interpolation APIs

Next priorities:

* Canvas / WebGL serialization helpers
* Pixi / Konva adapters
* Advanced transform operations
* Gradient editing utilities
* Extended interpolation strategies

---

## Contribution Rules

* One PR = one issue/topic
* Avoid bundling unrelated changes
* Large PRs may be rejected if too broad
* New features should align with project vision and architecture

---

## What We Will Not Merge (For Now)

* Renderer-specific logic inside core
* Framework-specific wrappers in main package
* Heavy abstraction layers for niche use cases
* Experimental gradient types without clear standards/usefulness
* Features that significantly increase bundle size without broad value

---

## Long-Term Direction

Gradiente is designed to evolve beyond basic gradients.

Future exploration areas may include:

* Mesh gradients
* Procedural gradients
* GPU-oriented gradient packing
* Advanced perceptual interpolation systems
* Gradient editor tooling primitives

However, the immediate focus remains building a strong and stable core first.

---

Gradiente is infrastructure, not a UI toolkit.

The goal is not to own rendering or editor logic -
the goal is to provide the best gradient foundation possible.