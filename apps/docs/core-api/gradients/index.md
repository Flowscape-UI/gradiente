# Gradient Types

Gradiente has five built-in gradient kinds. Each one can be parsed from a string,
normalized into the internal model, inspected as typed data, and transformed into
CSS output.

The public workflow is intentionally small:

```ts
import { format, parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, #ff74f6, #405de6)')

const normalized = format(gradient)
const css = transformTo('css', gradient)
```

`parse()` chooses the correct built-in gradient automatically by reading the
function name.

<div class="gradient-preview-grid">
  <GradientPreview
    title="Linear"
    gradient="linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  />
  <GradientPreview
    title="Radial"
    gradient="radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 18%, #fb7655 58%, #405de6 100%)"
  />
  <GradientPreview
    title="Diamond"
    gradient="diamond-gradient(farthest-corner at center in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)"
  />
  <GradientPreview
    title="Conic"
    gradient="conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%), hsl(3, 69%, 66%) 72%, hsl(30, 85%, 58%) 63%, hsl(208, 94%, 47%))"
  />
  <GradientPreview
    title="Mesh"
    gradient="mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)"
  />
</div>

## Built-in kinds

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Linear</strong>
    <span>A directional ramp between stops. Use it for lighting passes, UI surfaces, progress fills, and predictable CSS-compatible gradients.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Radial</strong>
    <span>A circle or ellipse that expands from a position. Use it for glows, depth, masks, and focal color fields.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Diamond</strong>
    <span>A radial-like custom gradient using diamond distance. It is useful for sharp center-out compositions and geometric UI states.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Conic</strong>
    <span>An angular gradient around a center point. Use it for wheels, charts, angular lighting, and hue rotations.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Mesh</strong>
    <span>A patch-based surface defined by vertices. Use it for soft art-directed color fields and generated backgrounds.</span>
  </div>
</div>

## Common model

Every built-in gradient exposes the same high-level contract:

```ts
const gradient = parse(input)

gradient.type
gradient.getConfig()
gradient.clone()
gradient.equals(gradient.clone())
gradient.toString()
gradient.toJSON()
```

Gradients with color stops also expose stop helpers:

```ts
if ('getStops' in gradient) {
  const stops = gradient.getStops()
}
```

`mesh-gradient` is different because it is not a stop-only gradient. It stores
vertices and patches, then samples color from that surface.

```ts
const gradient = parse(meshInput)

if ('getVertices' in gradient) {
  const vertices = gradient.getVertices()
  const patches = gradient.getPatches()
}
```

## CSS output

Built-in gradients can be transformed into CSS output:

```ts
const css = transformTo('css', gradient)
```

Some gradient kinds are native in CSS, while others need adapter output.
`diamond-gradient` and `mesh-gradient` are Gradiente-specific kinds, so
documentation previews render them through `transformTo('css', gradient)`.
The CSS transformer returns a native CSS gradient when the browser supports the
kind and a renderable adapter background when it does not.

## Pages

- [Linear gradients](/core-api/gradients/linear)
- [Radial gradients](/core-api/gradients/radial)
- [Diamond gradients](/core-api/gradients/diamond)
- [Conic gradients](/core-api/gradients/conic)
- [Mesh gradients](/core-api/gradients/mesh)
