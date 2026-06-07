# Radial Gradients

A radial gradient samples colors by distance from a center point. The distance
can be circular or elliptical, and the size can be inferred from the box or set
explicitly.

<GradientPreview
  title="Radial gradient rendered by Gradiente"
  gradient="radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 18%, #fb7655 58%, #405de6 100%)"
  caption="The center, size, color space, and stops all come from this Gradiente string."
/>

## Anatomy

```css
radial-gradient(
  [shape]
  [size]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

The radial config can contain shape, size, position, and interpolation in one
configuration item before the stop list.

## Shape

```css
radial-gradient(circle, red, blue)
radial-gradient(ellipse, red, blue)
```

`circle` uses one radius. `ellipse` uses horizontal and vertical radii.

Default:

```txt
shape: "ellipse"
```

## Size

Radial size can be an extent keyword or explicit length-percentage values.

```css
radial-gradient(circle closest-side, red, blue)
radial-gradient(circle farthest-corner, red, blue)
radial-gradient(ellipse 40% 70%, red, blue)
```

Extent keywords:

```txt
closest-side
closest-corner
farthest-side
farthest-corner
```

Default:

```txt
size: "farthest-corner"
```

For an ellipse, two explicit values describe the horizontal and vertical radius.
For a circle, one explicit value is enough.

## Position

The center is introduced with `at`.

```css
radial-gradient(circle at center, red, blue)
radial-gradient(circle at left top, red, blue)
radial-gradient(circle at 30% 35%, red, blue)
```

Gradiente stores position as either keyword values or length-percentage values:

```ts
import { parse } from 'gradiente'

const gradient = parse('radial-gradient(circle at 30% 35%, red, blue)')

console.log(gradient.getConfig().position)
```

Default:

```txt
position: "center center"
```

## Stops and hints

Radial stops use the same stop model as linear gradients.

```css
radial-gradient(circle, red, blue)
radial-gradient(circle, red 0%, yellow 35%, blue 100%)
radial-gradient(circle, red 0%, 25%, blue 100%)
```

The stop position describes distance from the center, not x/y coordinates.

## Interpolation

```css
radial-gradient(circle in srgb, red, blue)
radial-gradient(circle in oklch, red, blue)
radial-gradient(circle in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

Interpolation is applied along the radius after the geometric distance has been
resolved.

<GradientPreview
  title="Offset radial in OKLCH"
  gradient="radial-gradient(ellipse farthest-corner at 70% 35% in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 45%, hsl(208, 94%, 47%) 100%)"
/>

## Defaults

```txt
shape: "ellipse"
size: "farthest-corner"
position: "center center"
interpolation.colorSpace: "srgb"
isRepeating: false
```

Defaults are omitted from the normalized string.

```ts
import { format } from 'gradiente'

// "radial-gradient(red, blue)"
console.log(format('radial-gradient(ellipse farthest-corner at center center in srgb, red, blue)'))
```

## Repeating radial gradients

```ts
import { parse } from 'gradiente'

const gradient = parse('repeating-radial-gradient(circle, red 0%, blue 12%)')

// true
console.log(gradient.isRepeating())

// "repeating-radial-gradient(circle, red 0%, blue 12%)"
console.log(gradient.toString())
```

## Transforming

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'radial-gradient(circle at 25% 30%, #fff 0%, #ff74f6 25%, #405de6 100%)'
)

const css = transformTo('css', gradient)
```

## Building one yourself

1. Decide whether the gradient is circular or elliptical.
2. Choose a center with `at ...`.
3. Pick an extent keyword when the gradient should adapt to the render box.
4. Use explicit sizes when the radius must stay controlled.
5. Add stops by distance from the center.
6. Use perceptual interpolation for soft glows.

```css
radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 18%, #405de6 100%)
```

## Useful test cases

```css
radial-gradient(red, blue)
radial-gradient(circle closest-side at left top, red, blue)
radial-gradient(ellipse 40% 70% at 30% 80%, red, blue)
radial-gradient(circle at 30% 35%, red 0%, 45%, blue 100%)
radial-gradient(circle at 30% 35% in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```
