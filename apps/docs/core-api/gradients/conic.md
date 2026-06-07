# Conic Gradients

A conic gradient samples colors by angle around a center point. Stop positions
describe rotation, not distance.

<GradientPreview
  title="Conic gradient rendered by Gradiente"
  gradient="conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%), hsl(3, 69%, 66%) 72%, hsl(30, 85%, 58%) 63%, hsl(208, 94%, 47%))"
  caption="Gradiente normalizes the out-of-order stops before rendering adapter output."
/>

## Anatomy

```css
conic-gradient(
  [from angle]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

The configuration describes where angular sampling starts and where the center
is placed.

## Start angle

```css
conic-gradient(from 90deg, red, blue)
conic-gradient(from 0.25turn, red, blue)
```

Default:

```txt
from: 0deg
```

The angle is normalized in the internal model and serialized in a readable form.

## Position

```css
conic-gradient(at center, red, blue)
conic-gradient(at 35% 45%, red, blue)
conic-gradient(from 74deg at 50% 50%, red, blue)
```

Default:

```txt
position: "center center"
```

## Stops

Conic stop positions map onto angular progress around the center.

```css
conic-gradient(red, blue)
conic-gradient(red 0%, yellow 25%, blue 100%)
conic-gradient(red 0deg, yellow 90deg, blue 360deg)
```

Current Gradiente stop positions are normalized as percentages in the internal
stop model. If you need deterministic output, provide percentage stops.

## Stop ordering

Gradiente sorts resolved stop positions. That is why this input:

```css
conic-gradient(
  from 74deg at 50% 50%,
  hsl(325, 64%, 54%),
  hsl(3, 69%, 66%) 72%,
  hsl(30, 85%, 58%) 63%,
  hsl(208, 94%, 47%)
)
```

normalizes to:

```ts
import { format } from 'gradiente'

const input = `conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%), hsl(3, 69%, 66%) 72%, hsl(30, 85%, 58%) 63%, hsl(208, 94%, 47%))`

// "conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)"
console.log(format(input))
```

This behavior is useful for editors because the stored string becomes canonical.

## Hard angular edges

Place two stops at the same position to create a hard angular boundary.

```css
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
```

Gradiente preserves double-position stops through the shared stop model.

## Interpolation

```css
conic-gradient(in srgb, red, blue)
conic-gradient(in oklch, red, blue)
conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

Interpolation happens between angular stops.

<GradientPreview
  title="Conic OKLCH hue interpolation"
  gradient="conic-gradient(from 25deg at 50% 50% in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 35%, hsl(208, 94%, 47%) 100%)"
/>

## Transforming

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'conic-gradient(from 74deg at center in oklch, #d53f96, #ef9439, #077fe9)'
)

const css = transformTo('css', gradient)
```

## Building one yourself

1. Choose the center with `at ...`.
2. Choose the rotation offset with `from ...`.
3. Add stops in angular order when possible.
4. Use equal positions for hard wedges.
5. Normalize with `format()` if input came from a user.
6. Use `oklch` hue modes for color wheels and hue transitions.

## Useful test cases

```css
conic-gradient(red, blue)
conic-gradient(from 450deg, red, blue)
conic-gradient(from 74deg at 50% 50%, red, blue 72%, yellow 63%, cyan)
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
conic-gradient(from 0deg in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
repeating-conic-gradient(from 45deg, red 0%, blue 12%)
```
