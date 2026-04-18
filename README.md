![gradiente](https://raw.githubusercontent.com/Flowscape-UI/gradiente/fff32510afe7e3e1b7b2f73dbf7246843a06d859/assets/logo.svg)

<a href="https://www.npmjs.com/package/gradiente">
    <img src="https://img.shields.io/npm/v/gradiente.svg?style=flat-square&labelColor=d84f4c&color=black" alt="npm version">
</a>
<a href="https://bundlephobia.com/result?p=gradiente">
    <img src="https://img.shields.io/bundlephobia/minzip/gradiente?style=flat-square&labelColor=d84f4c&color=black" alt="bundle size">
</a>
<a href="https://www.npmjs.com/package/gradiente">
    <img src="https://img.shields.io/npm/dw/gradiente?style=flat-square&labelColor=d84f4c&color=black" alt="weekly downloads">
</a>


# Gradiente

**Gradiente** is a lightweight gradient engine for turning CSS gradients into clean, normalized data structures.

It is built for rendering systems, visual editors, and developer tools where gradients need to be more than just strings.

> **Gradients as data, not strings.**

---

## Installation

```bash
npm install gradiente
bun add gradiente
pnpm add gradiente
yarn add gradiente
```

---

## Quick Example

```ts
import { parse } from 'gradiente';

const gradient = parse('linear-gradient(red, blue)');
```

## Result:

```ts
{
  kind: 'linear',
  repeat: 'normal',
  direction: {
    kind: 'angle',
    value: { kind: 'dimension', value: 0, unit: 'deg' },
    valueRaw: { kind: 'dimension', value: 0, unit: 'rad' },
    keywords: ['to', 'top']
  },
  stops: [
    {
      kind: 'color-stop',
      color: 'red',
      position: { kind: 'percentage', value: 0 }
    },
    {
      kind: 'color-stop',
      color: 'blue',
      position: { kind: 'percentage', value: 1 }
    }
  ]
}
```

---

## Supported Gradients

Gradiente currently supports:

```ts
parse('linear-gradient(...)')
parse('repeating-linear-gradient(...)')

parse('radial-gradient(...)')
parse('repeating-radial-gradient(...)')

parse('conic-gradient(...)')
parse('repeating-conic-gradient(...)')
```

---

## What Gradiente Does

### Parses gradients into structured objects

```ts
import { parse } from 'gradiente';

const gradient = parse('conic-gradient(from 45deg, red, blue)');
```

Instead of getting a raw string you have to manually interpret, you get real data you can work with.

---

### Keeps values renderer-friendly

Angles and positions are normalized into a stable internal representation so they are easier to use in:

* Canvas
* WebGL
* Pixi
* Konva
* custom graphics engines



## Design Goals

Gradiente is built around a few core ideas:

* **Simple external API**
* **Normalized internal model**
* **Predictable stop data**
* **Useful for real rendering systems**
* **Easy to extend for future gradient types**

It is not trying to be a full browser CSS engine.

It is trying to be a practical gradient engine for developers.

---

## Built For

Gradiente is especially useful for:

* design tools
* visual editors
* whiteboards
* canvas engines
* procedural graphics
* charting and data visualization systems
* custom render pipelines

---

## Current Status

Implemented:

* linear gradients
* repeating linear gradients
* radial gradients
* repeating radial gradients
* conic gradients
* repeating conic gradients
* stop normalization
* repeating stop expansion

Planned:

* gradient serialization
* gradient sampling
* playground / live preview
* docs website

---

## Philosophy

Gradiente treats gradients as a structured graphics primitive.

Not a string to preserve.
Not a browser quirk to emulate.
A piece of graphics data you can actually use.

> **Build gradients like an engine, not like a stylesheet.**