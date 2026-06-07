# Diamond Gradients

`diamond-gradient` is a Gradiente-specific gradient kind. It uses radial-style
configuration, but distance is measured through a diamond field instead of a
circle or ellipse.

<GradientPreview
  title="Diamond gradient rendered by Gradiente"
  gradient="diamond-gradient(farthest-corner at center in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)"
  caption="This is not a native CSS function. The preview is rendered by Gradiente's CSS transformer."
/>

## Anatomy

```css
diamond-gradient(
  [shape]
  [size]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

The syntax intentionally mirrors `radial-gradient`. That makes it easy to move
between radial and diamond effects without changing the whole mental model.

## How it differs from radial

In a radial gradient, equal-distance points form circles or ellipses. In a
diamond gradient, equal-distance points form diamond rings. This gives a sharper
geometric center-out transition.

```css
radial-gradient(circle at center, red, blue)
diamond-gradient(at center, red, blue)
```

Both can share stop positions and interpolation, but their distance fields are
different.

## Shape, size, and position

`diamond-gradient` reuses the radial configuration parser:

```css
diamond-gradient(at center, red, blue)
diamond-gradient(at left top, red, blue)
diamond-gradient(closest-side at 30% 35%, red, blue)
diamond-gradient(farthest-corner at center, red, blue)
```

Defaults:

```txt
shape: "ellipse"
size: "farthest-corner"
position: "center center"
interpolation.colorSpace: "srgb"
isRepeating: false
```

The `shape` token is accepted for domain consistency with radial gradients. The
visual result is still resolved through the diamond distance model.

## Stops and interpolation

Stops behave like radial stops: positions describe distance from the center.

```css
diamond-gradient(#5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
diamond-gradient(red 0%, 40%, blue 100%)
```

Color hints and double-position stops work the same way as other stop-based
gradients.

## Normalization

```ts
import { format, parse } from 'gradiente'

const gradient = parse(
  'diamond-gradient(farthest-corner at center in oklch, #5851db, #fcb045)'
)

// "diamond-gradient"
console.log(gradient.type)

// "diamond-gradient(in oklch, #5851db, #fcb045)"
console.log(format(gradient))
```

The default size and center are removed from the string, but the non-default
interpolation remains.

## Transforming

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'diamond-gradient(at 45% 40%, #5851db 0%, #c13584 35%, #fcb045 100%)'
)

const cssBackground = transformTo('css', gradient)
```

For CSS, the transformer returns renderable adapter output. Documentation
previews use `transformTo('css', gradient)`, so custom gradient kinds stay
visible even when the browser has no native CSS function for them.

## Building one yourself

1. Start with a radial gradient idea.
2. Replace `radial-gradient` with `diamond-gradient`.
3. Keep the center with `at ...`.
4. Use `closest-side` for a tight geometric center or `farthest-corner` for full coverage.
5. Add stops by distance from the center.
6. Use `in oklch` when the diamond needs a smoother color path.

```css
diamond-gradient(at 50% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 75%, #405de6 100%)
```

## Useful test cases

```css
diamond-gradient(red, blue)
diamond-gradient(at left top, red, blue)
diamond-gradient(closest-side at 30% 35%, red 0%, 50%, blue 100%)
diamond-gradient(red 0% 30%, blue 30% 100%)
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
repeating-diamond-gradient(at center, red 0%, blue 12%)
```
