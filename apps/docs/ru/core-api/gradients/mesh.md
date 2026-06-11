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

type MeshPreviewExample = {
  id: string
  label: string
  input: string
}

type MeshPreviewState = {
  normalized: string
  cssBackground: string
  svgId: string
  svgDefs: string
  error: string
  isReady: boolean
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

const heroMesh = 'mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)'

const simpleMesh = 'mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01)'

const inferredGridMesh = 'mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)'

const distortedMesh = 'mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)'

const gridMesh = 'mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'

const bicubicMesh = 'mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'

const hueMesh = 'mesh-gradient(grid 2 2 method bilinear in hsl longer hue, vertex v00 0% 0% hsl(10, 100%, 50%), vertex v10 100% 0% hsl(350, 100%, 50%), vertex v01 0% 100% hsl(10, 100%, 50%), vertex v11 100% 100% hsl(350, 100%, 50%), patch p00 v00 v10 v11 v01)'

const handleMesh = 'mesh-gradient(grid 2 2 method bicubic in oklch longer hue, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01, handle p00 top 25% 0% 75% 0%, handle p00 right 100% 25% 100% 75%)'

function makeMeshExample(
  id: string,
  label: string,
  input: string,
): MeshPreviewExample {
  return {
    id,
    label,
    input,
  }
}

const examples = {
  hero: makeMeshExample(
    'hero',
    '4x4 bicubic OKLab-поле',
    heroMesh,
  ),
  anatomy: makeMeshExample(
    'anatomy',
    'Grid, vertices, patch, method и interpolation',
    simpleMesh,
  ),
  inferredGrid: makeMeshExample(
    'inferred-grid',
    'Выведенный 2x2 grid',
    inferredGridMesh,
  ),
  distorted: makeMeshExample(
    'distorted',
    'Искаженные позиции vertices',
    distortedMesh,
  ),
  grid3x3: makeMeshExample(
    'grid-3x3',
    '3x3 topology с четырьмя patches',
    gridMesh,
  ),
  bilinear: makeMeshExample(
    'bilinear',
    'Bilinear-семплинг patch',
    gridMesh,
  ),
  bicubic: makeMeshExample(
    'bicubic',
    'Bicubic-семплинг patch',
    bicubicMesh,
  ),
  hue: makeMeshExample(
    'hue',
    'HSL-семплинг longer hue',
    hueMesh,
  ),
  handles: makeMeshExample(
    'handles',
    'Сериализованные patch handles',
    handleMesh,
  ),
  constructor: makeMeshExample(
    'constructor',
    'Эквивалентный вывод конструктора',
    simpleMesh,
  ),
  sampling: makeMeshExample(
    'sampling',
    'Вход для patch color sampling',
    distortedMesh,
  ),
  transform: makeMeshExample(
    'transform',
    'Вход для renderer transformer',
    bicubicMesh,
  ),
  format: makeMeshExample(
    'format',
    'Форматированный пользовательский ввод',
    inferredGridMesh,
  ),
}

const exampleList = Object.values(examples)
const previewStates = ref<Record<string, MeshPreviewState>>({})
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

function getPreviewState(example: MeshPreviewExample): MeshPreviewState {
  return previewStates.value[example.id] ?? {
    normalized: example.input,
    cssBackground: '',
    svgId: '',
    svgDefs: '',
    error: '',
    isReady: false,
  }
}

function setPreviewState(id: string, state: MeshPreviewState) {
  previewStates.value = {
    ...previewStates.value,
    [id]: state,
  }
}

function resolvePreview(example: MeshPreviewExample) {
  const current = previewStates.value[example.id]

  if (current?.isReady || current?.error) {
    return
  }

  try {
    const gradient = parse(example.input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `mesh-preview-${example.id}`
    const svgPreview = createSvgPreview(svg, svgId)

    setPreviewState(example.id, {
      normalized: gradient.toString(),
      cssBackground: transformTo('css', gradient),
      svgId: svgPreview.id,
      svgDefs: svgPreview.defs,
      error: '',
      isReady: true,
    })
  } catch (value) {
    setPreviewState(example.id, {
      normalized: example.input,
      cssBackground: '',
      svgId: '',
      svgDefs: '',
      error: value instanceof Error ? value.message : 'Не удалось отрисовать превью.',
      isReady: false,
    })
  }
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

  if (!example || getPreviewState(example).error || !canvas) {
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
    getPreviewState(example).error ||
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
      [id]: value instanceof Error ? value.message : 'Не удалось отрисовать WebGL-превью.',
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

  canvas.dataset.meshPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const MeshPreviewContent = defineComponent({
  name: 'MeshPreviewContent',
  props: {
    example: {
      type: Object as PropType<MeshPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'mesh-render-tile__caption' }, [
        h('span', { class: 'mesh-render-tile__caption-text' }, label),
      ])
    }

    function activatePreview() {
      if (isVisible.value) {
        return
      }

      isVisible.value = true
      intersectionObserver?.disconnect()
      resolvePreview(props.example)
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
          rootMargin: '520px 0px',
        },
      )

      intersectionObserver.observe(root.value)
    })

    onBeforeUnmount(() => {
      intersectionObserver?.disconnect()
      canvas2dRefs.delete(props.example.id)
      webglSurfaceRefs.delete(props.example.id)
    })

    return () => {
      const state = getPreviewState(props.example)

      return h('figure', { ref: root, class: 'mesh-render-set' }, [
        h('figcaption', { class: 'mesh-render-set__header' }, [
          h('span', { class: 'mesh-render-set__eyebrow' }, 'Пример mesh-градиента'),
          h('strong', { class: 'mesh-render-set__label' }, props.example.label),
          h('code', { class: 'mesh-render-set__syntax' }, state.normalized),
        ]),
        state.error
          ? h('p', { class: 'mesh-render-set__error' }, state.error)
          : !isVisible.value || !state.isReady
            ? h(
              'div',
              {
                class: 'mesh-render-lazy',
                'data-gradiente-lazy-preview': props.example.id,
              },
              'Превью загрузится, когда дойдет до области просмотра.',
            )
            : h('div', { class: 'mesh-render-grid' }, [
              h('figure', { class: 'mesh-render-tile' }, [
                h('div', {
                  class: 'mesh-render-tile__surface',
                  style: { backgroundImage: state.cssBackground },
                  'data-gradiente-renderer': 'css',
                  'data-gradiente-input': props.example.input,
                }),
                renderCaption('CSS target'),
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                h('canvas', {
                  ref: (element: unknown) =>
                    setCanvasRef(props.example.id, 'canvas-2d', element),
                  class: 'mesh-render-tile__surface',
                  'data-gradiente-renderer': 'canvas-2d',
                  'data-gradiente-input': props.example.input,
                }),
                renderCaption('Canvas 2D'),
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                getWebglSnapshot(props.example.id)
                  ? h('img', {
                    ref: (element: unknown) =>
                      setWebglSurfaceRef(props.example.id, element),
                    class: 'mesh-render-tile__surface mesh-render-tile__image',
                    src: getWebglSnapshot(props.example.id),
                    alt: `${props.example.label} отрисован через Canvas WebGL`,
                    'data-gradiente-renderer': 'canvas-webgl',
                    'data-gradiente-input': props.example.input,
                  })
                  : h('div', {
                    ref: (element: unknown) =>
                      setWebglSurfaceRef(props.example.id, element),
                    class: 'mesh-render-tile__surface mesh-render-tile__placeholder',
                    'data-gradiente-renderer': 'canvas-webgl',
                    'data-gradiente-input': props.example.input,
                  }, 'Рендеринг WebGL...'),
                renderCaption('Canvas WebGL snapshot'),
                getWebglError(props.example.id)
                  ? h(
                    'p',
                    { class: 'mesh-render-set__error' },
                    getWebglError(props.example.id),
                  )
                  : null,
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                h('svg', {
                  class: 'mesh-render-tile__surface',
                  viewBox: '0 0 100 100',
                  preserveAspectRatio: 'none',
                  role: 'img',
                  'aria-label': `${props.example.label} отрисован через SVG`,
                  'data-gradiente-renderer': 'svg',
                  'data-gradiente-input': props.example.input,
                  innerHTML: [
                    state.svgDefs,
                    `<rect width="100%" height="100%" fill="url(#${state.svgId})"></rect>`,
                  ].join(''),
                }),
                renderCaption('SVG pattern'),
              ]),
            ]),
      ])
    }
  },
})

onMounted(() => {
  isMounted = true

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLCanvasElement
        const id = target.dataset.meshPreviewId

        if (id && target instanceof HTMLCanvasElement) {
          drawCanvas2d(id)
        }
      }
    })
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

# Mesh-градиенты

Mesh-градиент - самый структурный тип градиента в gradiente. Linear, radial,
diamond и conic градиенты описывают непрерывный цветовой переход через список
stops. Mesh-градиент описывает уже не линию или радиус, а цветную поверхность,
собранную из vertices и patches.

У каждой vertex есть id, x/y позиция и цвет. Каждый patch соединяет четыре
vertices в одну ячейку поверхности. Renderer семплит цвета внутри этих ячеек и
заполняет итоговый прямоугольник.

```css
mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)
```

<div class="mesh-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

`mesh-gradient(...)` не является нативной CSS gradient-функцией. gradiente
превращает одну и ту же внутреннюю mesh-модель в CSS, Canvas 2D, Canvas WebGL и
SVG output. CSS target - это сгенерированный SVG data URL. SVG target - это
pattern payload. Canvas targets рисуют sampled mesh напрямую.

Mesh previews на этой странице ленивые. Preview не вызывает `parse()` и
`transformTo()`, пока не приблизится к viewport, потому что mesh rendering
значительно тяжелее сериализации обычного stop-based градиента.

<GradientFrameworkTabs
  id="mesh-framework-tabs-ru"
  eyebrow="Интеграция gradiente"
  title="Использование mesh-градиента во фреймворке"
  description="Mesh-градиенты не являются нативными CSS-функциями, поэтому transformTo('css') возвращает готовый для background SVG data URL. Примеры используют тот же сложный mesh, который показан выше: парсим один раз, трансформируем в CSS и подключаем как backgroundImage."
  :gradient="examples.hero.input"
  gradient-kind="mesh-градиент"
  preview-aria-label="Превью mesh-градиента"
  tabs-aria-label="Примеры для фреймворков"
  code-label-suffix="пример кода"
  component-name="MeshGradientPreview"
/>

## Из чего состоит mesh-градиент

У модели mesh-градиента есть четыре обязательные части и одна опциональная
деталь patch:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Имя функции</strong>
    <span>`mesh-gradient(...)`. `repeating-mesh-gradient(...)` намеренно не поддерживается.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Grid config</strong>
    <span>`grid rows columns`, а также опциональные настройки `method` и `in color-space`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Vertices</strong>
    <span>Именованные точки с x/y позициями и цветами: `vertex v00 0% 0% red`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Patches</strong>
    <span>Четыре ссылки на vertices, которые описывают одну ячейку: `patch p00 v00 v10 v11 v01`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Handles</strong>
    <span>Опциональные cubic edge metadata, привязанные к сторонам patch и сохраненные в модели.</span>
  </div>
</div>

Resolved config выглядит так:

```ts
type GradientMeshConfig = {
  rows: number
  columns: number
  method: 'bilinear' | 'bicubic'
  interpolation: {
    colorSpace: GradientColorSpace
    hue?: GradientHueInterpolation
  }
}
```

Data model - это не список stops. У mesh есть явные vertices и явные patches:

```ts
type GradientMeshVertex = {
  id: string
  x: GradientLengthPercentage
  y: GradientLengthPercentage
  color: string
}

type GradientMeshPatch = {
  id: string
  topLeft: string
  topRight: string
  bottomRight: string
  bottomLeft: string
  handles?: GradientMeshPatchHandles
}
```

## Что делает gradiente

Для `mesh-gradient` gradiente берет на себя работу, которую нельзя делегировать
нативному CSS:

- Парсит mesh-строки в instance `GradientMesh`.
- По возможности выводит grid size из регулярных vertex ids или количества элементов.
- Валидирует vertex ids, patch ids, colors, coordinates и topology.
- Хранит vertices и patches как внутренний source of truth.
- Поддерживает `bilinear` и `bicubic` color sampling.
- Поддерживает color interpolation через Culori-compatible spaces.
- Сохраняет опциональные patch handles в string и JSON serialization.
- Семплит цвета через `samplePatchColor(patchId, u, v)`.
- Трансформирует одну и ту же модель в CSS, Canvas 2D, Canvas WebGL и SVG.
- Закрывает внешнюю область render area через edge triangles, когда vertices не лежат точно на краях прямоугольника.

## Анатомия

Полный синтаксис - это список mesh records, разделенных запятыми:

```css
mesh-gradient(
  grid <rows> <columns> [method bilinear|bicubic] [in color-space [hue-mode hue]],
  vertex <id> <x> <y> <color>,
  vertex <id> <x> <y> <color>,
  ...,
  patch <id> <top-left> <top-right> <bottom-right> <bottom-left>,
  ...,
  handle <patch-id> <side> <from-x> <from-y> <to-x> <to-y>
)
```

Минимальный явный mesh имеет `2 x 2` vertex grid и один patch:

```css
mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

В этом примере есть:

- `grid 2 2`: два ряда и две колонки vertices.
- `method bilinear`: каждый patch семплится через bilinear interpolation.
- `vertex v00 0% 0% red`: верхняя левая vertex красная.
- `vertex v10 100% 0% blue`: верхняя правая vertex синяя.
- `vertex v01 0% 100% yellow`: нижняя левая vertex желтая.
- `vertex v11 100% 100% green`: нижняя правая vertex зеленая.
- `patch p00 v00 v10 v11 v01`: один patch соединяет четыре vertices.

## Дефолты и вывод grid

Дефолты класса:

```txt
rows: 2
columns: 2
method: "bilinear"
interpolation.colorSpace: "srgb"
```

`grid` все равно сериализуется через `toString()`, потому что mesh topology
слишком важна, чтобы прятать ее в каноническом output. Если input не содержит
`grid`, gradiente пытается вывести его из vertex ids или количества элементов:

```css
mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.inferredGrid]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Каноническая строка для такого input будет содержать выведенный config
`grid 2 2 method bilinear`.

## Grid topology

`rows` и `columns` описывают topology, а не визуальное выравнивание. У `3 x 3`
grid девять vertices и четыре patches:

```txt
vertices: rows * columns
patches: (rows - 1) * (columns - 1)
```

Например:

```css
mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.grid3x3]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Ids `v00`, `v10`, `v20`, `v01` и так далее не случайные. gradiente читает их
как `v<column><row>`. Такая регулярная схема id позволяет модели валидировать
patch adjacency и позволяет bicubic sampling находить соседние vertices.

## Vertices

Vertex record состоит из четырех частей:

```css
vertex <id> <x> <y> <color>
```

Id должен быть стабильным, потому что patches ссылаются на него. Значения x/y -
это length-percentage values. Цвет может быть любой строкой, которую умеет
читать Culori.

Vertices не обязаны визуально выстраиваться в ровную сетку. Grid описывает
topology; реальную поверхность можно искажать, двигая позиции vertices:

```css
mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.distorted]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Когда vertices не полностью закрывают paint rectangle, встроенные renderers
добавляют внешние edge triangles. Благодаря этому весь output остается
заполненным, без прозрачных зазоров вокруг mesh.

## Patches

Patch record состоит из шести частей:

```css
patch <id> <top-left> <top-right> <bottom-right> <bottom-left>
```

Четыре ссылки на vertices должны быть уникальными и существовать. Для регулярных
ids patches должны описывать соседние grid cells. Для `2 x 2` grid нужен один
patch. Для `3 x 3` grid нужны четыре patches. Для `4 x 4` grid нужны девять
patches.

Порядок patch имеет смысл. Записывайте ссылки по часовой стрелке от верхнего
левого угла:

```txt
top-left -> top-right -> bottom-right -> bottom-left
```

Такой порядок дает renderers предсказуемую ориентацию поверхности и делает
сериализованный DSL читаемым.

## Sampling method

`method` управляет тем, как цвета семплятся внутри каждого patch.

`bilinear` - значение по умолчанию. Он смешивает верхний край, смешивает нижний
край, а затем смешивает два промежуточных цвета между собой. Это быстрый,
предсказуемый вариант, который хорошо подходит для простых поверхностей:

```css
mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.bilinear]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

`bicubic` семплит более гладкую поверхность, используя соседние vertices в
регулярном grid. Он дороже, но может убрать ощущение плоских граней у больших
bilinear patches:

```css
mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.bicubic]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Для bicubic meshes используйте регулярные vertex ids. Если sampler не может
построить regular vertex grid, он не сможет понять, какие соседние цвета должны
быть вокруг patch.

## Цветовая интерполяция

Mesh colors используют тот же словарь interpolation, что и другие виды
градиентов:

```css
grid 2 2 method bilinear in oklab
grid 2 2 method bicubic in oklch longer hue
grid 2 2 method bilinear in hsl decreasing hue
```

Interpolation clause относится к `grid`, а не к отдельным vertices или patches.
Каждый patch внутри mesh использует одинаковые настройки color interpolation.

Полярные color spaces могут использовать hue interpolation modes. Это особенно
заметно, когда hue оборачивается вокруг color wheel:

```css
mesh-gradient(grid 2 2 method bilinear in hsl longer hue, vertex v00 0% 0% hsl(10, 100%, 50%), vertex v10 100% 0% hsl(350, 100%, 50%), vertex v01 0% 100% hsl(10, 100%, 50%), vertex v11 100% 100% hsl(350, 100%, 50%), patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.hue]" :key="example.id">
  <MeshPreviewContent :example="example" />
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

Hue modes имеют смысл только для полярных color spaces. Если hue mode передан
для прямоугольного пространства вроде `oklab`, gradiente сохранит color space и
сериализует градиент без hue mode.

## Patch Handles

Handles - это опциональные records, привязанные к стороне patch:

```css
handle <patch-id> <side> <from-x> <from-y> <to-x> <to-y>
```

`side` может быть `top`, `right`, `bottom` или `left`.

```css
mesh-gradient(grid 2 2 method bicubic in oklch longer hue, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01, handle p00 top 25% 0% 75% 0%, handle p00 right 100% 25% 100% 75%)
```

<div class="mesh-preview-block" v-for="example in [examples.handles]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Handles являются частью mesh model, JSON representation, parser, validation и
serializer. Встроенные raster renderers семплят цвет из vertices и patches;
инструменты при этом могут использовать handles, чтобы сохранять editor-side
cubic edge metadata или передавать эти metadata в custom renderer.

## Программное создание

Большинству пользователей лучше начинать с `parse()`, потому что он держит
authoring близко к DSL. Когда нужно собрать mesh напрямую, используйте
`GradientMesh`.

Конструктор принимает три параметра:

```txt
new GradientMesh(vertices, patches, config?)
```

`vertices` и `patches` обязательны. `config` опционален. Пропущенные config
values по возможности выводятся автоматически, а затем подставляются из
дефолтов класса.

```ts
import { GradientMesh } from 'gradiente'

const gradient = new GradientMesh(
  [
    {
      id: 'v00',
      x: { kind: 'percent', value: 0 },
      y: { kind: 'percent', value: 0 },
      color: 'red',
    },
    {
      id: 'v10',
      x: { kind: 'percent', value: 100 },
      y: { kind: 'percent', value: 0 },
      color: 'blue',
    },
    {
      id: 'v01',
      x: { kind: 'percent', value: 0 },
      y: { kind: 'percent', value: 100 },
      color: 'yellow',
    },
    {
      id: 'v11',
      x: { kind: 'percent', value: 100 },
      y: { kind: 'percent', value: 100 },
      color: 'green',
    },
  ],
  [
    {
      id: 'p00',
      topLeft: 'v00',
      topRight: 'v10',
      bottomRight: 'v11',
      bottomLeft: 'v01',
    },
  ],
  {
    method: 'bilinear',
    interpolation: {
      colorSpace: 'srgb',
    },
  },
)
```

<div class="mesh-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

## Семплинг patch

`GradientMesh` может получить цвет внутри patch без рендера всего градиента.
Используйте `samplePatchColor(patchId, u, v)`.

`u` и `v` - локальные координаты patch от `0` до `1`:

```txt
u: 0 левый край, 1 правый край
v: 0 верхний край, 1 нижний край
```

```ts
import { GradientMesh } from 'gradiente'

const gradient = GradientMesh.fromString(
  'mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)'
)

const center = gradient.samplePatchColor('p00', 0.5, 0.5)
```

<div class="mesh-preview-block" v-for="example in [examples.sampling]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Sampling полезен для editors, color pickers, generated design tokens, tests и
любого workflow, где нужно проверить mesh без его полной отрисовки.

## Трансформация mesh-градиента

Каждый renderer target получает одну и ту же исходную модель. В этом главная
идея Core API: один раз распарсить, много раз трансформировать.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="mesh-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

У transformer outputs разные формы:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>CSS background string. Для mesh-градиентов это сгенерированный SVG data URL, потому что в CSS нет нативной функции `mesh-gradient()`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-2d`</strong>
    <span>Paint object с методом `draw(ctx, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-webgl`</strong>
    <span>Paint object с методом `draw(canvas, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`svg`</strong>
    <span>SVG pattern payload с `defs`, `url` и сериализованными SVG-данными.</span>
  </div>
</div>

## Нормализация

Используйте `format()` перед сохранением пользовательского ввода. Он парсит
строку во внутреннюю модель и сериализует ее обратно в каноническую строку
gradiente.

```ts
import { format } from 'gradiente'

const input = 'mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)'
const normalized = format(input)
```

<div class="mesh-preview-block" v-for="example in [examples.format]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Для mesh-градиентов нормализация особенно полезна, потому что делает inferred
config явным. Это дает editors, snapshots и сохраненному user input стабильную
форму.

## Правила валидации

У mesh-градиентов валидация строже, чем у stop-based градиентов:

- `rows` и `columns` должны быть integers больше или равны `2`.
- Количество vertices должно быть равно `rows * columns`.
- Количество patches должно быть равно `(rows - 1) * (columns - 1)`.
- Vertex ids и patch ids должны быть уникальными.
- Patch references должны ссылаться на существующие vertices.
- Каждый patch должен использовать четыре уникальные vertices.
- Распознанные regular ids вроде `v00` и `v10` должны оставаться внутри объявленного grid.
- Распознанные regular patches должны соответствовать соседним grid cells.
- Vertex colors должны читаться через Culori.
- `repeating-mesh-gradient(...)` отклоняется.

Эти правила строгие намеренно. Mesh-градиент ближе к geometry, чем к простому
списку цветов, поэтому invalid topology быстро превращается в renderer-specific
undefined behavior, если не поймать ее заранее.

## Заметки о производительности

Mesh rendering дороже обычного gradient rendering. Стоимость зависит от
количества patches, sampling method и target.

Используйте такой практический порядок:

1. Начинайте с самого маленького grid, который может описать поверхность.
2. Используйте `bilinear`, когда форма простая или интерактивная.
3. Используйте `bicubic`, когда гладкость важнее raw generation cost.
4. Для live editors предпочитайте Canvas 2D или Canvas WebGL.
5. Используйте CSS или SVG output, когда нужен portable serialized asset.
6. Кешируйте сгенерированный CSS/SVG output, если mesh меняется редко.
7. Используйте `format()` перед сохранением user-authored mesh strings.

## Практический чеклист

Используйте этот порядок, когда собираете или валидируете mesh-градиент:

1. Определите topology: `2 x 2`, `3 x 3`, `4 x 4` или больше.
2. Называйте vertices регулярными ids вроде `v00`, `v10`, `v01`, `v11`.
3. Разместите каждую vertex через x/y length-percentage coordinates.
4. Дайте каждой vertex валидный Culori-readable color.
5. Создайте один patch для каждой grid cell.
6. Записывайте patch references по часовой стрелке от top-left.
7. Выберите `bilinear` для скорости или `bicubic` для более гладких поверхностей.
8. Выберите interpolation: `srgb` для простой совместимости, `oklab` или `oklch` для более плавных переходов.
9. Добавляйте handles только когда вашему editor или custom renderer нужны эти metadata.
10. Используйте `format()` перед сохранением пользовательского ввода.
11. Используйте `transformTo()` для renderer output вместо ручной конвертации строки.

<style scoped>
.mesh-preview-block {
  margin: 18px 0 34px;
}

:deep(.mesh-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.mesh-render-set__header) {
  display: grid;
  gap: 8px;
  height: 118px;
  overflow: hidden;
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent),
      transparent 34%
    ),
    linear-gradient(
      45deg,
      transparent,
      color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent) 55%,
      transparent
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent),
      color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
    );
}

:deep(.mesh-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.mesh-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.mesh-render-set__syntax) {
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

:deep(.mesh-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.mesh-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.mesh-render-tile:last-child) {
  border-right: 0;
}

:deep(.mesh-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.mesh-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.mesh-render-tile__image) {
  object-fit: fill;
}

:deep(.mesh-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.mesh-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.mesh-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.mesh-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.mesh-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.mesh-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.mesh-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.mesh-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.mesh-render-tile) {
    border-right: 0;
  }

  :deep(.mesh-render-tile + .mesh-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
