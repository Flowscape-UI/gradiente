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

type DiamondPreviewExample = {
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

function makeDiamondExample(
  id: string,
  label: string,
  input: string,
): DiamondPreviewExample {
  try {
    const gradient = parse(input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `diamond-preview-${id}`
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
  hero: makeDiamondExample(
    'hero',
    'Off-center OKLCH diamond field',
    'diamond-gradient(farthest-corner at 48% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)',
  ),
  anatomy: makeDiamondExample(
    'anatomy',
    'Size, position, interpolation, color hint, and stops',
    'diamond-gradient(closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultDiamond: makeDiamondExample(
    'default-diamond',
    'Default diamond gradient',
    'diamond-gradient(red, blue)',
  ),
  circleShape: makeDiamondExample(
    'circle-shape',
    'Circle-shaped diamond metric',
    'diamond-gradient(circle, red, blue)',
  ),
  ellipseShape: makeDiamondExample(
    'ellipse-shape',
    'Explicit stretched diamond',
    'diamond-gradient(ellipse 35% 70%, cyan, blue 60%, black)',
  ),
  closestSide: makeDiamondExample(
    'closest-side',
    'closest-side extent',
    'diamond-gradient(closest-side, red, blue)',
  ),
  closestCorner: makeDiamondExample(
    'closest-corner',
    'closest-corner extent',
    'diamond-gradient(closest-corner at 25% 75%, #ff74f6, #405de6)',
  ),
  farthestSide: makeDiamondExample(
    'farthest-side',
    'farthest-side extent',
    'diamond-gradient(farthest-side at left center, #ff74f6, #405de6)',
  ),
  explicitSize: makeDiamondExample(
    'explicit-size',
    'Explicit x/y radii',
    'diamond-gradient(40% 80% at 35% 65% in oklab, red 0%, yellow 50%, blue 100%)',
  ),
  keywordPosition: makeDiamondExample(
    'keyword-position',
    'Keyword position',
    'diamond-gradient(at top left, red, blue)',
  ),
  valuePosition: makeDiamondExample(
    'value-position',
    'Percentage position',
    'diamond-gradient(at 25% 75%, red, blue)',
  ),
  multiStop: makeDiamondExample(
    'multi-stop',
    'Positioned color stops',
    'diamond-gradient(red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeDiamondExample(
    'color-hint',
    'Color hint',
    'diamond-gradient(red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeDiamondExample(
    'double-position',
    'Hard diamond bands',
    'diamond-gradient(red 0% 35%, blue 35% 100%)',
  ),
  srgbInterpolation: makeDiamondExample(
    'srgb-interpolation',
    'sRGB interpolation',
    'diamond-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeDiamondExample(
    'oklab-interpolation',
    'OKLab interpolation',
    'diamond-gradient(at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeDiamondExample(
    'oklch-hue',
    'OKLCH longer hue interpolation',
    'diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeDiamondExample(
    'repeating',
    'Repeating diamond gradient',
    'repeating-diamond-gradient(at center, red 0%, blue 20%)',
  ),
  constructor: makeDiamondExample(
    'constructor',
    'Equivalent constructor output',
    'diamond-gradient(closest-side at 35% 45% in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeDiamondExample(
    'transform',
    'Renderer transformer input',
    'diamond-gradient(40% 80% at 35% 65% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeDiamondExample(
    'format',
    'Formatted user input',
    'diamond-gradient(closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)',
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

  canvas.dataset.diamondPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const DiamondPreviewContent = defineComponent({
  name: 'DiamondPreviewContent',
  props: {
    example: {
      type: Object as PropType<DiamondPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'diamond-render-tile__caption' }, [
        h('span', { class: 'diamond-render-tile__caption-text' }, label),
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

    return () => h('figure', { ref: root, class: 'diamond-render-set' }, [
      h('figcaption', { class: 'diamond-render-set__header' }, [
        h('span', { class: 'diamond-render-set__eyebrow' }, 'Diamond gradient example'),
        h('strong', { class: 'diamond-render-set__label' }, props.example.label),
        h('code', { class: 'diamond-render-set__syntax' }, props.example.normalized),
      ]),
      props.example.error
        ? h('p', { class: 'diamond-render-set__error' }, props.example.error)
        : !isVisible.value
          ? h(
            'div',
            {
              class: 'diamond-render-lazy',
              'data-gradiente-lazy-preview': props.example.id,
            },
            'Preview loads when it reaches the viewport.',
          )
        : h('div', { class: 'diamond-render-grid' }, [
          h('figure', { class: 'diamond-render-tile' }, [
            h('div', {
              class: 'diamond-render-tile__surface',
              style: { backgroundImage: props.example.cssBackground },
              'data-gradiente-renderer': 'css',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('CSS target'),
          ]),
          h('figure', { class: 'diamond-render-tile' }, [
            h('canvas', {
              ref: (element: unknown) =>
                setCanvasRef(props.example.id, 'canvas-2d', element),
              class: 'diamond-render-tile__surface',
              'data-gradiente-renderer': 'canvas-2d',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('Canvas 2D'),
          ]),
          h('figure', { class: 'diamond-render-tile' }, [
            getWebglSnapshot(props.example.id)
              ? h('img', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'diamond-render-tile__surface diamond-render-tile__image',
                src: getWebglSnapshot(props.example.id),
                alt: `${props.example.label} rendered with Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'diamond-render-tile__surface diamond-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Rendering WebGL...'),
            renderCaption('Canvas WebGL snapshot'),
            getWebglError(props.example.id)
              ? h(
                'p',
                { class: 'diamond-render-set__error' },
                getWebglError(props.example.id),
              )
              : null,
          ]),
          h('figure', { class: 'diamond-render-tile' }, [
            h('svg', {
              class: 'diamond-render-tile__surface',
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
        const id = target.dataset.diamondPreviewId

        if (id && target instanceof HTMLCanvasElement) {
          drawCanvas2d(id)
        }
      }
    })

    for (const [id, canvas] of canvas2dRefs.entries()) {
      canvas.dataset.diamondPreviewId = id
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

# Diamond Gradients

A diamond gradient is a gradiente-specific gradient kind. It behaves like a
radial gradient from the user's point of view, but it uses a diamond distance
field instead of a circular distance field. Pixels are measured by how far they
move horizontally and vertically from the center, so equal-distance contours form
diamonds.

That makes `diamond-gradient(...)` useful for faceted glows, UI highlights,
isometric-looking surfaces, hard-edged bands, generated pattern systems, and
effects where a radial gradient feels too round.

```css
diamond-gradient(farthest-corner at 48% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`diamond-gradient` is not a native CSS gradient function. Every preview block on
this page is rendered by gradiente in four targets at once: CSS target,
Canvas 2D, Canvas WebGL, and SVG. The CSS target is a generated SVG data URL, and
the SVG target is a pattern payload. The WebGL column is captured as a snapshot
so the page does not keep many live WebGL contexts open at the same time.

## What A Diamond Gradient Contains

The diamond gradient model has five conceptual parts:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Function name</strong>
    <span>`diamond-gradient(...)` or `repeating-diamond-gradient(...)`. The public instance type remains `diamond-gradient`; repeating is stored as config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Distance field</strong>
    <span>A diamond metric. `circle` keeps x/y radii equal; `ellipse` allows different x/y radii.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Size</strong>
    <span>An extent keyword such as `closest-side`, `closest-corner`, `farthest-side`, `farthest-corner`, or explicit length/percentage radii.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Position</strong>
    <span>A center point introduced by `at`, such as `at left top`, `at center`, or `at 25% 75%`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Stop list</strong>
    <span>Color stops, optional percentage positions, optional double positions, and color hints along the diamond radius.</span>
  </div>
</div>

Internally, `GradientDiamond` reuses the radial config model. The important
difference is not the public syntax; it is the distance calculation used by the
renderers.

```ts
type GradientDiamondConfig = GradientRadialConfig

type GradientDiamondConfigResolved = {
  shape: 'circle' | 'ellipse'
  size:
    | {
        kind: 'extent'
        value: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
      }
    | {
        kind: 'explicit'
        x: GradientLengthPercentage
        y?: GradientLengthPercentage
      }
  position: GradientPosition
  interpolation: {
    colorSpace: GradientColorSpace
    hue?: GradientHueInterpolation
  }
  isRepeating?: boolean
}
```

Stop positions are normalized numbers where `0` means the center and `1` means
the resolved diamond boundary. Repeating renderers can sample beyond `1` when
the visible rectangle needs additional diamond bands to cover the corners.

```ts
type GradientDiamondStop =
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

For `diamond-gradient`, gradiente handles the work that cannot be delegated to
native CSS:

- Parses diamond strings into a `GradientDiamond` instance.
- Stores size, center position, interpolation, stops, and repeating state.
- Reuses radial config parsing without exposing a separate one-off model.
- Resolves default values from one constructor location.
- Resolves missing stop positions.
- Preserves color hints as first-class stop data.
- Compacts double-position stops during serialization.
- Samples the diamond field for CSS and SVG targets.
- Draws the same model to Canvas 2D and Canvas WebGL.
- Transforms the same model to CSS, Canvas 2D, Canvas WebGL, and SVG.

## Anatomy

The full syntax has one optional configuration item followed by a required stop
list:

```css
diamond-gradient(
  [shape] [size] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

The first comma-separated item is treated as configuration only when it contains
diamond config tokens. Everything after the first comma belongs to the stop list.

```css
diamond-gradient(closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

That example contains:

- `closest-side`: the diamond reaches the closest side from its center.
- `at 30% 35%`: the center is placed near the upper-left area.
- `in oklch`: colors are interpolated in OKLCH.
- `red 0%`: the first color stop is placed at the center.
- `35%`: a color hint that moves the midpoint of the red-to-blue transition.
- `blue 100%`: the final color stop is placed at the resolved diamond boundary.

## Defaults

If diamond config is omitted, gradiente uses the same config defaults as the
radial family:

```css
diamond-gradient(red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.defaultDiamond]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

The class defaults are:

```txt
shape: "ellipse"
size.kind: "extent"
size.value: "farthest-corner"
position: center center
interpolation.colorSpace: "srgb"
isRepeating: false
```

Default values are omitted from `toString()`. That is why
`diamond-gradient(ellipse farthest-corner at center in srgb, red, blue)` can
serialize to the compact `diamond-gradient(red, blue)`.

## Diamond Geometry

The diamond renderer uses a Manhattan-like distance field:

```txt
t = abs(x - center.x) / radius.x + abs(y - center.y) / radius.y
```

The color is sampled at `t`. When `t` is `0`, the pixel is at the center. When
`t` is `1`, the pixel lies on the resolved diamond boundary. Values above `1`
are outside that boundary and matter mostly for repeating gradients or for
filling the outer area.

`circle` keeps the x and y radii equal, so the diamond has symmetrical axes.

```css
diamond-gradient(circle, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.circleShape]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`ellipse` allows different x and y radii. It is the default because it adapts
better to rectangular boxes.

```css
diamond-gradient(ellipse 35% 70%, cyan, blue 60%, black)
```

<div class="diamond-preview-block" v-for="example in [examples.ellipseShape]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

The words `circle` and `ellipse` are inherited from radial syntax, but for a
diamond gradient they describe the radii used by the diamond distance field, not
a circular visual shape.

## Size

Size determines the resolved x/y radii used by the diamond field. It can be
keyword-based or explicit.

The extent keywords are:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`closest-side`</strong>
    <span>The diamond reaches the closest side from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`closest-corner`</strong>
    <span>The diamond reaches the closest corner from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-side`</strong>
    <span>The diamond reaches the farthest side from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-corner`</strong>
    <span>The diamond reaches the farthest corner from the center. This is the default.</span>
  </div>
</div>

`closest-side` is useful for local highlights that should stop quickly.

```css
diamond-gradient(closest-side, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.closestSide]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`closest-corner` depends on both the center and the rectangular paint area.

```css
diamond-gradient(closest-corner at 25% 75%, #ff74f6, #405de6)
```

<div class="diamond-preview-block" v-for="example in [examples.closestCorner]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`farthest-side` creates broader fields without forcing the diamond to reach the
farthest corner.

```css
diamond-gradient(farthest-side at left center, #ff74f6, #405de6)
```

<div class="diamond-preview-block" v-for="example in [examples.farthestSide]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Explicit sizes use concrete radii. A circle uses one length value; an ellipse
can use two length or percentage values. For an explicit diamond ellipse, the
first value is the x radius and the second value is the y radius:

```css
diamond-gradient(40% 80% at 35% 65% in oklab, red 0%, yellow 50%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.explicitSize]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

## Position

Position moves the diamond center. It always follows `at`.

Keyword positions use x/y keywords:

```css
diamond-gradient(at top left, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

gradiente normalizes keyword positions into x/y order. For example, `at top left`
serializes as `at left top`.

Value positions use two length-percentage values:

```css
diamond-gradient(at 25% 75%, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

The current parser keeps positions strict: keyword positions are keyword-only,
and value positions require two length-percentage tokens. Mixed CSS forms such
as `left 20px top 10px` are not part of this model yet.

## Stop List

The stop list defines what colors appear as the diamond expands away from the
center. A practical diamond gradient usually has at least two color stops.

If a color stop has no explicit position, gradiente resolves it from neighboring
stops. The first unresolved color stop becomes `0%`; the last unresolved color
stop becomes `100%`; unresolved stops between known positions are distributed
evenly.

```css
diamond-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Color hints are bare percentages between two color stops. They do not create a
new color stop. They move the perceived midpoint of the interpolation segment.

```css
diamond-gradient(red 0%, 35%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Double-position stops create hard diamond bands. A color written with two
positions is stored as two adjacent color stops with the same color, then
serialized back into the compact form when possible.

```css
diamond-gradient(red 0% 35%, blue 35% 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

## Interpolation

Interpolation controls the path between colors. It matters a lot for diamond
gradients because the sharp center and diagonal bands make muddy midpoints or
abrupt hue changes very visible.

The default interpolation space is `srgb`.

```css
diamond-gradient(in srgb, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Perceptual spaces such as `oklab` often produce smoother ramps.

```css
diamond-gradient(at 25% 75% in oklab, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Polar color spaces can use hue interpolation modes. gradiente supports
`shorter`, `longer`, `increasing`, and `decreasing`.

```css
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="diamond-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <DiamondPreviewContent :example="example" />
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

## Repeating Diamond Gradients

`repeating-diamond-gradient(...)` uses the same internal gradient kind as
`diamond-gradient(...)`. The prefix sets `isRepeating: true` in the config, while
the instance `type` remains `diamond-gradient`.

```css
repeating-diamond-gradient(at center, red 0%, blue 20%)
```

<div class="diamond-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Repeating diamond gradients are useful for hard-edged UI rings, scan effects,
generated pattern systems, isometric grids, warning fields, and abstract
backgrounds.

## Programmatic Construction

Most users should start with `parse()` because it gives you the same input shape
used by the DSL. When you need to build a gradient directly, use
`GradientDiamond`.

The constructor takes two parameters:

```txt
new GradientDiamond(stops, config?)
```

`stops` is required. `config` is optional and missing values are resolved from
class defaults.

```ts
import { GradientDiamond } from 'gradiente'

const gradient = new GradientDiamond(
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
    size: {
      kind: 'extent',
      value: 'closest-side',
    },
    position: {
      kind: 'values',
      x: {
        kind: 'percent',
        value: 35,
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

<div class="diamond-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

## Transforming A Diamond Gradient

Every renderer target receives the same source model. That is the main point of
the Core API: parse once, transform many times.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'diamond-gradient(40% 80% at 35% 65% in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="diamond-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

The transformer outputs have different shapes:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>A CSS background string. For diamond gradients it is a generated SVG data URL because CSS has no native `diamond-gradient()` function.</span>
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

const input = 'diamond-gradient(closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="diamond-preview-block" v-for="example in [examples.format]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Normalization is useful when users type gradients manually, when editor state is
saved, or when generated gradients need stable output for tests and snapshots.

## Practical Checklist

Use this order when building or validating a diamond gradient:

1. Choose whether the default `ellipse` metric is enough or whether `circle` should force equal x/y radii.
2. Choose a size: an extent keyword for adaptive behavior, explicit radii for controlled geometry.
3. Choose a position with `at` when the diamond center should move away from the default center.
4. Choose interpolation: `srgb` for simple parity, `oklab` or `oklch` for smoother ramps.
5. Add at least two color stops for useful visual output.
6. Add explicit stop positions when band widths must survive editing.
7. Use color hints when the transition midpoint needs to move.
8. Use double-position stops when you need hard diamond bands.
9. Use `format()` before storing user input.
10. Use `transformTo()` for renderer output instead of trying to hand-convert the string.

<style scoped>
.diamond-preview-block {
  margin: 18px 0 34px;
}

:deep(.diamond-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.diamond-render-set__header) {
  display: grid;
  gap: 8px;
  height: 118px;
  overflow: hidden;
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: radial-gradient(
    circle at 18% 12%,
    color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent),
    transparent 44%
  ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent),
      color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
    );
}

:deep(.diamond-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.diamond-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.diamond-render-set__syntax) {
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

:deep(.diamond-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.diamond-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.diamond-render-tile:last-child) {
  border-right: 0;
}

:deep(.diamond-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.diamond-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.diamond-render-tile__image) {
  object-fit: fill;
}

:deep(.diamond-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.diamond-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.diamond-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.diamond-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.diamond-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.diamond-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.diamond-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.diamond-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.diamond-render-tile) {
    border-right: 0;
  }

  :deep(.diamond-render-tile + .diamond-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
