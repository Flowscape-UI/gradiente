<script setup lang="ts">
import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import { parse, transformTo } from 'gradiente'

type CanvasTarget = 'canvas-2d'

type LinearPreviewExample = {
  id: string
  label: string
  input: string
  normalized: string
  cssBackground: string
  svgId: string
  svgDefs: string
  error: string
}

type SvgPreviewPayload = {
  id: string
  defs: string
}

function createSvgPreview(svgPayload: SvgPreviewPayload, id: string) {
  return {
    id,
    defs: svgPayload.defs.replaceAll(svgPayload.id, id),
  }
}

function makeLinearExample(
  id: string,
  label: string,
  input: string,
): LinearPreviewExample {
  try {
    const gradient = parse(input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `linear-preview-${id}`
    const svgPreview = createSvgPreview(svg, svgId)

    return {
      id,
      label,
      input,
      normalized: gradient.toString(),
      cssBackground: transformTo('css', gradient),
      svgId: svgPreview.id,
      svgDefs: svgPreview.defs,
      error: '',
    }
  } catch (value) {
    return {
      id,
      label,
      input,
      normalized: input,
      cssBackground: '',
      svgId: '',
      svgDefs: '',
      error: value instanceof Error ? value.message : 'Failed to render preview.',
    }
  }
}

const examples = {
  hero: makeLinearExample(
    'hero',
    '120deg OKLCH ramp',
    'linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)',
  ),
  anatomy: makeLinearExample(
    'anatomy',
    'Direction, interpolation, color hint, and stops',
    'linear-gradient(to right in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultDirection: makeLinearExample(
    'default-direction',
    'Default direction',
    'linear-gradient(red, blue)',
  ),
  keywordDirection: makeLinearExample(
    'keyword-direction',
    'Keyword direction',
    'linear-gradient(to right, red, blue)',
  ),
  diagonalDirection: makeLinearExample(
    'diagonal-direction',
    'Diagonal keyword direction',
    'linear-gradient(to top left, red 0%, blue 100%)',
  ),
  numericAngle: makeLinearExample(
    'numeric-angle',
    'Numeric angle',
    'linear-gradient(0.25turn, red, blue)',
  ),
  normalizedAngle: makeLinearExample(
    'normalized-angle',
    'Normalized angle',
    'linear-gradient(450deg, red, blue)',
  ),
  multiStop: makeLinearExample(
    'multi-stop',
    'Positioned color stops',
    'linear-gradient(red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeLinearExample(
    'color-hint',
    'Color hint',
    'linear-gradient(to right, red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeLinearExample(
    'double-position',
    'Double-position stops',
    'linear-gradient(to right, red 0% 35%, blue 35% 100%)',
  ),
  srgbInterpolation: makeLinearExample(
    'srgb-interpolation',
    'sRGB interpolation',
    'linear-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeLinearExample(
    'oklab-interpolation',
    'OKLab interpolation',
    'linear-gradient(in oklab, red, blue)',
  ),
  oklchHue: makeLinearExample(
    'oklch-hue',
    'OKLCH longer hue interpolation',
    'linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeLinearExample(
    'repeating',
    'Repeating linear gradient',
    'repeating-linear-gradient(to right, red 0%, blue 10%)',
  ),
  constructor: makeLinearExample(
    'constructor',
    'Equivalent constructor output',
    'linear-gradient(to right in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeLinearExample(
    'transform',
    'Renderer transformer input',
    'linear-gradient(135deg in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeLinearExample(
    'format',
    'Formatted user input',
    'linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)',
  ),
}

const exampleList = Object.values(examples)
const canvas2dRefs = new Map<string, HTMLCanvasElement>()
const webglSurfaceRefs = new Map<string, HTMLElement>()
const webglSnapshots = ref<Record<string, string>>({})
const webglErrors = ref<Record<string, string>>({})
const pendingWebglSnapshots = new Set<string>()

let resizeObserver: ResizeObserver | null = null
let isMounted = false

function getExample(id: string) {
  return exampleList.find((example) => example.id === id)
}

function getRenderSize(element: Element | undefined, fallback = 320) {
  const rect = element?.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const cssWidth = rect?.width || fallback
  const cssHeight = rect?.height || cssWidth
  const width = Math.max(1, Math.round(cssWidth * dpr))
  const height = Math.max(1, Math.round(cssHeight * dpr))

  return { width, height }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const { width, height } = getRenderSize(canvas)

  if (canvas.width !== width) {
    canvas.width = width
  }

  if (canvas.height !== height) {
    canvas.height = height
  }

  return { width, height }
}

function drawCanvas2d(id: string) {
  const example = getExample(id)
  const canvas = canvas2dRefs.get(id)

  if (!example || example.error || !canvas) {
    return
  }

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  const { width, height } = resizeCanvas(canvas)
  const paint = transformTo('canvas-2d', example.input)

  paint.draw(ctx, width, height)
}

function drawWebgl(id: string) {
  const example = getExample(id)

  if (
    !example ||
    example.error ||
    webglSnapshots.value[id] ||
    pendingWebglSnapshots.has(id)
  ) {
    return
  }

  pendingWebglSnapshots.add(id)

  const canvas = document.createElement('canvas')
  const { width, height } = getRenderSize(webglSurfaceRefs.get(id))

  canvas.width = width
  canvas.height = height

  try {
    const paint = transformTo('canvas-webgl', example.input)

    paint.draw(canvas, width, height)
    webglSnapshots.value = {
      ...webglSnapshots.value,
      [id]: canvas.toDataURL('image/png'),
    }
    webglErrors.value = {
      ...webglErrors.value,
      [id]: '',
    }

    const gl = canvas.getContext('webgl')

    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch (value) {
    webglErrors.value = {
      ...webglErrors.value,
      [id]: value instanceof Error ? value.message : 'WebGL preview failed.',
    }
  } finally {
    pendingWebglSnapshots.delete(id)
  }
}

function drawExample(id: string) {
  drawCanvas2d(id)
  drawWebgl(id)
}

function setWebglSurfaceRef(id: string, element: unknown) {
  const surface = element instanceof HTMLElement
    ? element
    : null

  if (!surface) {
    webglSurfaceRefs.delete(id)
    return
  }

  surface.dataset.linearPreviewId = id
  webglSurfaceRefs.set(id, surface)

  if (isMounted) {
    void nextTick(() => drawWebgl(id))
  }
}

function setCanvasRef(
  id: string,
  _target: CanvasTarget,
  element: unknown,
) {
  const canvas = element instanceof HTMLCanvasElement
    ? element
    : null

  if (!canvas) {
    canvas2dRefs.delete(id)
    return
  }

  canvas.dataset.linearPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const LinearPreviewContent = defineComponent({
  name: 'LinearPreviewContent',
  props: {
    example: {
      type: Object as PropType<LinearPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'linear-render-tile__caption' }, [
        h('span', { class: 'linear-render-tile__caption-text' }, label),
      ])
    }

    function activatePreview() {
      if (isVisible.value) {
        return
      }

      isVisible.value = true
      intersectionObserver?.disconnect()
      void nextTick(() => drawExample(props.example.id))
    }

    onMounted(() => {
      if (!root.value) {
        return
      }

      if (!('IntersectionObserver' in window)) {
        activatePreview()
        return
      }

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            activatePreview()
          }
        },
        {
          rootMargin: '420px 0px',
        },
      )

      intersectionObserver.observe(root.value)
    })

    onBeforeUnmount(() => {
      intersectionObserver?.disconnect()
      canvas2dRefs.delete(props.example.id)
    })

    return () => h('figure', { ref: root, class: 'linear-render-set' }, [
      h('figcaption', { class: 'linear-render-set__header' }, [
        h('span', { class: 'linear-render-set__eyebrow' }, 'Linear gradient example'),
        h('strong', { class: 'linear-render-set__label' }, props.example.label),
        h('code', { class: 'linear-render-set__syntax' }, props.example.normalized),
      ]),
      props.example.error
        ? h('p', { class: 'linear-render-set__error' }, props.example.error)
        : !isVisible.value
          ? h(
            'div',
            {
              class: 'linear-render-lazy',
              'data-gradiente-lazy-preview': props.example.id,
            },
            'Preview loads when it reaches the viewport.',
          )
        : h('div', { class: 'linear-render-grid' }, [
          h('figure', { class: 'linear-render-tile' }, [
            h('div', {
              class: 'linear-render-tile__surface',
              style: { backgroundImage: props.example.cssBackground },
              'data-gradiente-renderer': 'css',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('CSS'),
          ]),
          h('figure', { class: 'linear-render-tile' }, [
            h('canvas', {
              ref: (element: unknown) =>
                setCanvasRef(props.example.id, 'canvas-2d', element),
              class: 'linear-render-tile__surface',
              'data-gradiente-renderer': 'canvas-2d',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('Canvas 2D'),
          ]),
          h('figure', { class: 'linear-render-tile' }, [
            webglSnapshots.value[props.example.id]
              ? h('img', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'linear-render-tile__surface linear-render-tile__image',
                src: webglSnapshots.value[props.example.id],
                alt: `${props.example.label} rendered with Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'linear-render-tile__surface linear-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Rendering WebGL...'),
            renderCaption('Canvas WebGL snapshot'),
            webglErrors.value[props.example.id]
              ? h(
                'p',
                { class: 'linear-render-set__error' },
                webglErrors.value[props.example.id],
              )
              : null,
          ]),
          h('figure', { class: 'linear-render-tile' }, [
            h('svg', {
              class: 'linear-render-tile__surface',
              viewBox: '0 0 100 100',
              preserveAspectRatio: 'none',
              role: 'img',
              'aria-label': `${props.example.label} rendered with SVG`,
              'data-gradiente-renderer': 'svg',
              'data-gradiente-input': props.example.input,
              innerHTML: [
                props.example.svgDefs,
                `<rect width="100" height="100" fill="url(#${props.example.svgId})"></rect>`,
              ].join(''),
            }),
            renderCaption('SVG'),
          ]),
        ]),
    ])
  },
})

onMounted(() => {
  isMounted = true

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLCanvasElement).dataset.linearPreviewId

        if (id) {
          drawCanvas2d(id)
        }
      }
    })

    for (const [id, canvas] of canvas2dRefs.entries()) {
      canvas.dataset.linearPreviewId = id
      resizeObserver.observe(canvas)
    }
  }
})

onBeforeUnmount(() => {
  isMounted = false
  resizeObserver?.disconnect()
  canvas2dRefs.clear()
  webglSurfaceRefs.clear()
  pendingWebglSnapshots.clear()
})
</script>

# Linear Gradients

A linear gradient is a color ramp projected along a straight axis. The renderer
places an invisible line across the paint area, maps each pixel onto that line,
and samples the ordered stops at the matching position.

In gradiente, a linear gradient is not just a CSS string. It is a typed gradient
model with direction, interpolation settings, stops, optional color hints, and a
repeating flag. The same model can be transformed into CSS, Canvas 2D, Canvas
WebGL, SVG, or a custom transformer target.

```css
linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)
```

<div class="linear-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Every preview block on this page renders the same source gradient in four
targets at once: CSS, Canvas 2D, Canvas WebGL, and SVG. The WebGL column is a
snapshot generated through `transformTo('canvas-webgl', gradient)` so the page
does not keep many live WebGL contexts open at the same time. Preview rendering
is lazy-loaded as each example approaches the viewport.

## What A Linear Gradient Contains

The linear gradient model has four conceptual parts:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Function name</strong>
    <span>`linear-gradient(...)` or `repeating-linear-gradient(...)`. The public instance type remains `linear-gradient`; repeating is stored as config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Direction</strong>
    <span>A keyword direction such as `to right`, a diagonal such as `to top left`, or an angle such as `120deg`, `0.25turn`, `1.57rad`, or `100grad`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Interpolation</strong>
    <span>The color space after `in`, plus an optional hue route for polar color spaces: `shorter`, `longer`, `increasing`, or `decreasing`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Stop list</strong>
    <span>Color stops, optional percentage positions, optional double positions, and color hints.</span>
  </div>
</div>

The model that gradiente stores is renderer-agnostic:

```ts
type GradientLinearConfig = {
  angle: number
  interpolation: {
    colorSpace: GradientColorSpace
    hue?: GradientHueInterpolation
  }
  isRepeating?: boolean
}
```

The angle is normalized to radians. Stop positions are stored as normalized
numbers where `0` means `0%` and `1` means `100%`.

The stop model for a linear gradient is the shared gradiente stop model:

```ts
type GradientLinearStop =
  | {
      type: 'color-stop'
      value: string
      position: number
    }
  | {
      type: 'color-hint'
      position: number
    }
```

Color values stay as strings so they can preserve author intent. Renderers
convert and sample them only when they need concrete colors.

## What gradiente Does

For `linear-gradient`, gradiente handles the work that usually gets scattered
across parsers, UI code, serializers, and renderers:

- Parses CSS-like strings into a `GradientLinear` instance.
- Normalizes direction into radians.
- Resolves missing stop positions.
- Sorts stops while preserving stable order for equal positions.
- Preserves color hints as first-class stop data.
- Compacts double-position stops during serialization.
- Stores repeating state from `repeating-linear-gradient(...)`.
- Samples interpolation for renderers that need concrete color stops.
- Transforms the same model to CSS, Canvas 2D, Canvas WebGL, and SVG.

## Anatomy

The full syntax has one optional configuration item followed by a required stop
list:

```css
linear-gradient(
  [direction] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

The first comma-separated item is treated as configuration only when it contains
direction or interpolation tokens. Everything after the first comma belongs to
the stop list.

```css
linear-gradient(to right in oklch, red 0%, 35%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

That example contains:

- `to right`: the gradient axis goes left to right.
- `in oklch`: colors are interpolated in OKLCH.
- `red 0%`: the first color stop is placed at the start.
- `35%`: a color hint that moves the midpoint of the red-to-blue transition.
- `blue 100%`: the final color stop is placed at the end.

## Direction

Direction decides how the invisible sampling line crosses the paint box.

If direction is omitted, gradiente uses the CSS-like default: top to bottom. The
internal angle is `Math.PI` radians and the serializer omits it because it is the
default.

```css
linear-gradient(red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.defaultDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Keyword directions are best when authoring by hand because they are readable.

```css
linear-gradient(to right, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.keywordDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Diagonal keyword directions are also supported.

```css
linear-gradient(to top left, red 0%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.diagonalDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Numeric angles are better for generated data, animation, or precise controls.
gradiente accepts `deg`, `rad`, `turn`, and `grad`.

```css
linear-gradient(0.25turn, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.numericAngle]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Angles are normalized. For example, `450deg` is equivalent to `90deg`, so
serialization can become `to right`.

```css
linear-gradient(450deg, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.normalizedAngle]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Common direction values map to these internal angles:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>omitted / `to bottom`</strong>
    <span>`Math.PI` radians. This is the default and is omitted from `toString()`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to top`</strong>
    <span>`0` radians.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to right`</strong>
    <span>`Math.PI / 2` radians.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to left`</strong>
    <span>`Math.PI * 1.5` radians.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>diagonals</strong>
    <span>`to top right`, `to bottom right`, `to bottom left`, and `to top left` are stored as normalized diagonal angles.</span>
  </div>
</div>

## Stop List

The stop list defines what colors appear on the gradient line and where they
appear. Practical linear gradients usually have at least two color stops.

If a color stop has no explicit position, gradiente resolves it from neighboring
stops. The first unresolved color stop becomes `0%`; the last unresolved color
stop becomes `100%`; unresolved stops between known positions are distributed
evenly.

```css
linear-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Color hints are bare percentages between two color stops. They do not create a
new color stop. They move the perceived midpoint of the interpolation segment.

```css
linear-gradient(to right, red 0%, 35%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Double-position stops create hard ranges. A color written with two positions is
stored as two adjacent color stops with the same color, then serialized back into
the compact form when possible.

```css
linear-gradient(to right, red 0% 35%, blue 35% 100%)
```

<div class="linear-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

## Interpolation

Interpolation controls the path between colors. This is one of the most
important differences between a plain CSS string and gradiente's renderer model:
Canvas 2D, WebGL, and SVG do not all support CSS Color 4 interpolation syntax
natively, so gradiente resolves renderable color stops for those targets.

The default interpolation space is `srgb`.

```css
linear-gradient(in srgb, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Perceptual spaces such as `oklab` often produce smoother ramps.

```css
linear-gradient(in oklab, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Polar color spaces can use hue interpolation modes. gradiente supports
`shorter`, `longer`, `increasing`, and `decreasing`.

```css
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="linear-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Supported color spaces are:

```txt
oklab
lch
oklch
hsl
hwb
lab
srgb
srgb-linear
xyz
display-p3
a98-rgb
prophoto-rgb
rec2020
```

## Repeating Linear Gradients

`repeating-linear-gradient(...)` uses the same internal gradient kind as
`linear-gradient(...)`. The prefix sets `isRepeating: true` in the config, while
the instance `type` remains `linear-gradient`.

```css
repeating-linear-gradient(to right, red 0%, blue 10%)
```

<div class="linear-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Repeating gradients are especially useful for stripes, scanlines, rulers,
debugging overlays, and generated pattern systems.

## Programmatic Construction

Most users should start with `parse()` because it gives you the same input shape
people already know from CSS. When you need to build a gradient directly, use
`GradientLinear`.

The constructor takes two parameters:

```txt
new GradientLinear(stops, config?)
```

`stops` is required. `config` is optional and missing values are resolved from
class defaults.

```ts
import { GradientLinear } from 'gradiente'

const gradient = new GradientLinear(
  [
    {
      type: 'color-stop',
      value: '#ff74f6',
      position: 0,
    },
    {
      type: 'color-stop',
      value: '#405de6',
      position: 1,
    },
  ],
  {
    angle: Math.PI / 2,
    interpolation: {
      colorSpace: 'oklch',
    },
  },
)
```

<div class="linear-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

## Transforming A Linear Gradient

Every renderer target receives the same source model. That is the main point of
the Core API: parse once, transform many times.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'linear-gradient(135deg in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="linear-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

The transformer outputs have different shapes:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>A CSS background string.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-2d`</strong>
    <span>A paint object with `draw(ctx, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-webgl`</strong>
    <span>A paint object with `draw(canvas, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`svg`</strong>
    <span>An SVG paint server payload with `defs`, `url`, and serialized SVG data.</span>
  </div>
</div>

## Normalization

Use `format()` before storing user input. It parses the string into the internal
model and serializes it back to the canonical gradiente string.

```ts
import { format } from 'gradiente'

const input = 'linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="linear-preview-block" v-for="example in [examples.format]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Normalization is useful when users type gradients manually, when editor state is
saved, or when generated gradients need stable output for tests and snapshots.

## Defaults

These are the class defaults for a new linear gradient when config values are not
provided:

```txt
angle: Math.PI
interpolation.colorSpace: "srgb"
isRepeating: false
```

Default values are omitted from `toString()`. For example, `180deg` and `in srgb`
are default values for a non-repeating linear gradient, so they do not need to
be serialized.

## Practical Checklist

Use this order when building or validating a linear gradient:

1. Choose a direction: a keyword for hand-authored gradients, an angle for generated data.
2. Choose interpolation: `srgb` for CSS parity, `oklab` or `oklch` for smoother ramps.
3. Add at least two color stops for useful visual output.
4. Add explicit stop positions when the design must survive editing.
5. Use color hints when the transition midpoint needs to move.
6. Use double-position stops when you need hard bands.
7. Use `format()` before storing user input.
8. Use `transformTo()` for renderer output instead of hand-converting the string.

<style scoped>
.linear-preview-block {
  margin: 18px 0 34px;
}

:deep(.linear-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.linear-render-set__header) {
  display: grid;
  gap: 8px;
  height: 118px;
  overflow: hidden;
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent),
    color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
  );
}

:deep(.linear-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.linear-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.linear-render-set__syntax) {
  width: 100%;
  overflow: hidden;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-code-bg);
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
}

:deep(.linear-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.linear-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.linear-render-tile:last-child) {
  border-right: 0;
}

:deep(.linear-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.linear-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.linear-render-tile__image) {
  object-fit: fill;
}

:deep(.linear-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.linear-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.linear-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.linear-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.linear-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.linear-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.linear-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.linear-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.linear-render-tile) {
    border-right: 0;
  }

  :deep(.linear-render-tile + .linear-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
