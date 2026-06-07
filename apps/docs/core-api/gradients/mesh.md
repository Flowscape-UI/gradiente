# Mesh Gradients

A mesh gradient is a color surface made from vertices and patches. It is the most
explicit built-in gradient kind in Gradiente: instead of describing a single
direction, radius, or angle, you describe a small topology and let the renderer
sample colors across it.

<GradientPreview
  title="Mesh gradient rendered by Gradiente"
  gradient="mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)"
  caption="The preview is rendered by Gradiente's CSS transformer from this exact mesh-gradient string."
/>

## Mental model

A mesh gradient has four layers:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>grid</strong>
    <span>Declares topology: how many vertex rows and columns the mesh expects, which sampling method to use, and which color space should interpolate colors.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>vertices</strong>
    <span>Named points. Each vertex has an id, an x/y position, and a color.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>patches</strong>
    <span>Cells made from four vertex references: top-left, top-right, bottom-right, bottom-left.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>handles</strong>
    <span>Optional edge metadata for cubic patch control. Gradiente parses and serializes it; renderer support can use it for future curved patch geometry.</span>
  </div>
</div>

The smallest valid mesh is a `2 x 2` grid: four vertices and one patch.

## Complete syntax

```css
mesh-gradient(
  grid rows columns method bilinear|bicubic [in color-space [hue-mode hue]],
  vertex id x y color,
  vertex id x y color,
  patch id topLeft topRight bottomRight bottomLeft,
  handle patchId side fromX fromY toX toY
)
```

The parts are comma-separated. Colors can contain spaces or nested functions
because Gradiente splits only at top-level commas.

```css
vertex v11 50% 50% hsl(39, 79%, 57%)
```

## Grid

```css
grid 3 3 method bicubic in oklch
```

Grid fields:

```txt
rows          number of vertex rows
columns       number of vertex columns
method        "bilinear" or "bicubic"
interpolation optional "in ..." color interpolation config
```

Rules:

- `rows` must be an integer greater than or equal to `2`.
- `columns` must be an integer greater than or equal to `2`.
- vertex count must be `rows * columns`.
- patch count must be `(rows - 1) * (columns - 1)`.
- `mesh-gradient` does not support repeating gradients.

Examples:

```txt
2 x 2 grid => 4 vertices, 1 patch
3 x 3 grid => 9 vertices, 4 patches
4 x 4 grid => 16 vertices, 9 patches
```

Defaults:

```txt
rows: 2
columns: 2
method: "bilinear"
interpolation.colorSpace: "srgb"
```

Gradiente can infer `rows` and `columns` from regular vertex ids or from counts,
but explicit grid config is the clearest option for humans.

## Vertex ids

A vertex id must match:

```txt
^[A-Za-z_][A-Za-z0-9_-]*$
```

For regular grids, prefer ids that encode column and row:

```txt
v00 => column 0, row 0
v10 => column 1, row 0
v01 => column 0, row 1
v11 => column 1, row 1
```

Separated ids also work:

```txt
v0_0
v1_0
v0_1
v1_1
```

Bicubic sampling requires regular ids so Gradiente can locate neighboring
vertices.

## Vertices

```css
vertex v00 0% 0% #5851db
```

Vertex fields:

```txt
vertex      literal keyword
id          stable vertex id
x           horizontal position
y           vertical position
color       any Culori-readable color
```

Positions are length-percentage values. Percentages are usually easiest for
responsive rendering:

```css
vertex v00 0% 0% #5851db
vertex v10 100% 0% #c13584
vertex v01 0% 100% #fcb045
vertex v11 100% 100% #405de6
```

Vertices do not need to be visually aligned, but the topology must still match
the grid. You can move a vertex to distort the surface:

```css
vertex v11 47% 58% #ffdc80
```

## Patches

```css
patch p00 v00 v10 v11 v01
```

Patch fields:

```txt
patch        literal keyword
id           stable patch id
topLeft      vertex id
topRight     vertex id
bottomRight  vertex id
bottomLeft   vertex id
```

The order matters. It is always clockwise from the top-left corner.

For a `2 x 2` grid:

```txt
v00 ---- v10
 |        |
 |  p00   |
 |        |
v01 ---- v11
```

The patch is:

```css
patch p00 v00 v10 v11 v01
```

For a `3 x 3` grid:

```txt
v00 ---- v10 ---- v20
 |  p00   |  p10   |
v01 ---- v11 ---- v21
 |  p01   |  p11   |
v02 ---- v12 ---- v22
```

The patches are:

```css
patch p00 v00 v10 v11 v01
patch p10 v10 v20 v21 v11
patch p01 v01 v11 v12 v02
patch p11 v11 v21 v22 v12
```

## Handles

Handles are optional edge metadata:

```css
handle p00 top 25% 0% 75% 0%
```

Handle fields:

```txt
handle   literal keyword
patchId  target patch id
side     "top" | "right" | "bottom" | "left"
fromX    first control coordinate x
fromY    first control coordinate y
toX      second control coordinate x
toY      second control coordinate y
```

Gradiente validates, stores, clones, serializes, and exposes handles through
`getPatches()`. Current color sampling is driven by vertices and patches; handles
are reserved metadata for renderers that support cubic patch geometry.

## Minimal mesh

This is the smallest useful mesh:

```css
mesh-gradient(
  grid 2 2 method bilinear,
  vertex v00 0% 0% red,
  vertex v10 100% 0% blue,
  vertex v01 0% 100% yellow,
  vertex v11 100% 100% cyan,
  patch p00 v00 v10 v11 v01
)
```

<GradientPreview
  title="Minimal 2 x 2 bilinear mesh"
  gradient="mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% cyan, patch p00 v00 v10 v11 v01)"
/>

## Bilinear sampling

`bilinear` samples each patch from its four corner colors.

Inside one patch:

```txt
u: horizontal local coordinate from 0 to 1
v: vertical local coordinate from 0 to 1
```

The sampler interpolates:

```txt
top    = mix(topLeft, topRight, u)
bottom = mix(bottomLeft, bottomRight, u)
color  = mix(top, bottom, v)
```

Use `bilinear` when you want cheaper rendering and direct corner blending.

## Bicubic sampling

`bicubic` uses neighboring grid vertices to create a smoother surface. It is more
appropriate for soft generated backgrounds.

Requirements:

- regular vertex ids such as `v00`, `v10`, `v01`, `v11`;
- patches must match adjacent grid cells;
- the grid must be complete.

If bicubic sampling cannot build a regular grid, Gradiente throws a validation or
sampling error instead of silently producing a wrong surface.

<GradientPreview
  title="Bicubic 4 x 4 mesh"
  gradient="mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)"
/>

## Color interpolation

Mesh interpolation is configured on the grid line:

```css
grid 3 3 method bicubic in srgb
grid 3 3 method bicubic in oklch
grid 3 3 method bicubic in oklch longer hue
```

Supported hue modes:

```txt
shorter
longer
increasing
decreasing
```

Hue modes only apply to polar color spaces. If the color space is not polar,
Gradiente ignores the hue mode during normalization.

## Parse and inspect

```ts
import { parse } from 'gradiente'

const input = `mesh-gradient(
  grid 2 2 method bicubic in oklch,
  vertex v00 0% 0% #5851db,
  vertex v10 100% 0% #c13584,
  vertex v01 0% 100% #fcb045,
  vertex v11 100% 100% #405de6,
  patch p00 v00 v10 v11 v01
)`

const gradient = parse(input)

// "mesh-gradient"
console.log(gradient.type)

console.log(gradient.getConfig())
console.log(gradient.getVertices())
console.log(gradient.getPatches())
```

## Sampling a color

`samplePatchColor(patchId, u, v)` samples one patch at local patch coordinates.

```ts
const color = gradient.samplePatchColor('p00', 0.5, 0.5)

console.log(color)
```

`u` and `v` must be between `0` and `1`.

```txt
u = 0, v = 0 => top-left of the patch
u = 1, v = 0 => top-right of the patch
u = 1, v = 1 => bottom-right of the patch
u = 0, v = 1 => bottom-left of the patch
```

## Transforming

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(input)

const cssBackground = transformTo('css', gradient)
```

CSS output generates a renderable adapter background for mesh gradients, because
there is no native `mesh-gradient()` function in browsers.

## Creating a mesh step by step

1. Choose grid size.
2. Draw the vertex layout.
3. Name vertices by column and row.
4. Assign x/y positions.
5. Assign colors.
6. Create one patch for every cell.
7. Choose `bilinear` or `bicubic`.
8. Choose interpolation color space.
9. Parse and validate.
10. Normalize before storing.

For a `3 x 3` mesh:

```txt
vertices: 3 * 3 = 9
patches: (3 - 1) * (3 - 1) = 4
```

Then write vertices:

```css
vertex v00 0% 0% #5851db
vertex v10 50% 0% #c13584
vertex v20 100% 0% #fcb045
vertex v01 0% 50% #fd1d1d
vertex v11 50% 50% #ffdc80
vertex v21 100% 50% #405de6
vertex v02 0% 100% #833ab4
vertex v12 50% 100% #f77737
vertex v22 100% 100% #2fd3c4
```

Then write patches:

```css
patch p00 v00 v10 v11 v01
patch p10 v10 v20 v21 v11
patch p01 v01 v11 v12 v02
patch p11 v11 v21 v22 v12
```

Then combine:

```css
mesh-gradient(grid 3 3 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 50% 0% #c13584, vertex v20 100% 0% #fcb045, vertex v01 0% 50% #fd1d1d, vertex v11 50% 50% #ffdc80, vertex v21 100% 50% #405de6, vertex v02 0% 100% #833ab4, vertex v12 50% 100% #f77737, vertex v22 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

## Common mistakes

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Wrong vertex count</strong>
    <span>`grid 3 3` needs exactly 9 vertices.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Wrong patch count</strong>
    <span>`grid 3 3` needs exactly 4 patches.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Wrong patch order</strong>
    <span>Use `topLeft topRight bottomRight bottomLeft`, not random vertex order.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Missing vertex</strong>
    <span>Every patch reference must point to an existing vertex id.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Non-regular ids with bicubic</strong>
    <span>Bicubic needs ids Gradiente can map to rows and columns.</span>
  </div>
</div>

## Performance

Mesh gradients are heavier than linear, radial, diamond, and conic gradients.
For interactive tools:

- parse only when the input changes;
- cache parsed gradient objects;
- avoid rebuilding CSS/SVG output on every pointer move;
- render small previews while editing and larger previews for final export.

## Useful test cases

```css
mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% cyan, patch p00 v00 v10 v11 v01)
mesh-gradient(grid 2 2 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 100% 0% #c13584, vertex v01 0% 100% #fcb045, vertex v11 100% 100% #405de6, patch p00 v00 v10 v11 v01)
mesh-gradient(grid 3 3 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 50% 0% #c13584, vertex v20 100% 0% #fcb045, vertex v01 0% 50% #fd1d1d, vertex v11 50% 50% #ffdc80, vertex v21 100% 50% #405de6, vertex v02 0% 100% #833ab4, vertex v12 50% 100% #f77737, vertex v22 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```
