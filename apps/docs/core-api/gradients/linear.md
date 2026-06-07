# Linear Gradients

A linear gradient is a color line projected across a rectangle. Every rendered
pixel is mapped onto that line, then Gradiente samples the ordered color stops
along it.

<GradientPreview
  title="Linear gradient rendered by Gradiente"
  gradient="linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  caption="This preview is rendered from the same Gradiente string shown in the example."
/>

## Anatomy

```css
linear-gradient(
  [direction]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

The first comma-separated item can be configuration. Everything after it is part
of the stop list.

```css
linear-gradient(to right in oklch, red 0%, 35%, blue 100%)
```

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>direction</strong>
    <span>`to right`, `to top left`, `90deg`, `0.25turn`, or another angle token. If omitted, Gradiente uses the default CSS-like direction.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>color-space</strong>
    <span>`srgb`, `oklab`, `oklch`, `lab`, `lch`, `display-p3`, and other supported spaces from the gradient model.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>hue-mode</strong>
    <span>`shorter`, `longer`, `increasing`, or `decreasing`. It only matters for polar color spaces such as `hsl`, `lch`, and `oklch`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>color-stop</strong>
    <span>A color plus zero, one, or two percentage positions. A bare percentage between two colors is a color hint.</span>
  </div>
</div>

## Direction

CSS direction keywords describe where the gradient goes:

```css
linear-gradient(to right, red, blue)
linear-gradient(to top left, red, blue)
```

Numeric angles are also accepted:

```css
linear-gradient(90deg, red, blue)
linear-gradient(0.25turn, red, blue)
```

Gradiente stores the direction as a normalized numeric angle in radians. The
serializer converts common angles back into readable CSS keywords.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const config = gradient.getConfig()

console.log(config.angle)
```

## Stops

The stop list controls where colors appear on the line.

```css
linear-gradient(red, blue)
linear-gradient(red 0%, blue 100%)
linear-gradient(red 0%, yellow 40%, blue 100%)
```

If a color stop has no position, Gradiente resolves it from neighboring stops.
The first unresolved color stop becomes `0%`; the last unresolved color stop
becomes `100%`; middle unresolved stops are distributed evenly.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, yellow, blue)')

console.log(gradient.getStops())
```

## Color hints

A color hint is a percentage without a color. It shifts the midpoint of the
interpolation segment.

```css
linear-gradient(to right, red 0%, 35%, blue 100%)
```

This does not create a third color stop. It tells the renderer that the perceived
middle between red and blue should happen at `35%`, not at `50%`.

## Double-position stops

One color can occupy a hard range by using two positions.

```css
linear-gradient(to right, red 0% 35%, blue 35% 100%)
```

Gradiente stores this as two adjacent color stops with the same color and
serializes it back into the compact double-position form when possible.

## Interpolation

Interpolation changes the path between colors:

```css
linear-gradient(in srgb, red, blue)
linear-gradient(in oklch, red, blue)
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

Use perceptual spaces such as `oklab` or `oklch` when you want smoother visual
transitions. Use `srgb` when you want CSS-default behavior.

<GradientPreview
  title="OKLCH with hue path"
  gradient="linear-gradient(135deg in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 55%, hsl(208, 94%, 47%) 100%)"
/>

## Defaults

```txt
angle: Math.PI
interpolation.colorSpace: "srgb"
isRepeating: false
```

Default values are omitted from `toString()`.

```ts
import { format } from 'gradiente'

// "linear-gradient(red, blue)"
console.log(format('linear-gradient(180deg in srgb, red 0%, blue 100%)'))
```

## Repeating linear gradients

Repeating gradients keep the same internal type and store the repeating flag in
config.

```ts
import { parse } from 'gradiente'

const gradient = parse('repeating-linear-gradient(to right, red 0%, blue 10%)')

// "linear-gradient"
console.log(gradient.type)

// true
console.log(gradient.isRepeating())

// "repeating-linear-gradient(to right, red 0%, blue 10%)"
console.log(gradient.toString())
```

## Transforming

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'linear-gradient(135deg in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
```

## Building one yourself

1. Pick a direction: keyword for readability, angle for generated data.
2. Choose interpolation: `srgb` for CSS parity, `oklab` or `oklch` for smoother ramps.
3. Add at least two color stops.
4. Add explicit positions when the visual must be stable across edits.
5. Use hints only when you need to bend the transition midpoint.
6. Normalize with `format()` before storing user input.

```ts
import { format } from 'gradiente'

const input = 'linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)'

// "linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)"
console.log(format(input))
```

## Useful test cases

```css
linear-gradient(red, blue)
linear-gradient(to top left, red 0%, blue 100%)
linear-gradient(450deg, red, blue)
linear-gradient(to right, red 0%, 35%, blue 100%)
linear-gradient(red 0% 35%, blue 35% 100%)
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```
