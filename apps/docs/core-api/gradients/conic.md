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

type ConicPreviewExample = {
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

function makeConicExample(
  id: string,
  label: string,
  input: string,
): ConicPreviewExample {
  try {
    const gradient = parse(input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `conic-preview-${id}`
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
  hero: makeConicExample(
    'hero',
    'Off-center OKLCH color wheel',
    'conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)',
  ),
  anatomy: makeConicExample(
    'anatomy',
    'Start angle, center, interpolation, color hint, and stops',
    'conic-gradient(from 74deg at 50% 50% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultConic: makeConicExample(
    'default-conic',
    'Default conic gradient',
    'conic-gradient(red, blue)',
  ),
  fromDegrees: makeConicExample(
    'from-degrees',
    'Start angle in degrees',
    'conic-gradient(from 90deg, red, blue)',
  ),
  fromTurn: makeConicExample(
    'from-turn',
    'Start angle in turns',
    'conic-gradient(from 0.25turn, red, blue)',
  ),
  fromRadians: makeConicExample(
    'from-radians',
    'Start angle in radians',
    'conic-gradient(from 1.5708rad, red, blue)',
  ),
  keywordPosition: makeConicExample(
    'keyword-position',
    'Keyword center position',
    'conic-gradient(at top left, red, blue)',
  ),
  valuePosition: makeConicExample(
    'value-position',
    'Percentage center position',
    'conic-gradient(at 35% 45%, red, blue)',
  ),
  fromAndPosition: makeConicExample(
    'from-and-position',
    'Start angle with shifted center',
    'conic-gradient(from 74deg at 35% 45%, #d53f96, #ef9439, #077fe9)',
  ),
  multiStop: makeConicExample(
    'multi-stop',
    'Positioned color stops',
    'conic-gradient(red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeConicExample(
    'color-hint',
    'Color hint',
    'conic-gradient(red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeConicExample(
    'double-position',
    'Hard angular sectors',
    'conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)',
  ),
  sortedStops: makeConicExample(
    'sorted-stops',
    'Normalized stop order',
    'conic-gradient(from 74deg, red, blue 72%, yellow 63%)',
  ),
  srgbInterpolation: makeConicExample(
    'srgb-interpolation',
    'sRGB interpolation',
    'conic-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeConicExample(
    'oklab-interpolation',
    'OKLab interpolation',
    'conic-gradient(at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeConicExample(
    'oklch-hue',
    'OKLCH longer hue interpolation',
    'conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeConicExample(
    'repeating',
    'Repeating conic gradient',
    'repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)',
  ),
  constructor: makeConicExample(
    'constructor',
    'Equivalent constructor output',
    'repeating-conic-gradient(from 45deg at 49% 45% in oklch, #ff74f6, #405de6)',
  ),
  transform: makeConicExample(
    'transform',
    'Renderer transformer input',
    'conic-gradient(from 74deg at 35% 45% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeConicExample(
    'format',
    'Formatted user input',
    'conic-gradient(from 74deg, red, blue 72%, yellow 63%)',
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

function getOwnRecordValue(record: Record<string, string>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key)
    ? record[key]
    : ''
}

function getWebglSnapshot(id: string) {
  return getOwnRecordValue(webglSnapshots.value, id)
}

function getWebglError(id: string) {
  return getOwnRecordValue(webglErrors.value, id)
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
    getWebglSnapshot(id) ||
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
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })

    if (!gl) {
      throw new Error('WebGL is not supported.')
    }

    const paint = transformTo('canvas-webgl', example.input)

    paint.draw(canvas, width, height)

    gl.finish()

    const snapshot = canvas.toDataURL('image/png')

    if (!snapshot || snapshot === 'data:,') {
      throw new Error('WebGL snapshot could not be captured.')
    }

    webglSnapshots.value = {
      ...webglSnapshots.value,
      [id]: snapshot,
    }
    webglErrors.value = {
      ...webglErrors.value,
      [id]: '',
    }

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

  canvas.dataset.conicPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const ConicPreviewContent = defineComponent({
  name: 'ConicPreviewContent',
  props: {
    example: {
      type: Object as PropType<ConicPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'conic-render-tile__caption' }, [
        h('span', { class: 'conic-render-tile__caption-text' }, label),
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

    return () => h('figure', { ref: root, class: 'conic-render-set' }, [
      h('figcaption', { class: 'conic-render-set__header' }, [
        h('span', { class: 'conic-render-set__eyebrow' }, 'Conic gradient example'),
        h('strong', { class: 'conic-render-set__label' }, props.example.label),
        h('code', { class: 'conic-render-set__syntax' }, props.example.normalized),
      ]),
      props.example.error
        ? h('p', { class: 'conic-render-set__error' }, props.example.error)
        : !isVisible.value
          ? h(
            'div',
            {
              class: 'conic-render-lazy',
              'data-gradiente-lazy-preview': props.example.id,
            },
            'Preview loads when it reaches the viewport.',
          )
        : h('div', { class: 'conic-render-grid' }, [
          h('figure', { class: 'conic-render-tile' }, [
            h('div', {
              class: 'conic-render-tile__surface',
              style: { backgroundImage: props.example.cssBackground },
              'data-gradiente-renderer': 'css',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('CSS target'),
          ]),
          h('figure', { class: 'conic-render-tile' }, [
            h('canvas', {
              ref: (element: unknown) =>
                setCanvasRef(props.example.id, 'canvas-2d', element),
              class: 'conic-render-tile__surface',
              'data-gradiente-renderer': 'canvas-2d',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('Canvas 2D'),
          ]),
          h('figure', { class: 'conic-render-tile' }, [
            getWebglSnapshot(props.example.id)
              ? h('img', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'conic-render-tile__surface conic-render-tile__image',
                src: getWebglSnapshot(props.example.id),
                alt: `${props.example.label} rendered with Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'conic-render-tile__surface conic-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Rendering WebGL...'),
            renderCaption('Canvas WebGL snapshot'),
            getWebglError(props.example.id)
              ? h(
                'p',
                { class: 'conic-render-set__error' },
                getWebglError(props.example.id),
              )
              : null,
          ]),
          h('figure', { class: 'conic-render-tile' }, [
            h('svg', {
              class: 'conic-render-tile__surface',
              viewBox: '0 0 100 100',
              preserveAspectRatio: 'none',
              role: 'img',
              'aria-label': `${props.example.label} rendered with SVG`,
              'data-gradiente-renderer': 'svg',
              'data-gradiente-input': props.example.input,
              innerHTML: [
                props.example.svgDefs,
                `<rect width="100%" height="100%" fill="url(#${props.example.svgId})"></rect>`,
              ].join(''),
            }),
            renderCaption('SVG pattern'),
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
        const target = entry.target as HTMLCanvasElement
        const id = target.dataset.conicPreviewId

        if (id && target instanceof HTMLCanvasElement) {
          drawCanvas2d(id)
        }
      }
    })

    for (const [id, canvas] of canvas2dRefs.entries()) {
      canvas.dataset.conicPreviewId = id
      resizeObserver.observe(canvas)
    }
  }

  void nextTick(() => {
    for (const example of exampleList) {
      drawExample(example.id)
    }
  })
})

onBeforeUnmount(() => {
  isMounted = false
  resizeObserver?.disconnect()
  canvas2dRefs.clear()
  webglSurfaceRefs.clear()
  pendingWebglSnapshots.clear()
})
</script>

# Conic Gradients

A conic gradient is an angular gradient. Instead of sampling color along a line
or by distance from a center, it samples color by the angle around a center
point. The gradient rotates around that center, so it is useful for color wheels,
charts, gauges, knobs, loaders, angular lighting, circular masks, and any design
where direction around a point matters.

In CSS conic geometry, `0deg` points upward and angles turn clockwise. gradiente
uses the same convention across CSS, Canvas 2D, Canvas WebGL, and SVG.

```css
conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)
```

<div class="conic-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

`conic-gradient(...)` and `repeating-conic-gradient(...)` are native CSS
functions, but gradiente does more than pass strings through. It parses the
gradient into an internal model, normalizes it, and transforms the same model to
CSS, Canvas 2D, Canvas WebGL, and SVG. The SVG target is generated as a pattern
payload because SVG does not have a native conic gradient primitive.

Every preview block on this page is rendered by gradiente in four targets at
once. The WebGL column is captured as a snapshot so the page does not keep many
live WebGL contexts open at the same time.

<GradientFrameworkTabs
  id="conic-framework-tabs"
  title="Use a conic gradient in your framework"
  description="Conic gradients are native CSS backgrounds, but gradiente still parses, sorts, normalizes, and transforms the same model for every renderer. Each example converts the parsed gradient with transformTo('css') and mounts the result in the framework."
  gradient="conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)"
  gradient-kind="conic gradient"
  component-name="ConicGradientPreview"
/>

## What A Conic Gradient Contains

The conic gradient model has five conceptual parts:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Function name</strong>
    <span>`conic-gradient(...)` or `repeating-conic-gradient(...)`. The public instance type remains `conic-gradient`; repeating is stored as config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Start angle</strong>
    <span>An optional `from` angle that rotates where the first stop begins.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Position</strong>
    <span>A center point introduced by `at`, such as `at center`, `at left top`, or `at 35% 45%`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Interpolation</strong>
    <span>An optional color interpolation clause such as `in srgb`, `in oklab`, or `in oklch longer hue`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Stop list</strong>
    <span>Color stops, optional percentage positions, optional double positions, and color hints around the angular sweep.</span>
  </div>
</div>

Internally, `GradientConic` stores config separately from stops:

```ts
type GradientConicConfig = {
  from: GradientAngleValue
  position: GradientPosition
  interpolation: {
    colorSpace: GradientColorSpace
    hue?: GradientHueInterpolation
  }
  isRepeating?: boolean
}
```

Stop positions are normalized numbers where `0` means the beginning of the
angular sweep and `1` means the end of the sweep. In the string syntax shown by
this page, those positions are written as percentages.

```ts
type GradientConicStop =
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

## What gradiente Does

For `conic-gradient`, gradiente handles both CSS-compatible behavior and
renderer-specific output:

- Parses conic strings into a `GradientConic` instance.
- Stores the start angle, center position, interpolation, stops, and repeating state.
- Resolves default config values from one constructor location.
- Resolves missing stop positions.
- Normalizes keyword positions into x/y order.
- Preserves color hints as first-class stop data.
- Compacts double-position stops during serialization.
- Sorts positioned stops into a stable order.
- Draws the same internal model to Canvas 2D and Canvas WebGL.
- Generates an SVG pattern for renderers that need SVG output.
- Transforms the same model to CSS, Canvas 2D, Canvas WebGL, and SVG.

## Anatomy

The full syntax has an optional configuration item followed by a required stop
list:

```css
conic-gradient(
  [from angle] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

The first comma-separated item is treated as configuration only when it contains
conic config tokens. Everything after the first comma belongs to the stop list.

```css
conic-gradient(from 74deg at 50% 50% in oklch, red 0%, 35%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

That example contains:

- `from 74deg`: the angular sweep is rotated by 74 degrees.
- `at 50% 50%`: the center is placed in the middle of the paint area.
- `in oklch`: colors are interpolated in OKLCH.
- `red 0%`: the first color stop is placed at the beginning of the sweep.
- `35%`: a color hint that moves the midpoint of the red-to-blue transition.
- `blue 100%`: the final color stop is placed at the end of the sweep.

## Defaults

If conic config is omitted, gradiente uses CSS-like defaults:

```css
conic-gradient(red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.defaultConic]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

The class defaults are:

```txt
from: 0deg
position: center center
interpolation.colorSpace: "srgb"
isRepeating: false
```

Default values are omitted from `toString()`. That is why
`conic-gradient(from 0deg at center in srgb, red, blue)` can serialize to the
compact `conic-gradient(red, blue)`.

## Start Angle

The `from` angle rotates the whole gradient around its center. It does not
change stop positions; it changes where the sweep begins.

`90deg` rotates the first stop to the right side of the box:

```css
conic-gradient(from 90deg, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.fromDegrees]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Angles can use CSS angle units supported by the model, including `deg`, `turn`,
`rad`, and `grad`.

```css
conic-gradient(from 0.25turn, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.fromTurn]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

```css
conic-gradient(from 1.5708rad, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.fromRadians]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

## Position

Position moves the center of the angular sweep. It always follows `at`.

Keyword positions use x/y keywords:

```css
conic-gradient(at top left, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

gradiente normalizes keyword positions into x/y order. For example, `at top left`
serializes as `at left top`.

Value positions use two length-percentage values:

```css
conic-gradient(at 35% 45%, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

You can combine `from` and `at` when the angular sweep needs both rotation and a
shifted center:

```css
conic-gradient(from 74deg at 35% 45%, #d53f96, #ef9439, #077fe9)
```

<div class="conic-preview-block" v-for="example in [examples.fromAndPosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

The current parser keeps positions strict: keyword positions are keyword-only,
and value positions require two length-percentage tokens. Mixed CSS forms such
as `left 20px top 10px` are not part of this model yet.

## Stop List

The stop list defines what colors appear around the circle. A practical conic
gradient usually has at least two color stops.

If a color stop has no explicit position, gradiente resolves it from neighboring
stops. The first unresolved color stop becomes `0%`; the last unresolved color
stop becomes `100%`; unresolved stops between known positions are distributed
evenly.

```css
conic-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Color hints are bare percentages between two color stops. They do not create a
new color stop. They move the perceived midpoint of the interpolation segment.

```css
conic-gradient(red 0%, 35%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Double-position stops create hard angular sectors. A color written with two
positions is stored as two adjacent color stops with the same color, then
serialized back into the compact form when possible.

```css
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
```

<div class="conic-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

When positioned stops are written out of order, gradiente normalizes them into a
stable order. This is important for editor state, snapshots, and cross-renderer
comparisons.

```css
conic-gradient(from 74deg, red, blue 72%, yellow 63%)
```

<div class="conic-preview-block" v-for="example in [examples.sortedStops]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

## Interpolation

Interpolation controls the path between colors. It matters strongly for conic
gradients because hue changes wrap around a center and are easy to notice.

The default interpolation space is `srgb`.

```css
conic-gradient(in srgb, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Perceptual spaces such as `oklab` often produce smoother angular ramps.

```css
conic-gradient(at 25% 75% in oklab, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Polar color spaces can use hue interpolation modes. gradiente supports
`shorter`, `longer`, `increasing`, and `decreasing`.

```css
conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="conic-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Hue interpolation is meaningful only for polar color spaces. If a hue mode is
provided for a rectangular space such as `oklab`, gradiente keeps the color
space and serializes the gradient without the hue mode.

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

## Repeating Conic Gradients

`repeating-conic-gradient(...)` uses the same internal gradient kind as
`conic-gradient(...)`. The prefix sets `isRepeating: true` in the config, while
the instance `type` remains `conic-gradient`.

```css
repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)
```

<div class="conic-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Repeating conic gradients are useful for wheel ticks, polar charts, loading
rings, angle rulers, technical overlays, radial stripes, and generated angular
patterns.

## Programmatic Construction

Most users should start with `parse()` because it gives you the same input shape
used by the DSL. When you need to build a gradient directly, use
`GradientConic`.

The constructor takes two parameters:

```txt
new GradientConic(stops, config?)
```

`stops` is required. `config` is optional and missing values are resolved from
class defaults.

```ts
import { GradientConic } from 'gradiente'

const gradient = new GradientConic(
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
    isRepeating: true,
    from: {
      kind: 'angle',
      value: 45,
      unit: 'deg',
    },
    position: {
      kind: 'values',
      x: {
        kind: 'percent',
        value: 49,
      },
      y: {
        kind: 'percent',
        value: 45,
      },
    },
    interpolation: {
      colorSpace: 'oklch',
    },
  },
)
```

<div class="conic-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

## Transforming A Conic Gradient

Every renderer target receives the same source model. That is the main point of
the Core API: parse once, transform many times.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'conic-gradient(from 74deg at 35% 45% in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="conic-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

The transformer outputs have different shapes:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>A CSS background string. For conic gradients this is the normalized native CSS `conic-gradient(...)` or `repeating-conic-gradient(...)` string.</span>
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
    <span>An SVG pattern payload with `defs`, `url`, and serialized SVG data.</span>
  </div>
</div>

## Normalization

Use `format()` before storing user input. It parses the string into the internal
model and serializes it back to the canonical gradiente string.

```ts
import { format } from 'gradiente'

const input = 'conic-gradient(from 74deg, red, blue 72%, yellow 63%)'
const normalized = format(input)
```

<div class="conic-preview-block" v-for="example in [examples.format]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Normalization is especially useful for conic gradients because native CSS and
author input can disagree visually when stops are written out of order.
gradiente parses the string, sorts positioned stops into a stable model, and
then uses that model for every renderer.

## Practical Checklist

Use this order when building or validating a conic gradient:

1. Choose the center with `at` when the sweep should rotate around a point other than the box center.
2. Choose `from` when the first stop should start at a specific angle.
3. Choose interpolation: `srgb` for simple parity, `oklab` or `oklch` for smoother ramps.
4. Add at least two color stops for useful visual output.
5. Add explicit percentage stop positions when angular sectors must survive editing.
6. Use color hints when the transition midpoint needs to move.
7. Use double-position stops when you need hard sectors.
8. Use `repeating-conic-gradient(...)` for ticks, stripes, or repeated angular bands.
9. Use `format()` before storing user input.
10. Use `transformTo()` for renderer output instead of trying to hand-convert the string.

<style scoped>
.conic-preview-block {
  margin: 18px 0 34px;
}

:deep(.conic-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.conic-render-set__header) {
  display: grid;
  gap: 8px;
  height: 118px;
  overflow: hidden;
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background:
    conic-gradient(
      from 35deg at 18% 12%,
      color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent),
      transparent 34%,
      color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent),
      transparent 82%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent),
      color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
    );
}

:deep(.conic-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.conic-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.conic-render-set__syntax) {
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

:deep(.conic-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.conic-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.conic-render-tile:last-child) {
  border-right: 0;
}

:deep(.conic-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.conic-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.conic-render-tile__image) {
  object-fit: fill;
}

:deep(.conic-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.conic-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.conic-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.conic-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.conic-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.conic-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.conic-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.conic-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.conic-render-tile) {
    border-right: 0;
  }

  :deep(.conic-render-tile + .conic-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
