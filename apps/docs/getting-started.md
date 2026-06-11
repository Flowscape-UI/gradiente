# Getting Started

gradiente is a toolkit for treating gradients as structured data.

It can parse a gradient string, normalize it, inspect it as an object, and
transform it into renderer-specific output such as CSS, Canvas 2D, WebGL, or SVG.

<GradientPreview
  title="Your first gradiente gradient"
  gradient="linear-gradient(to right in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  caption="This preview is rendered from the same string by transformTo('css', gradient)."
/>

## Installation

Install the package from npm:

```bash
npm install gradiente
```

gradiente is ESM-first and works well in modern bundlers such as Vite, Rollup,
and Webpack.

## First Gradient

Start with `parse()`. It reads a gradient string and returns the matching
gradiente gradient object.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient"
console.log(gradient.type)

// "linear-gradient(to right, red, blue)"
console.log(gradient.toString())
```

`parse()` throws when the input is not a supported gradient. Use `isGradient()`
when user input should be checked safely before parsing.

```ts
import { isGradient, parse } from 'gradiente'

const input = 'linear-gradient(to right, red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)

  // "linear-gradient"
  console.log(gradient.type)
}
```

## Use Transformers

Use `transformTo()` when you want to send the same gradient to a renderer.
gradiente currently ships four built-in transformer targets:

```txt
css
canvas-2d
canvas-webgl
svg
```

### CSS

Use `transformTo('css', gradient)` when you want a CSS background value.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const css = transformTo('css', gradient)

// "linear-gradient(to right, red, blue)"
console.log(css)
```

In a browser, the result can be assigned directly to `backgroundImage`.

```ts
import { transformTo } from 'gradiente'

const preview = document.querySelector<HTMLElement>('.preview')
const css = transformTo('css', 'linear-gradient(to right, red, blue)')

if (preview) {
  preview.style.backgroundImage = css
}
```

For gradiente-specific kinds such as `diamond-gradient` and `mesh-gradient`, the
CSS transformer returns a renderable adapter background because browsers do not
have native CSS functions for those gradients.

```ts
import { transformTo } from 'gradiente'

const css = transformTo(
  'css',
  'diamond-gradient(at center in oklch, #5851db, #fcb045)'
)

// true
console.log(css.startsWith('url("data:image/svg+xml'))
```

### Canvas 2D

The Canvas 2D transformer returns a paint object with a `draw()` method.

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')
const paint = transformTo(
  'canvas-2d',
  'radial-gradient(circle at 30% 35%, #fff 0%, #ff74f6 35%, #405de6 100%)'
)

if (canvas) {
  const ctx = canvas.getContext('2d')

  if (ctx) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    paint.draw(ctx, canvas.width, canvas.height)
  }
}
```

### Canvas WebGL

The WebGL transformer also returns a paint object, but it draws directly into a
canvas element.

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')
const paint = transformTo(
  'canvas-webgl',
  'conic-gradient(from 74deg at 50% 50%, #d53f96, #ef9439 63%, #077fe9)'
)

if (canvas) {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  paint.draw(canvas, canvas.width, canvas.height)
}
```

### SVG

The SVG transformer returns a paint server description. Insert `defs` into the
SVG and apply `url` to the shape you want to fill.

```ts
import { transformTo } from 'gradiente'

const svg = document.querySelector<SVGSVGElement>('svg')
const rect = svg?.querySelector<SVGRectElement>('rect')
const paint = transformTo(
  'svg',
  'linear-gradient(to right, #ff74f6, #405de6)'
)

if (svg && rect) {
  svg.insertAdjacentHTML('afterbegin', paint.defs)
  rect.setAttribute('fill', paint.url)
}
```

## Normalize Input

Use `format()` before storing user input. It parses the gradient and serializes
it back to gradiente's canonical string.

```ts
import { format } from 'gradiente'

const normalized = format(
  'conic-gradient(from 74deg, red, blue 72%, yellow 63%)'
)

// "conic-gradient(from 74deg, red 0%, yellow 63%, blue 72%)"
console.log(normalized)
```

Normalization is useful for editors, saved presets, tests, and generated
gradients.

## Inspect Gradient Data

After parsing, the gradient can be inspected as data.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

console.log(gradient.getConfig())

if ('getStops' in gradient) {
  console.log(gradient.getStops())
}
```

Most built-in gradients are stop-based. `mesh-gradient` is different: it stores
vertices and patches instead of a simple stop list.

## Use All Gradient Types

gradiente currently includes five built-in gradient kinds. The same public API
works for all of them.

<div class="gradient-preview-grid">
  <GradientPreview
    title="Linear"
    gradient="linear-gradient(to right in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  />
  <GradientPreview
    title="Radial"
    gradient="radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 30%, #405de6 100%)"
  />
  <GradientPreview
    title="Diamond"
    gradient="diamond-gradient(at center in oklch, #5851db 0%, #c13584 40%, #fcb045 100%)"
  />
  <GradientPreview
    title="Conic"
    gradient="conic-gradient(from 74deg at 50% 50%, #d53f96 0%, #ef9439 63%, #077fe9 100%)"
  />
  <GradientPreview
    title="Mesh"
    gradient="mesh-gradient(grid 2 2 method bicubic in oklab, vertex v00 0% 0% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 0% 100% #fb7655, vertex v11 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01)"
  />
</div>

Here is the same idea as code:

```ts
import { transformTo } from 'gradiente'

const gradients = {
  linear: 'linear-gradient(to right, #ff74f6, #405de6)',
  radial: 'radial-gradient(circle at 30% 35%, #fff, #ff74f6, #405de6)',
  diamond: 'diamond-gradient(at center in oklch, #5851db, #fcb045)',
  conic: 'conic-gradient(from 74deg at 50% 50%, #d53f96, #ef9439 63%, #077fe9)',
  mesh: 'mesh-gradient(grid 2 2 method bicubic in oklab, vertex v00 0% 0% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 0% 100% #fb7655, vertex v11 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01)',
}

for (const [name, input] of Object.entries(gradients)) {
  const element = document.querySelector<HTMLElement>(
    `[data-gradient="${name}"]`
  )

  if (element) {
    element.style.backgroundImage = transformTo('css', input)
  }
}
```

## What To Read Next

- [Gradient types](/core-api/gradients/) explains every built-in gradient.
- [Core API](/core-api/intro) explains `parse`, `format`, and `transformTo`.
- [Transformers](/core-api/transformers) explains CSS, Canvas, WebGL, and SVG output.
- [Pattern DSL](/dsl/what-is-dsl) is useful when you want custom validation rules.
- [Playground](https://flowscape-ui.github.io/gradiente/playground/) lets you inspect gradiente behavior visually.
