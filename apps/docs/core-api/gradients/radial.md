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

type RadialPreviewExample = {
  id: string
  label: string
  input: string
  normalized: string
  cssBackground: string
  svgId: string
  svgDefs: string
  svgStops: string
  gradient: RadialGradientLike | null
  error: string
}

type SvgPreviewPayload = {
  id: string
  defs: string
}

type GradientLengthPercentage = {
  kind: 'length' | 'percent'
  value: number
  unit?: string
}

type GradientPosition =
  | {
      kind: 'keywords'
      x: 'left' | 'center' | 'right'
      y: 'top' | 'center' | 'bottom'
    }
  | {
      kind: 'values'
      x: GradientLengthPercentage
      y: GradientLengthPercentage
    }

type GradientRadialSize =
  | {
      kind: 'extent'
      value: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
    }
  | {
      kind: 'explicit'
      x: GradientLengthPercentage
      y?: GradientLengthPercentage
    }

type GradientRadialConfig = {
  shape: 'circle' | 'ellipse'
  size: GradientRadialSize
  position: GradientPosition
}

type RadialGradientLike = {
  getConfig(): GradientRadialConfig
}

function createSvgPreview(svgPayload: SvgPreviewPayload, id: string) {
  return {
    id,
    defs: svgPayload.defs.replaceAll(svgPayload.id, id),
  }
}

function extractSvgStops(svgDefs: string) {
  return svgDefs.match(/<stop\b[^>]*\/>/g)?.join('') ?? ''
}

function makeRadialExample(
  id: string,
  label: string,
  input: string,
): RadialPreviewExample {
  try {
    const gradient = parse(input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `radial-preview-${id}`
    const svgPreview = createSvgPreview(svg, svgId)

    return {
      id,
      label,
      input,
      normalized: gradient.toString(),
      cssBackground: transformTo('css', gradient),
      svgId: svgPreview.id,
      svgDefs: svgPreview.defs,
      svgStops: extractSvgStops(svgPreview.defs),
      gradient: gradient as RadialGradientLike,
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
      svgStops: '',
      gradient: null,
      error: value instanceof Error ? value.message : 'Failed to render preview.',
    }
  }
}

const examples = {
  hero: makeRadialExample(
    'hero',
    'Off-center OKLCH radial glow',
    'radial-gradient(circle at 35% 35% in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)',
  ),
  anatomy: makeRadialExample(
    'anatomy',
    'Shape, size, position, interpolation, color hint, and stops',
    'radial-gradient(circle closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultRadial: makeRadialExample(
    'default-radial',
    'Default radial gradient',
    'radial-gradient(red, blue)',
  ),
  circleShape: makeRadialExample(
    'circle-shape',
    'Circle shape',
    'radial-gradient(circle, red, blue)',
  ),
  ellipseShape: makeRadialExample(
    'ellipse-shape',
    'Explicit ellipse size',
    'radial-gradient(ellipse 35% 70%, cyan, blue 60%, black)',
  ),
  closestSide: makeRadialExample(
    'closest-side',
    'closest-side extent',
    'radial-gradient(circle closest-side, red, blue)',
  ),
  closestCorner: makeRadialExample(
    'closest-corner',
    'closest-corner extent',
    'radial-gradient(circle closest-corner at 25% 75%, #ff74f6, #405de6)',
  ),
  farthestSide: makeRadialExample(
    'farthest-side',
    'farthest-side extent',
    'radial-gradient(circle farthest-side at left center, #ff74f6, #405de6)',
  ),
  explicitCircleSize: makeRadialExample(
    'explicit-circle-size',
    'Explicit circle radius',
    'radial-gradient(circle 70px at center, red, blue)',
  ),
  keywordPosition: makeRadialExample(
    'keyword-position',
    'Keyword position',
    'radial-gradient(circle at top left, red, blue)',
  ),
  valuePosition: makeRadialExample(
    'value-position',
    'Percentage position',
    'radial-gradient(circle at 25% 75%, red, blue)',
  ),
  multiStop: makeRadialExample(
    'multi-stop',
    'Positioned color stops',
    'radial-gradient(circle, red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeRadialExample(
    'color-hint',
    'Color hint',
    'radial-gradient(circle, red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeRadialExample(
    'double-position',
    'Double-position stops',
    'radial-gradient(circle, red 0% 35%, blue 35% 100%)',
  ),
  srgbInterpolation: makeRadialExample(
    'srgb-interpolation',
    'sRGB interpolation',
    'radial-gradient(circle in srgb, red, blue)',
  ),
  oklabInterpolation: makeRadialExample(
    'oklab-interpolation',
    'OKLab interpolation',
    'radial-gradient(circle at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeRadialExample(
    'oklch-hue',
    'OKLCH longer hue interpolation',
    'radial-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeRadialExample(
    'repeating',
    'Repeating radial gradient',
    'repeating-radial-gradient(circle at center, red 0%, blue 20%)',
  ),
  constructor: makeRadialExample(
    'constructor',
    'Equivalent constructor output',
    'radial-gradient(circle closest-side at 35% 45% in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeRadialExample(
    'transform',
    'Renderer transformer input',
    'radial-gradient(ellipse 35% 70% at 35% 45% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeRadialExample(
    'format',
    'Formatted user input',
    'radial-gradient(circle closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)',
  ),
}

const exampleList = Object.values(examples)
const canvas2dRefs = new Map<string, HTMLCanvasElement>()
const webglSurfaceRefs = new Map<string, HTMLElement>()
const svgSurfaceRefs = new Map<string, SVGSVGElement>()
const webglSnapshots = ref<Record<string, string>>({})
const webglErrors = ref<Record<string, string>>({})
const svgMeasuredDefs = ref<Record<string, string>>({})
const svgViewBoxes = ref<Record<string, string>>({})
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

function getSvgDefs(example: RadialPreviewExample) {
  return getOwnRecordValue(svgMeasuredDefs.value, example.id) || example.svgDefs
}

function getSvgViewBox(id: string) {
  return getOwnRecordValue(svgViewBoxes.value, id) || '0 0 320 320'
}

function formatSvgNumber(value: number, precision = 3) {
  return `${Number(value.toFixed(precision))}`
}

function resolveLengthPercentage(
  value: GradientLengthPercentage,
  reference: number,
) {
  if (value.kind === 'percent') {
    return (value.value / 100) * reference
  }

  return value.value
}

function resolvePosition(
  position: GradientPosition,
  width: number,
  height: number,
) {
  if (position.kind === 'values') {
    return {
      x: resolveLengthPercentage(position.x, width),
      y: resolveLengthPercentage(position.y, height),
    }
  }

  return {
    x: position.x === 'left'
      ? 0
      : position.x === 'right'
        ? width
        : width / 2,
    y: position.y === 'top'
      ? 0
      : position.y === 'bottom'
        ? height
        : height / 2,
  }
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function scaleEllipseToCorner(
  radiusX: number,
  radiusY: number,
  dx: number,
  dy: number,
) {
  const scale = Math.sqrt(
    (dx * dx) / Math.max(radiusX * radiusX, 0.0001) +
      (dy * dy) / Math.max(radiusY * radiusY, 0.0001),
  )

  return {
    x: Math.max(radiusX * scale, 0.0001),
    y: Math.max(radiusY * scale, 0.0001),
  }
}

function resolveRadii(
  size: GradientRadialSize,
  shape: 'circle' | 'ellipse',
  center: { x: number; y: number },
  width: number,
  height: number,
) {
  if (size.kind === 'explicit') {
    const radiusX = resolveLengthPercentage(size.x, width)
    const radiusY = size.y
      ? resolveLengthPercentage(size.y, height)
      : radiusX

    return {
      x: Math.max(radiusX, 0.0001),
      y: Math.max(shape === 'circle' ? radiusX : radiusY, 0.0001),
    }
  }

  const left = center.x
  const right = width - center.x
  const top = center.y
  const bottom = height - center.y

  if (shape === 'circle') {
    const cornerDistances = [
      distance(center.x, center.y, 0, 0),
      distance(center.x, center.y, width, 0),
      distance(center.x, center.y, 0, height),
      distance(center.x, center.y, width, height),
    ]

    if (size.value === 'closest-side') {
      const radius = Math.max(Math.min(left, right, top, bottom), 0.0001)
      return { x: radius, y: radius }
    }

    if (size.value === 'farthest-side') {
      const radius = Math.max(Math.max(left, right, top, bottom), 0.0001)
      return { x: radius, y: radius }
    }

    if (size.value === 'closest-corner') {
      const radius = Math.max(Math.min(...cornerDistances), 0.0001)
      return { x: radius, y: radius }
    }

    const radius = Math.max(Math.max(...cornerDistances), 0.0001)
    return { x: radius, y: radius }
  }

  const closestSideRadiusX = Math.min(left, right)
  const closestSideRadiusY = Math.min(top, bottom)
  const farthestSideRadiusX = Math.max(left, right)
  const farthestSideRadiusY = Math.max(top, bottom)

  if (size.value === 'closest-side') {
    return {
      x: Math.max(closestSideRadiusX, 0.0001),
      y: Math.max(closestSideRadiusY, 0.0001),
    }
  }

  if (size.value === 'farthest-side') {
    return {
      x: Math.max(farthestSideRadiusX, 0.0001),
      y: Math.max(farthestSideRadiusY, 0.0001),
    }
  }

  const corners = [
    { dx: -center.x, dy: -center.y },
    { dx: width - center.x, dy: -center.y },
    { dx: -center.x, dy: height - center.y },
    { dx: width - center.x, dy: height - center.y },
  ]

  if (size.value === 'closest-corner') {
    return corners
      .map((corner) =>
        scaleEllipseToCorner(
          closestSideRadiusX,
          closestSideRadiusY,
          corner.dx,
          corner.dy,
        ),
      )
      .reduce((closest, current) =>
        current.x * current.y < closest.x * closest.y ? current : closest,
      )
  }

  return corners
    .map((corner) =>
      scaleEllipseToCorner(
        farthestSideRadiusX,
        farthestSideRadiusY,
        corner.dx,
        corner.dy,
      ),
    )
    .reduce((farthest, current) =>
      current.x * current.y > farthest.x * farthest.y ? current : farthest,
    )
}

function createMeasuredSvgDefs(
  example: RadialPreviewExample,
  width: number,
  height: number,
) {
  if (!example.gradient || !example.svgStops) {
    return example.svgDefs
  }

  const config = example.gradient.getConfig()
  const center = resolvePosition(config.position, width, height)
  const radii = resolveRadii(config.size, config.shape, center, width, height)
  const radius = Math.max(radii.x, radii.y)
  const scaleX = radii.x / radius
  const scaleY = radii.y / radius
  const transform = config.shape === 'ellipse'
    ? [
        ' gradientTransform="',
        `translate(${formatSvgNumber(center.x)} ${formatSvgNumber(center.y)}) `,
        `scale(${formatSvgNumber(scaleX)} ${formatSvgNumber(scaleY)}) `,
        `translate(${formatSvgNumber(-center.x)} ${formatSvgNumber(-center.y)})`,
        '"',
      ].join('')
    : ''

  return [
    '<defs>',
    `<radialGradient id="${example.svgId}" gradientUnits="userSpaceOnUse" cx="${formatSvgNumber(center.x)}" cy="${formatSvgNumber(center.y)}" r="${formatSvgNumber(radius)}"${transform}>`,
    example.svgStops,
    '</radialGradient>',
    '</defs>',
  ].join('')
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
  drawSvg(id)
}

function drawSvg(id: string) {
  const example = getExample(id)
  const svg = svgSurfaceRefs.get(id)

  if (!example || example.error || !svg) {
    return
  }

  const rect = svg.getBoundingClientRect()
  const width = Math.max(1, rect.width || 320)
  const height = Math.max(1, rect.height || width)
  const viewBox = `0 0 ${formatSvgNumber(width)} ${formatSvgNumber(height)}`
  const defs = createMeasuredSvgDefs(example, width, height)

  if (getOwnRecordValue(svgMeasuredDefs.value, id) !== defs) {
    svgMeasuredDefs.value = {
      ...svgMeasuredDefs.value,
      [id]: defs,
    }
  }

  if (getOwnRecordValue(svgViewBoxes.value, id) !== viewBox) {
    svgViewBoxes.value = {
      ...svgViewBoxes.value,
      [id]: viewBox,
    }
  }
}

function setWebglSurfaceRef(id: string, element: unknown) {
  const surface = element instanceof HTMLElement
    ? element
    : null

  if (!surface) {
    webglSurfaceRefs.delete(id)
    return
  }

  surface.dataset.radialPreviewId = id
  webglSurfaceRefs.set(id, surface)

  if (isMounted) {
    void nextTick(() => drawWebgl(id))
  }
}

function setSvgRef(id: string, element: unknown) {
  const svg = element instanceof SVGSVGElement
    ? element
    : null

  if (!svg) {
    svgSurfaceRefs.delete(id)
    return
  }

  const previous = svgSurfaceRefs.get(id)

  svg.dataset.radialPreviewId = id
  svgSurfaceRefs.set(id, svg)

  if (isMounted && previous !== svg) {
    resizeObserver?.observe(svg)
    void nextTick(() => drawSvg(id))
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

  canvas.dataset.radialPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const RadialPreviewContent = defineComponent({
  name: 'RadialPreviewContent',
  props: {
    example: {
      type: Object as PropType<RadialPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'radial-render-tile__caption' }, [
        h('span', { class: 'radial-render-tile__caption-text' }, label),
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

    return () => h('figure', { ref: root, class: 'radial-render-set' }, [
      h('figcaption', { class: 'radial-render-set__header' }, [
        h('span', { class: 'radial-render-set__eyebrow' }, 'Radial gradient example'),
        h('strong', { class: 'radial-render-set__label' }, props.example.label),
        h('code', { class: 'radial-render-set__syntax' }, props.example.normalized),
      ]),
      props.example.error
        ? h('p', { class: 'radial-render-set__error' }, props.example.error)
        : !isVisible.value
          ? h(
            'div',
            {
              class: 'radial-render-lazy',
              'data-gradiente-lazy-preview': props.example.id,
            },
            'Preview loads when it reaches the viewport.',
          )
        : h('div', { class: 'radial-render-grid' }, [
          h('figure', { class: 'radial-render-tile' }, [
            h('div', {
              class: 'radial-render-tile__surface',
              style: { backgroundImage: props.example.cssBackground },
              'data-gradiente-renderer': 'css',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('CSS'),
          ]),
          h('figure', { class: 'radial-render-tile' }, [
            h('canvas', {
              ref: (element: unknown) =>
                setCanvasRef(props.example.id, 'canvas-2d', element),
              class: 'radial-render-tile__surface',
              'data-gradiente-renderer': 'canvas-2d',
              'data-gradiente-input': props.example.input,
            }),
            renderCaption('Canvas 2D'),
          ]),
          h('figure', { class: 'radial-render-tile' }, [
            getWebglSnapshot(props.example.id)
              ? h('img', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'radial-render-tile__surface radial-render-tile__image',
                src: getWebglSnapshot(props.example.id),
                alt: `${props.example.label} rendered with Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'radial-render-tile__surface radial-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Rendering WebGL...'),
            renderCaption('Canvas WebGL snapshot'),
            getWebglError(props.example.id)
              ? h(
                'p',
                { class: 'radial-render-set__error' },
                getWebglError(props.example.id),
              )
              : null,
          ]),
          h('figure', { class: 'radial-render-tile' }, [
            h('svg', {
              ref: (element: unknown) =>
                setSvgRef(props.example.id, element),
              class: 'radial-render-tile__surface',
              viewBox: getSvgViewBox(props.example.id),
              preserveAspectRatio: 'none',
              role: 'img',
              'aria-label': `${props.example.label} rendered with SVG`,
              'data-gradiente-renderer': 'svg',
              'data-gradiente-input': props.example.input,
              innerHTML: [
                getSvgDefs(props.example),
                `<rect width="100%" height="100%" fill="url(#${props.example.svgId})"></rect>`,
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
        const target = entry.target as HTMLCanvasElement | SVGSVGElement
        const id = target.dataset.radialPreviewId

        if (id && target instanceof HTMLCanvasElement) {
          drawCanvas2d(id)
        }

        if (id && target instanceof SVGSVGElement) {
          drawSvg(id)
        }
      }
    })

    for (const [id, canvas] of canvas2dRefs.entries()) {
      canvas.dataset.radialPreviewId = id
      resizeObserver.observe(canvas)
    }
  }
})

onBeforeUnmount(() => {
  isMounted = false
  resizeObserver?.disconnect()
  canvas2dRefs.clear()
  webglSurfaceRefs.clear()
  svgSurfaceRefs.clear()
  svgMeasuredDefs.value = {}
  svgViewBoxes.value = {}
  pendingWebglSnapshots.clear()
})
</script>

# Radial Gradients

A radial gradient is a color ramp that expands from a center point. Instead of
projecting pixels onto a straight line, the renderer measures each pixel's
distance from the radial center, normalizes that distance through a circle or an
ellipse, and samples the ordered stops at the matching radius.

In gradiente, a radial gradient is a typed model with shape, size, position,
interpolation settings, stops, optional color hints, and a repeating flag. The
same model can be transformed into CSS, Canvas 2D, Canvas WebGL, SVG, or a custom
transformer target.

```css
radial-gradient(circle at 35% 35% in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)
```

<div class="radial-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Every preview block on this page renders the same source gradient in four
targets at once: CSS, Canvas 2D, Canvas WebGL, and SVG. The WebGL column is a
snapshot generated through `transformTo('canvas-webgl', gradient)` so the page
does not keep many live WebGL contexts open at the same time. Preview rendering
is lazy-loaded as each example approaches the viewport.

## What A Radial Gradient Contains

The radial gradient model has five conceptual parts:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Function name</strong>
    <span>`radial-gradient(...)` or `repeating-radial-gradient(...)`. The public instance type remains `radial-gradient`; repeating is stored as config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Shape</strong>
    <span>`circle` or `ellipse`. The default is `ellipse`.</span>
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
    <span>Color stops, optional percentage positions, optional double positions, and color hints along the radius.</span>
  </div>
</div>

The model that gradiente stores is renderer-agnostic:

```ts
type GradientRadialConfig = {
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

Stop positions are stored as normalized numbers where `0` means the center and
`1` means the resolved outer radius. The same shared stop model is used:

```ts
type GradientRadialStop =
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

For `radial-gradient`, gradiente handles the work that usually gets scattered
across parsers, UI code, serializers, and renderers:

- Parses CSS-like radial strings into a `GradientRadial` instance.
- Stores shape, size, center position, interpolation, stops, and repeating state.
- Resolves default values from one constructor location.
- Resolves missing stop positions.
- Preserves color hints as first-class stop data.
- Compacts double-position stops during serialization.
- Normalizes repeated radial gradients through the same model.
- Resolves concrete radii per renderer when a target area is known.
- Transforms the same model to CSS, Canvas 2D, Canvas WebGL, and SVG.

## Anatomy

The full syntax has one optional configuration item followed by a required stop
list:

```css
radial-gradient(
  [shape] [size] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

The first comma-separated item is treated as configuration only when it contains
radial config tokens. Everything after the first comma belongs to the stop list.

```css
radial-gradient(circle closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

That example contains:

- `circle`: the normalized distance field is circular.
- `closest-side`: the outer radius touches the closest side of the paint box.
- `at 30% 35%`: the center is placed near the upper-left area.
- `in oklch`: colors are interpolated in OKLCH.
- `red 0%`: the first color stop is placed at the center.
- `35%`: a color hint that moves the midpoint of the red-to-blue transition.
- `blue 100%`: the final color stop is placed at the resolved outer radius.

## Defaults

If radial config is omitted, gradiente uses the CSS-like default radial shape:

```css
radial-gradient(red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.defaultRadial]" :key="example.id">
  <RadialPreviewContent :example="example" />
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
`radial-gradient(ellipse farthest-corner at center in srgb, red, blue)` can
serialize to the compact `radial-gradient(red, blue)`.

## Shape

Shape controls the distance field used by the renderer.

`circle` keeps the x and y radii equal. It is useful for glows, spotlights,
focus rings, circular masks, buttons, badges, and centered effects.

```css
radial-gradient(circle, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.circleShape]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`ellipse` allows different x and y radii. It is the default shape because it
naturally fills rectangular boxes.

```css
radial-gradient(ellipse 35% 70%, cyan, blue 60%, black)
```

<div class="radial-preview-block" v-for="example in [examples.ellipseShape]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

When the shape is omitted, gradiente stores `ellipse`. When the shape is
explicitly `circle`, the serializer keeps it because it changes the geometry.

## Size

Size determines the resolved radius or radii. It can be keyword-based or
explicit.

The extent keywords are:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`closest-side`</strong>
    <span>The gradient reaches the closest side from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`closest-corner`</strong>
    <span>The gradient reaches the closest corner from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-side`</strong>
    <span>The gradient reaches the farthest side from the center.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-corner`</strong>
    <span>The gradient reaches the farthest corner from the center. This is the default.</span>
  </div>
</div>

`closest-side` is compact and often useful for controlled local highlights.

```css
radial-gradient(circle closest-side, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.closestSide]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`closest-corner` depends on both the center and the rectangular paint area.

```css
radial-gradient(circle closest-corner at 25% 75%, #ff74f6, #405de6)
```

<div class="radial-preview-block" v-for="example in [examples.closestCorner]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`farthest-side` can create broad fields that still stop before the farthest
corner.

```css
radial-gradient(circle farthest-side at left center, #ff74f6, #405de6)
```

<div class="radial-preview-block" v-for="example in [examples.farthestSide]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Explicit sizes use concrete radii. A circle uses one length value; an ellipse
can use two length or percentage values.

```css
radial-gradient(circle 70px at center, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.explicitCircleSize]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

For an explicit ellipse, the first value is the x radius and the second value is
the y radius:

```css
radial-gradient(35% 70%, cyan 0%, blue 60%, black 100%)
```

## Position

Position moves the radial center. It always follows `at`.

Keyword positions use x/y keywords:

```css
radial-gradient(circle at top left, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

gradiente normalizes keyword positions into x/y order. For example, `at top left`
serializes as `at left top`.

Value positions use two length-percentage values:

```css
radial-gradient(circle at 25% 75%, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

The current radial parser intentionally keeps positions strict: keyword
positions are keyword-only, and value positions require two length-percentage
tokens. Mixed CSS forms such as `left 20px top 10px` are not part of this model
yet.

## Stop List

The stop list defines what colors appear along the radius. A practical radial
gradient usually has at least two color stops.

If a color stop has no explicit position, gradiente resolves it from neighboring
stops. The first unresolved color stop becomes `0%`; the last unresolved color
stop becomes `100%`; unresolved stops between known positions are distributed
evenly.

```css
radial-gradient(circle, red 0%, yellow 40%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Color hints are bare percentages between two color stops. They do not create a
new color stop. They move the perceived midpoint of the interpolation segment.

```css
radial-gradient(circle, red 0%, 35%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Double-position stops create hard rings. A color written with two positions is
stored as two adjacent color stops with the same color, then serialized back into
the compact form when possible.

```css
radial-gradient(circle, red 0% 35%, blue 35% 100%)
```

<div class="radial-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

## Interpolation

Interpolation controls the path between colors. This matters for radial
gradients because a small center area can amplify interpolation artifacts: a
muddy midpoint or a hard transition can become very visible.

The default interpolation space is `srgb`.

```css
radial-gradient(circle in srgb, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Perceptual spaces such as `oklab` often produce smoother ramps.

```css
radial-gradient(circle at 25% 75% in oklab, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Polar color spaces can use hue interpolation modes. gradiente supports
`shorter`, `longer`, `increasing`, and `decreasing`.

```css
radial-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="radial-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <RadialPreviewContent :example="example" />
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

## Repeating Radial Gradients

`repeating-radial-gradient(...)` uses the same internal gradient kind as
`radial-gradient(...)`. The prefix sets `isRepeating: true` in the config, while
the instance `type` remains `radial-gradient`.

```css
repeating-radial-gradient(circle at center, red 0%, blue 20%)
```

<div class="radial-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Repeating radial gradients are useful for ripples, targets, rings, scan effects,
halftone-like surfaces, and generated pattern systems.

## Programmatic Construction

Most users should start with `parse()` because it gives you the same input shape
people already know from CSS. When you need to build a gradient directly, use
`GradientRadial`.

The constructor takes two parameters:

```txt
new GradientRadial(stops, config?)
```

`stops` is required. `config` is optional and missing values are resolved from
class defaults.

```ts
import { GradientRadial } from 'gradiente'

const gradient = new GradientRadial(
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
    shape: 'circle',
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

<div class="radial-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

## Transforming A Radial Gradient

Every renderer target receives the same source model. That is the main point of
the Core API: parse once, transform many times.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'radial-gradient(ellipse 35% 70% at 35% 45% in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="radial-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <RadialPreviewContent :example="example" />
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

const input = 'radial-gradient(circle closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="radial-preview-block" v-for="example in [examples.format]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Normalization is useful when users type gradients manually, when editor state is
saved, or when generated gradients need stable output for tests and snapshots.

## Practical Checklist

Use this order when building or validating a radial gradient:

1. Choose a shape: `circle` for equal radii, `ellipse` for rectangular fields.
2. Choose a size: an extent keyword for CSS-like behavior, explicit radii for controlled geometry.
3. Choose a position with `at` when the center should move away from the default center.
4. Choose interpolation: `srgb` for CSS parity, `oklab` or `oklch` for smoother ramps.
5. Add at least two color stops for useful visual output.
6. Add explicit stop positions when rings or glow sizes must survive editing.
7. Use color hints when the transition midpoint needs to move.
8. Use double-position stops when you need hard rings.
9. Use `format()` before storing user input.
10. Use `transformTo()` for renderer output instead of hand-converting the string.

<style scoped>
.radial-preview-block {
  margin: 18px 0 34px;
}

:deep(.radial-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.radial-render-set__header) {
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

:deep(.radial-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.radial-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.radial-render-set__syntax) {
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

:deep(.radial-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.radial-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.radial-render-tile:last-child) {
  border-right: 0;
}

:deep(.radial-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.radial-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.radial-render-tile__image) {
  object-fit: fill;
}

:deep(.radial-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.radial-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.radial-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.radial-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.radial-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.radial-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.radial-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.radial-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.radial-render-tile) {
    border-right: 0;
  }

  :deep(.radial-render-tile + .radial-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
