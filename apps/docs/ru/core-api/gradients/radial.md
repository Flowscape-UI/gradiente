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
      error: value instanceof Error ? value.message : 'Не удалось отрисовать превью.',
    }
  }
}

const examples = {
  hero: makeRadialExample(
    'hero',
    'Смещенное OKLCH-свечение',
    'radial-gradient(circle at 35% 35% in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)',
  ),
  anatomy: makeRadialExample(
    'anatomy',
    'Форма, размер, позиция, интерполяция, color hint и stops',
    'radial-gradient(circle closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultRadial: makeRadialExample(
    'default-radial',
    'Радиальный градиент по умолчанию',
    'radial-gradient(red, blue)',
  ),
  circleShape: makeRadialExample(
    'circle-shape',
    'Форма circle',
    'radial-gradient(circle, red, blue)',
  ),
  ellipseShape: makeRadialExample(
    'ellipse-shape',
    'Явный размер ellipse',
    'radial-gradient(ellipse 35% 70%, cyan, blue 60%, black)',
  ),
  closestSide: makeRadialExample(
    'closest-side',
    'Размер closest-side',
    'radial-gradient(circle closest-side, red, blue)',
  ),
  closestCorner: makeRadialExample(
    'closest-corner',
    'Размер closest-corner',
    'radial-gradient(circle closest-corner at 25% 75%, #ff74f6, #405de6)',
  ),
  farthestSide: makeRadialExample(
    'farthest-side',
    'Размер farthest-side',
    'radial-gradient(circle farthest-side at left center, #ff74f6, #405de6)',
  ),
  explicitCircleSize: makeRadialExample(
    'explicit-circle-size',
    'Явный радиус circle',
    'radial-gradient(circle 70px at center, red, blue)',
  ),
  keywordPosition: makeRadialExample(
    'keyword-position',
    'Keyword-позиция',
    'radial-gradient(circle at top left, red, blue)',
  ),
  valuePosition: makeRadialExample(
    'value-position',
    'Процентная позиция',
    'radial-gradient(circle at 25% 75%, red, blue)',
  ),
  multiStop: makeRadialExample(
    'multi-stop',
    'Позиционированные color stops',
    'radial-gradient(circle, red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeRadialExample(
    'color-hint',
    'Color hint',
    'radial-gradient(circle, red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeRadialExample(
    'double-position',
    'Жесткие кольца через double-position stops',
    'radial-gradient(circle, red 0% 35%, blue 35% 100%)',
  ),
  srgbInterpolation: makeRadialExample(
    'srgb-interpolation',
    'sRGB-интерполяция',
    'radial-gradient(circle in srgb, red, blue)',
  ),
  oklabInterpolation: makeRadialExample(
    'oklab-interpolation',
    'OKLab-интерполяция',
    'radial-gradient(circle at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeRadialExample(
    'oklch-hue',
    'OKLCH-интерполяция longer hue',
    'radial-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeRadialExample(
    'repeating',
    'Повторяющийся радиальный градиент',
    'repeating-radial-gradient(circle at center, red 0%, blue 20%)',
  ),
  constructor: makeRadialExample(
    'constructor',
    'Эквивалентный вывод конструктора',
    'radial-gradient(circle closest-side at 35% 45% in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeRadialExample(
    'transform',
    'Вход для renderer transformer',
    'radial-gradient(ellipse 35% 70% at 35% 45% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeRadialExample(
    'format',
    'Форматированный пользовательский ввод',
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
      throw new Error('WebGL не поддерживается.')
    }

    const paint = transformTo('canvas-webgl', example.input)

    paint.draw(canvas, width, height)

    gl.finish()

    const snapshot = canvas.toDataURL('image/png')

    if (!snapshot || snapshot === 'data:,') {
      throw new Error('Не удалось получить WebGL snapshot.')
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
      [id]: value instanceof Error ? value.message : 'Не удалось отрисовать WebGL превью.',
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
        h('span', { class: 'radial-render-set__eyebrow' }, 'Пример радиального градиента'),
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
            'Превью загрузится, когда блок приблизится к viewport.',
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
                alt: `${props.example.label} отрисован через Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'radial-render-tile__surface radial-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Рендеринг WebGL...'),
            renderCaption('Canvas WebGL снимок'),
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
              'aria-label': `${props.example.label} отрисован через SVG`,
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

# Радиальные градиенты

Радиальный градиент - это цветовой переход, который раскрывается из центральной
точки. Вместо того чтобы проецировать пиксели на прямую линию, рендерер измеряет
расстояние каждого пикселя от центра, нормализует это расстояние через круг или
эллипс и берет цвет из упорядоченного stop-листа на соответствующем радиусе.

В gradiente радиальный градиент - это типизированная модель с формой, размером,
позицией, настройками интерполяции, stops, опциональными color hints и флагом
повтора. Одну и ту же модель можно преобразовать в CSS, Canvas 2D,
Canvas WebGL, SVG или в кастомный target трансформера.

```css
radial-gradient(circle at 35% 35% in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)
```

<div class="radial-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Каждый preview-блок на этой странице отрисовывает один и тот же исходный
градиент сразу в четырех targets: CSS, Canvas 2D, Canvas WebGL и SVG. Колонка
WebGL - это снимок, созданный через `transformTo('canvas-webgl', gradient)`,
чтобы страница не держала слишком много активных WebGL-контекстов одновременно.
Превью грузятся лениво, когда пример приближается к области просмотра.

<GradientFrameworkTabs
  id="radial-framework-tabs-ru"
  eyebrow="Интеграция gradiente"
  title="Использование радиального градиента во фреймворке"
  description="Одна и та же модель gradiente может быть подключена в React, Vanilla JS, Vue или Svelte. Каждый пример парсит исходную строку, преобразует ее через transformTo('css') и применяет результат как настоящий background image."
  gradient="radial-gradient(circle at 35% 35% in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  gradient-kind="радиальный градиент"
  preview-aria-label="Превью радиального градиента"
  tabs-aria-label="Примеры для фреймворков"
  code-label-suffix="пример кода"
  component-name="RadialGradientPreview"
/>

## Из чего состоит радиальный градиент

У модели радиального градиента есть пять смысловых частей:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Имя функции</strong>
    <span>`radial-gradient(...)` или `repeating-radial-gradient(...)`. Публичный тип экземпляра остается `radial-gradient`; повтор хранится в config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Форма</strong>
    <span>`circle` или `ellipse`. Значение по умолчанию - `ellipse`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Размер</strong>
    <span>Extent keyword вроде `closest-side`, `closest-corner`, `farthest-side`, `farthest-corner` или явные радиусы в length/percentage.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Позиция</strong>
    <span>Центральная точка после `at`: например `at left top`, `at center` или `at 25% 75%`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Stop-лист</strong>
    <span>Color stops, опциональные процентные позиции, опциональные double positions и color hints вдоль радиуса.</span>
  </div>
</div>

Модель, которую хранит gradiente, не привязана к конкретному рендереру:

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

Позиции stops хранятся как нормализованные числа: `0` означает центр, а `1`
означает вычисленный внешний радиус. Используется та же общая stop-модель:

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

Значения цветов остаются строками, чтобы сохранить авторский ввод. Рендереры
конвертируют и сэмплируют их только тогда, когда им нужны конкретные цвета.

## Что делает gradiente

Для `radial-gradient` gradiente берет на себя работу, которая обычно
распределяется между парсерами, UI-кодом, сериализаторами и рендерерами:

- Парсит CSS-like строки радиальных градиентов в экземпляр `GradientRadial`.
- Хранит форму, размер, позицию центра, интерполяцию, stops и состояние повтора.
- Подставляет дефолтные значения из одного места в конструкторе.
- Вычисляет отсутствующие позиции stops.
- Сохраняет color hints как полноценные stop-данные.
- Компактно сериализует double-position stops.
- Нормализует повторяющиеся радиальные градиенты через ту же модель.
- Вычисляет конкретные радиусы для рендерера, когда известна область отрисовки.
- Преобразует одну и ту же модель в CSS, Canvas 2D, Canvas WebGL и SVG.

## Анатомия

Полный синтаксис состоит из одного опционального элемента конфигурации и
обязательного stop-листа:

```css
radial-gradient(
  [shape] [size] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

Первый элемент до запятой считается конфигурацией только тогда, когда в нем есть
токены радиальной конфигурации. Все после первой запятой относится к stop-листу.

```css
radial-gradient(circle closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

В этом примере есть:

- `circle`: нормализованное поле расстояния имеет форму круга.
- `closest-side`: внешний радиус касается ближайшей стороны области отрисовки.
- `at 30% 35%`: центр смещен ближе к верхней левой области.
- `in oklch`: цвета интерполируются в OKLCH.
- `red 0%`: первый color stop расположен в центре.
- `35%`: color hint, который двигает середину перехода от red к blue.
- `blue 100%`: последний color stop расположен на вычисленном внешнем радиусе.

## Дефолты

Если радиальная конфигурация не указана, gradiente использует CSS-like дефолт:

```css
radial-gradient(red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.defaultRadial]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Дефолты класса:

```txt
shape: "ellipse"
size.kind: "extent"
size.value: "farthest-corner"
position: center center
interpolation.colorSpace: "srgb"
isRepeating: false
```

Дефолтные значения не выводятся в `toString()`. Поэтому
`radial-gradient(ellipse farthest-corner at center in srgb, red, blue)` может
сериализоваться в компактный `radial-gradient(red, blue)`.

## Форма

Форма управляет полем расстояния, которое использует рендерер.

`circle` сохраняет одинаковые радиусы по x и y. Это удобно для свечений,
spotlight-эффектов, focus rings, круглых масок, кнопок, бейджей и центрированных
эффектов.

```css
radial-gradient(circle, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.circleShape]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`ellipse` позволяет использовать разные радиусы по x и y. Это дефолтная форма,
потому что она естественно заполняет прямоугольные области.

```css
radial-gradient(ellipse 35% 70%, cyan, blue 60%, black)
```

<div class="radial-preview-block" v-for="example in [examples.ellipseShape]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Когда форма не указана, gradiente хранит `ellipse`. Когда форма явно равна
`circle`, сериализатор сохраняет ее, потому что она меняет геометрию.

## Размер

Размер определяет вычисленный радиус или радиусы. Он может быть keyword-based
или явным.

Extent keywords:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`closest-side`</strong>
    <span>Градиент доходит до ближайшей стороны от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`closest-corner`</strong>
    <span>Градиент доходит до ближайшего угла от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-side`</strong>
    <span>Градиент доходит до самой дальней стороны от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-corner`</strong>
    <span>Градиент доходит до самого дальнего угла от центра. Это дефолт.</span>
  </div>
</div>

`closest-side` дает компактный результат и часто полезен для контролируемых
локальных подсветок.

```css
radial-gradient(circle closest-side, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.closestSide]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`closest-corner` зависит и от центра, и от прямоугольной области отрисовки.

```css
radial-gradient(circle closest-corner at 25% 75%, #ff74f6, #405de6)
```

<div class="radial-preview-block" v-for="example in [examples.closestCorner]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

`farthest-side` может создавать широкие поля, которые при этом останавливаются
раньше самого дальнего угла.

```css
radial-gradient(circle farthest-side at left center, #ff74f6, #405de6)
```

<div class="radial-preview-block" v-for="example in [examples.farthestSide]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Явные размеры используют конкретные радиусы. Для круга нужен один length; для
эллипса можно использовать два length или percentage значения.

```css
radial-gradient(circle 70px at center, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.explicitCircleSize]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Для явного эллипса первое значение - это радиус по x, второе - радиус по y:

```css
radial-gradient(35% 70%, cyan 0%, blue 60%, black 100%)
```

## Позиция

Позиция двигает центр радиального градиента. Она всегда указывается после `at`.

Keyword-позиции используют x/y keywords:

```css
radial-gradient(circle at top left, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

gradiente нормализует keyword-позиции в порядок x/y. Например, `at top left`
сериализуется как `at left top`.

Value-позиции используют два length-percentage значения:

```css
radial-gradient(circle at 25% 75%, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Текущий radial parser намеренно держит позиции строгими: keyword-позиции
состоят только из keywords, а value-позиции требуют два length-percentage
токена. Смешанные CSS-формы вроде `left 20px top 10px` пока не входят в эту
модель.

## Stop-лист

Stop-лист определяет, какие цвета появляются вдоль радиуса. На практике
радиальному градиенту обычно нужны минимум два color stops.

Если у color stop нет явной позиции, gradiente вычисляет ее по соседним stops.
Первый неразрешенный color stop становится `0%`, последний становится `100%`, а
неразрешенные stops между известными позициями распределяются равномерно.

```css
radial-gradient(circle, red 0%, yellow 40%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Color hints - это bare percentages между двумя color stops. Они не создают новый
color stop, а двигают воспринимаемую середину сегмента интерполяции.

```css
radial-gradient(circle, red 0%, 35%, blue 100%)
```

<div class="radial-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Double-position stops создают жесткие кольца. Цвет, записанный с двумя
позициями, хранится как два соседних color stops с одним и тем же цветом, а
потом по возможности сериализуется обратно в компактную форму.

```css
radial-gradient(circle, red 0% 35%, blue 35% 100%)
```

<div class="radial-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

## Интерполяция

Интерполяция управляет путем между цветами. Для радиальных градиентов это
особенно важно: маленькая область центра может усиливать артефакты
интерполяции, и грязная середина или резкий переход становятся очень заметными.

Дефолтное пространство интерполяции - `srgb`.

```css
radial-gradient(circle in srgb, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Перцепционные пространства вроде `oklab` часто дают более плавные переходы.

```css
radial-gradient(circle at 25% 75% in oklab, red, blue)
```

<div class="radial-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Полярные цветовые пространства могут использовать режимы hue-интерполяции.
gradiente поддерживает `shorter`, `longer`, `increasing` и `decreasing`.

```css
radial-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="radial-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Поддерживаемые color spaces:

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

## Повторяющиеся радиальные градиенты

`repeating-radial-gradient(...)` использует тот же внутренний вид градиента, что
и `radial-gradient(...)`. Префикс выставляет `isRepeating: true` в config, а
`type` экземпляра остается `radial-gradient`.

```css
repeating-radial-gradient(circle at center, red 0%, blue 20%)
```

<div class="radial-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Повторяющиеся радиальные градиенты полезны для ripples, targets, колец,
scan-эффектов, halftone-like поверхностей и генерируемых систем паттернов.

## Программное создание

Большинству пользователей стоит начинать с `parse()`, потому что он принимает
формат, который люди уже знают по CSS. Когда градиент нужно собрать напрямую,
используйте `GradientRadial`.

Конструктор принимает два параметра:

```txt
new GradientRadial(stops, config?)
```

`stops` обязателен. `config` опционален, а пропущенные значения берутся из
дефолтов класса.

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

## Трансформация радиального градиента

Каждый renderer target получает одну и ту же исходную модель. В этом главный
смысл Core API: один раз распарсить, много раз трансформировать.

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

У outputs трансформеров разные формы:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>Строка CSS background.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-2d`</strong>
    <span>Paint-объект с `draw(ctx, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-webgl`</strong>
    <span>Paint-объект с `draw(canvas, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`svg`</strong>
    <span>SVG paint server payload с `defs`, `url` и сериализованными SVG-данными.</span>
  </div>
</div>

## Нормализация

Используйте `format()` перед сохранением пользовательского ввода. Он парсит
строку во внутреннюю модель и сериализует ее обратно в каноническую строку
gradiente.

```ts
import { format } from 'gradiente'

const input = 'radial-gradient(circle closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="radial-preview-block" v-for="example in [examples.format]" :key="example.id">
  <RadialPreviewContent :example="example" />
</div>

Нормализация полезна, когда пользователи вводят градиенты вручную, когда
сохраняется состояние редактора или когда сгенерированным градиентам нужен
стабильный output для тестов и snapshots.

## Практический чеклист

Используйте этот порядок при создании или валидации радиального градиента:

1. Выберите форму: `circle` для одинаковых радиусов, `ellipse` для прямоугольных полей.
2. Выберите размер: extent keyword для CSS-like поведения или явные радиусы для контролируемой геометрии.
3. Выберите позицию через `at`, если центр должен уйти из дефолтного центра.
4. Выберите интерполяцию: `srgb` для CSS parity, `oklab` или `oklch` для более плавных переходов.
5. Добавьте минимум два color stops, чтобы получить полезный визуальный результат.
6. Добавьте явные позиции stops, если кольца или размеры свечения должны переживать редактирование.
7. Используйте color hints, когда нужно сдвинуть середину перехода.
8. Используйте double-position stops, когда нужны жесткие кольца.
9. Используйте `format()` перед сохранением пользовательского ввода.
10. Используйте `transformTo()` для renderer output вместо ручной конвертации строки.

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
