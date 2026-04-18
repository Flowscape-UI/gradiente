![gradiente](./assets/logo.svg)

# Gradiente

**Gradiente** is a lightweight gradient engine for turning CSS gradients into clean, normalized data structures.

It is built for rendering systems, visual editors, and developer tools where gradients need to be more than just strings.

> **Gradients as data, not strings.**

---

## Why

CSS gradients are expressive, but difficult to work with programmatically.

They are usually:

* string-based
* hard to normalize
* full of implicit behavior
* awkward to use in renderers and editors

Gradiente solves that by parsing gradients into a predictable internal model that is easy to inspect, transform, render, and extend.

---

## Installation

```bash
npm install gradiente
```

---

## Quick Example

```ts
import { parse } from 'gradiente';

const gradient = parse('linear-gradient(red, blue)');
```

Result:

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

### Normalizes missing stop positions

```ts
parse('linear-gradient(red, blue)')
```

becomes:

```ts
red 0%
blue 100%
```

That means your renderer or editor does not need to guess defaults later.

---

### Expands repeating gradients into actual stops

```ts
parse('repeating-linear-gradient(red 10%, blue 20%)')
```

produces a stop list that continues until the gradient pattern fills `100%+`.

This makes repeating gradients much easier to render and inspect.

---

### Keeps values renderer-friendly

Angles and positions are normalized into a stable internal representation so they are easier to use in:

* Canvas
* WebGL
* Pixi
* Konva
* custom graphics engines

---

## Public API

### `parse(value: string)`

Parses any supported gradient string into a normalized gradient node.

```ts
import { parse } from 'gradiente';

const gradient = parse('radial-gradient(circle at center, red, blue)');
```

---

## Output Shape

All parsed gradients follow a predictable structure:

```ts
type GradientNode =
  | LinearGradientNode
  | RadialGradientNode
  | ConicGradientNode;
```

Each gradient contains:

```ts
{
  kind: 'linear' | 'radial' | 'conic',
  repeat: 'normal' | 'repeating',
  stops: GradientColorStopNode[]
}
```

---

## Stop Format

Gradiente resolves gradients into a clean stop model:

```ts
{
  kind: 'color-stop',
  color: string,
  position: {
    kind: 'percentage',
    value: number
  }
}
```

This makes the data much easier to use in custom pipelines.

---

## Examples

### Linear

```ts
parse('linear-gradient(to right, red, blue)')
```

### Repeating Linear

```ts
parse('repeating-linear-gradient(red 10%, blue 20%)')
```

### Radial

```ts
parse('radial-gradient(circle at center, red, blue)')
```

### Repeating Radial

```ts
parse('repeating-radial-gradient(circle at center, red 10%, blue 20%)')
```

### Conic

```ts
parse('conic-gradient(from 45deg at center, red, blue)')
```

### Repeating Conic

```ts
parse('repeating-conic-gradient(from 45deg at center, red 10%, blue 20%)')
```

---

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

---

## License

MIT