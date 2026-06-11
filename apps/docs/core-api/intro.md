<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { transformTo } from 'gradiente'

const cssRendererGradient = 'linear-gradient(to right, #ff74f6, #405de6)'
const canvas2dRendererGradient =
  'radial-gradient(circle at 30% 35%, #ffffff 0%, #ff74f6 35%, #405de6 100%)'
const webglRendererGradient =
  'conic-gradient(from 74deg at 50% 50%, #d53f96, #ef9439 63%, #077fe9)'

const cssRendererBackground = transformTo<string>('css', cssRendererGradient)
const canvas2dPreview = ref<HTMLCanvasElement | null>(null)
const webglPreview = ref<HTMLCanvasElement | null>(null)
const webglError = ref('')

let resizeObserver: ResizeObserver | null = null

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.round((rect.width || 320) * dpr))
  const height = Math.max(1, Math.round((rect.height || 180) * dpr))

  if (canvas.width !== width) {
    canvas.width = width
  }

  if (canvas.height !== height) {
    canvas.height = height
  }

  return { width, height }
}

function drawCanvas2dPreview() {
  const canvas = canvas2dPreview.value

  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  const { width, height } = resizeCanvas(canvas)
  const paint = transformTo('canvas-2d', canvas2dRendererGradient)

  paint.draw(ctx, width, height)
}

function drawWebglPreview() {
  const canvas = webglPreview.value

  if (!canvas) {
    return
  }

  const { width, height } = resizeCanvas(canvas)
  const paint = transformTo('canvas-webgl', webglRendererGradient)

  try {
    paint.draw(canvas, width, height)
    webglError.value = ''
  } catch (value) {
    webglError.value = value instanceof Error
      ? value.message
      : 'WebGL preview failed.'
  }
}

function drawRendererPreviews() {
  drawCanvas2dPreview()
  drawWebglPreview()
}

onMounted(() => {
  drawRendererPreviews()

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(drawRendererPreviews)

    if (canvas2dPreview.value) {
      resizeObserver.observe(canvas2dPreview.value)
    }

    if (webglPreview.value) {
      resizeObserver.observe(webglPreview.value)
    }
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

# Core API

The Core API is the small surface you use to turn gradient strings into
gradiente models, validate user input, normalize output, and send gradients to
renderers.

It is built around one practical idea: parse once, then reuse the same gradient
model everywhere.

<GradientPreview
  title="Core API Flow"
  gradient="linear-gradient(120deg, #ff74f6 0%, #405de6 55%, #12c2e9 100%)"
  caption="This preview is rendered from a parsed gradiente model through transformTo('css', gradient)."
/>

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'linear-gradient(120deg, #ff74f6 0%, #405de6 55%, #12c2e9 100%)'
)

const css = transformTo('css', gradient)
```

The string is still the friendly input and output format. The parsed object is
the stable model you can inspect, edit, serialize, compare, and transform.

## API Map

```txt
parse()        string -> gradient object
isGradient()   unknown string -> boolean
format()       string | gradient object -> normalized string
transformTo()  string | gradient object -> renderer output
transformFrom() target output -> gradient object, when a reverse transformer exists
```

Most application code starts with `parse()`, validates with `isGradient()` when
input comes from users, stores normalized strings with `format()`, and renders
through `transformTo()`.

## Parse Into A Model

Use `parse()` when you want to stop treating a gradient as a raw string.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

gradient.type
gradient.getConfig()
gradient.toString()
```

The returned object is a typed gradient instance. For gradients with stops, you
can also inspect the stop list.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

if ('getStops' in gradient) {
  const stops = gradient.getStops()
}
```

This is the main difference between gradiente and a string helper. The string is
parsed into a reusable model before it is sent to a renderer.

## Validate User Input

Use `isGradient()` when the input may be invalid and you need a safe boolean
check.

```ts
import { isGradient, parse } from 'gradiente'

const input = 'conic-gradient(from 74deg, #d53f96, #ef9439, #077fe9)'

if (isGradient(input)) {
  const gradient = parse(input)
}
```

Use `parse()` when invalid input should throw an error with a concrete reason.
Use `isGradient()` when validation should not interrupt the UI.

## Normalize Before Saving

Use `format()` when you want a canonical string after parsing.

```ts
import { format } from 'gradiente'

const normalized = format('linear-gradient(to right, red, blue)')
```

`format()` accepts both strings and existing gradient objects.

```ts
import { format, parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
const normalized = format(gradient)
```

This is useful before saving presets, storing editor state, syncing data, or
comparing gradient definitions.

## Render With CSS

Use the `css` target when you need a CSS background value.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, #ff74f6, #405de6)')
const css = transformTo('css', gradient)

const preview = document.querySelector<HTMLElement>('.preview')

if (preview) {
  preview.style.backgroundImage = css
}
```

Visual result:

<figure class="renderer-preview">
  <div
    class="renderer-preview__surface"
    :style="{ backgroundImage: cssRendererBackground }"
    data-gradiente-renderer="css"
    :data-gradiente-input="cssRendererGradient"
  />
  <figcaption class="renderer-preview__caption">
    HTML/CSS background rendered by <code>transformTo('css', gradient)</code>.
  </figcaption>
</figure>

For native CSS gradient kinds, the output is a CSS gradient string. For
gradiente-specific kinds such as `diamond-gradient` and `mesh-gradient`, the CSS
transformer returns a renderable adapter background.

```ts
import { transformTo } from 'gradiente'

const css = transformTo(
  'css',
  'diamond-gradient(at center, #5851db 0%, #fcb045 100%)'
)
```

## Render With Canvas 2D

Use the `canvas-2d` target when you want gradiente to draw into a
`CanvasRenderingContext2D`.

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')
const paint = transformTo(
  'canvas-2d',
  'radial-gradient(circle at 30% 35%, #ffffff 0%, #ff74f6 35%, #405de6 100%)'
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

Visual result:

<figure class="renderer-preview">
  <canvas
    ref="canvas2dPreview"
    class="renderer-preview__surface renderer-preview__canvas"
    data-gradiente-renderer="canvas-2d"
    :data-gradiente-input="canvas2dRendererGradient"
  />
  <figcaption class="renderer-preview__caption">
    Canvas 2D preview rendered by <code>transformTo('canvas-2d', gradient)</code>.
  </figcaption>
</figure>

The returned object is renderer-specific output. For Canvas 2D, that output is a
paint object with a `draw(ctx, width, height)` method.

## Render With WebGL

Use the `canvas-webgl` target when the gradient should be drawn through WebGL.

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

Visual result:

<figure class="renderer-preview">
  <canvas
    ref="webglPreview"
    class="renderer-preview__surface renderer-preview__canvas"
    data-gradiente-renderer="canvas-webgl"
    :data-gradiente-input="webglRendererGradient"
  />
  <figcaption class="renderer-preview__caption">
    Canvas WebGL preview rendered by <code>transformTo('canvas-webgl', gradient)</code>.
  </figcaption>
  <p v-if="webglError" class="renderer-preview__error">{{ webglError }}</p>
</figure>

The API stays the same: the application asks for a target, and the transformer
returns the output shape for that target.

## Render With SVG

Use the `svg` target when you need SVG paint server output.

```ts
import { transformTo } from 'gradiente'

const svg = document.querySelector<SVGSVGElement>('svg')
const rect = svg?.querySelector<SVGRectElement>('rect')
const paint = transformTo('svg', 'linear-gradient(to right, #ff74f6, #405de6)')

if (svg && rect) {
  svg.insertAdjacentHTML('afterbegin', paint.defs)
  rect.setAttribute('fill', paint.url)
}
```

The SVG transformer returns a description that includes `defs`, `url`, and the
serialized SVG data needed to apply the gradient.

## Import From Other Targets

`transformFrom()` is the reverse side of the transformer system.

```ts
import { transformFrom } from 'gradiente'

declare const token: unknown

const gradient = transformFrom(
  'design-token',
  'linear-gradient',
  token
)
```

Reverse transformation is available when the registered transformer module
implements `from()`. This keeps the Core API symmetric without forcing every
renderer output to be reversible.

## Working Model

```txt
user input
  -> isGradient()
  -> parse()
  -> gradient object
  -> format()
  -> stored normalized string

gradient object
  -> transformTo('css')
  -> transformTo('canvas-2d')
  -> transformTo('canvas-webgl')
  -> transformTo('svg')
  -> transformTo('custom-target')
```

## Next Step

- [Transformers](/core-api/transformers) explains renderer targets in more detail.
- [Custom transformers](/core-api/custom-transformers) explains how to add your own targets.

<style scoped>
.renderer-preview {
  margin: 20px 0 28px;
}

.renderer-preview__surface {
  width: 100%;
  min-height: 180px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

.renderer-preview__canvas {
  height: 180px;
}

.renderer-preview__caption {
  margin-top: 8px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.renderer-preview__error {
  margin-top: 8px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}
</style>
