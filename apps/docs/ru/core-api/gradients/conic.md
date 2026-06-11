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
      error: value instanceof Error ? value.message : 'Не удалось отрисовать превью.',
    }
  }
}

const examples = {
  hero: makeConicExample(
    'hero',
    'Цветовое колесо OKLCH со смещенным центром',
    'conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)',
  ),
  anatomy: makeConicExample(
    'anatomy',
    'Начальный угол, центр, интерполяция, color hint и stops',
    'conic-gradient(from 74deg at 50% 50% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultConic: makeConicExample(
    'default-conic',
    'Conic-градиент по умолчанию',
    'conic-gradient(red, blue)',
  ),
  fromDegrees: makeConicExample(
    'from-degrees',
    'Начальный угол в градусах',
    'conic-gradient(from 90deg, red, blue)',
  ),
  fromTurn: makeConicExample(
    'from-turn',
    'Начальный угол в turn',
    'conic-gradient(from 0.25turn, red, blue)',
  ),
  fromRadians: makeConicExample(
    'from-radians',
    'Начальный угол в радианах',
    'conic-gradient(from 1.5708rad, red, blue)',
  ),
  keywordPosition: makeConicExample(
    'keyword-position',
    'Центр через keywords',
    'conic-gradient(at top left, red, blue)',
  ),
  valuePosition: makeConicExample(
    'value-position',
    'Процентная позиция центра',
    'conic-gradient(at 35% 45%, red, blue)',
  ),
  fromAndPosition: makeConicExample(
    'from-and-position',
    'Начальный угол со смещенным центром',
    'conic-gradient(from 74deg at 35% 45%, #d53f96, #ef9439, #077fe9)',
  ),
  multiStop: makeConicExample(
    'multi-stop',
    'Позиционированные color stops',
    'conic-gradient(red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeConicExample(
    'color-hint',
    'Color hint',
    'conic-gradient(red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeConicExample(
    'double-position',
    'Жесткие угловые секторы',
    'conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)',
  ),
  sortedStops: makeConicExample(
    'sorted-stops',
    'Нормализованный порядок stops',
    'conic-gradient(from 74deg, red, blue 72%, yellow 63%)',
  ),
  srgbInterpolation: makeConicExample(
    'srgb-interpolation',
    'sRGB-интерполяция',
    'conic-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeConicExample(
    'oklab-interpolation',
    'OKLab-интерполяция',
    'conic-gradient(at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeConicExample(
    'oklch-hue',
    'OKLCH-интерполяция longer hue',
    'conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeConicExample(
    'repeating',
    'Повторяющийся conic-градиент',
    'repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)',
  ),
  constructor: makeConicExample(
    'constructor',
    'Эквивалентный вывод конструктора',
    'repeating-conic-gradient(from 45deg at 49% 45% in oklch, #ff74f6, #405de6)',
  ),
  transform: makeConicExample(
    'transform',
    'Вход для renderer transformer',
    'conic-gradient(from 74deg at 35% 45% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeConicExample(
    'format',
    'Форматированный пользовательский ввод',
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
        h('span', { class: 'conic-render-set__eyebrow' }, 'Пример conic-градиента'),
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
            'Превью загрузится, когда дойдет до области просмотра.',
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
                alt: `${props.example.label} отрисован через Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'conic-render-tile__surface conic-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Рендеринг WebGL...'),
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
              'aria-label': `${props.example.label} отрисован через SVG`,
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

# Конические градиенты

Конический градиент - это угловой градиент. Он выбирает цвет не по линии и не
по расстоянию от центра, а по углу вокруг центральной точки. Из-за этого
градиент будто вращается вокруг центра и хорошо подходит для цветовых колес,
диаграмм, шкал, ручек управления, loader-анимаций, углового света, круговых
масок и любых интерфейсов, где важно направление вокруг точки.

В CSS-геометрии конического градиента `0deg` смотрит вверх, а углы идут по
часовой стрелке. gradiente использует эту же договоренность для CSS,
Canvas 2D, Canvas WebGL и SVG.

```css
conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)
```

<div class="conic-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

`conic-gradient(...)` и `repeating-conic-gradient(...)` - это нативные CSS
функции, но gradiente делает больше, чем просто передает строку дальше. Он
парсит градиент во внутреннюю модель, нормализует ее и трансформирует одну и ту
же модель в CSS, Canvas 2D, Canvas WebGL и SVG. SVG target генерируется как
pattern payload, потому что в SVG нет нативного примитива для conic-градиента.

Каждый preview-блок на этой странице отрисован через gradiente сразу в четырех
targets. Колонка WebGL сохраняется как snapshot, чтобы страница не держала
много живых WebGL-контекстов одновременно.

<GradientFrameworkTabs
  id="conic-framework-tabs-ru"
  eyebrow="Интеграция gradiente"
  title="Использование конического градиента во фреймворке"
  description="Conic-градиенты являются нативными CSS backgrounds, но gradiente все равно парсит, сортирует, нормализует и трансформирует одну модель для каждого renderer. Каждый пример преобразует распарсенный градиент через transformTo('css') и подключает результат во фреймворке."
  gradient="conic-gradient(from 74deg at 50% 50% in oklch, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)"
  gradient-kind="конический градиент"
  preview-aria-label="Превью конического градиента"
  tabs-aria-label="Примеры для фреймворков"
  code-label-suffix="пример кода"
  component-name="ConicGradientPreview"
/>

## Из чего состоит конический градиент

У модели конического градиента есть пять основных частей:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Имя функции</strong>
    <span>`conic-gradient(...)` или `repeating-conic-gradient(...)`. Публичный тип instance остается `conic-gradient`; повторение хранится в config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Начальный угол</strong>
    <span>Опциональный угол `from`, который поворачивает точку, где начинается первый stop.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Позиция</strong>
    <span>Центральная точка после `at`: например, `at center`, `at left top` или `at 35% 45%`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Интерполяция</strong>
    <span>Опциональное правило интерполяции цвета: например, `in srgb`, `in oklab` или `in oklch longer hue`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Список stops</strong>
    <span>Color stops, опциональные процентные позиции, double-position stops и color hints вокруг угловой развертки.</span>
  </div>
</div>

Внутри `GradientConic` хранит config отдельно от stops:

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

Позиции stops хранятся как нормализованные числа: `0` означает начало угловой
развертки, а `1` означает конец развертки. В строковом синтаксисе на этой
странице эти позиции записываются в процентах.

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

## Что делает gradiente

Для `conic-gradient` gradiente берет на себя и CSS-совместимое поведение, и
renderer-specific вывод:

- Парсит conic-строки в instance `GradientConic`.
- Хранит начальный угол, позицию центра, интерполяцию, stops и repeating-состояние.
- Подставляет дефолтные значения config из одного места в конструкторе.
- Заполняет пропущенные позиции stops.
- Нормализует keyword-позиции в порядок x/y.
- Сохраняет color hints как полноценные stop-данные.
- Компактно сериализует double-position stops.
- Сортирует позиционированные stops в стабильном порядке.
- Рисует одну и ту же внутреннюю модель в Canvas 2D и Canvas WebGL.
- Генерирует SVG pattern для рендереров, которым нужен SVG-вывод.
- Трансформирует одну модель в CSS, Canvas 2D, Canvas WebGL и SVG.

## Анатомия

Полный синтаксис состоит из опционального config-блока и обязательного списка
stops:

```css
conic-gradient(
  [from angle] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

Первый элемент до запятой считается config только тогда, когда содержит
conic config tokens. Все после первой запятой относится к списку stops.

```css
conic-gradient(from 74deg at 50% 50% in oklch, red 0%, 35%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

В этом примере есть:

- `from 74deg`: угловая развертка повернута на 74 градуса.
- `at 50% 50%`: центр находится в середине области отрисовки.
- `in oklch`: цвета интерполируются в OKLCH.
- `red 0%`: первый color stop стоит в начале развертки.
- `35%`: color hint, который сдвигает midpoint перехода от red к blue.
- `blue 100%`: последний color stop стоит в конце развертки.

## Значения по умолчанию

Если conic config не указан, gradiente использует CSS-похожие дефолты:

```css
conic-gradient(red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.defaultConic]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Дефолты класса:

```txt
from: 0deg
position: center center
interpolation.colorSpace: "srgb"
isRepeating: false
```

Дефолтные значения не попадают в `toString()`. Поэтому
`conic-gradient(from 0deg at center in srgb, red, blue)` может
сериализоваться в компактный `conic-gradient(red, blue)`.

## Начальный угол

Угол `from` поворачивает весь градиент вокруг его центра. Он не меняет позиции
stops; он меняет место, где начинается угловая развертка.

`90deg` поворачивает первый stop к правой стороне блока:

```css
conic-gradient(from 90deg, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.fromDegrees]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Углы могут использовать CSS angle units, которые поддерживает модель:
`deg`, `turn`, `rad` и `grad`.

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

## Позиция

Позиция двигает центр угловой развертки. Она всегда идет после `at`.

Keyword-позиции используют x/y keywords:

```css
conic-gradient(at top left, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

gradiente нормализует keyword-позиции в x/y порядок. Например, `at top left`
сериализуется как `at left top`.

Value-позиции используют два length-percentage значения:

```css
conic-gradient(at 35% 45%, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

`from` и `at` можно комбинировать, когда угловой развертке нужен и поворот, и
смещенный центр:

```css
conic-gradient(from 74deg at 35% 45%, #d53f96, #ef9439, #077fe9)
```

<div class="conic-preview-block" v-for="example in [examples.fromAndPosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Текущий parser держит позиции строгими: keyword-позиции состоят только из
keywords, а value-позиции требуют два length-percentage tokens. Смешанные CSS
формы вроде `left 20px top 10px` пока не входят в эту модель.

## Список stops

Список stops определяет, какие цвета появляются вокруг окружности. Практический
conic-градиент обычно содержит хотя бы два color stops.

Если у color stop нет явной позиции, gradiente вычисляет ее по соседним stops.
Первый unresolved color stop становится `0%`; последний unresolved color stop
становится `100%`; unresolved stops между известными позициями распределяются
равномерно.

```css
conic-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Color hints - это отдельные проценты между двумя color stops. Они не создают
новый color stop. Они сдвигают воспринимаемый midpoint сегмента интерполяции.

```css
conic-gradient(red 0%, 35%, blue 100%)
```

<div class="conic-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Double-position stops создают жесткие угловые секторы. Цвет, записанный с двумя
позициями, хранится как две соседние color stop-точки с одним цветом, а затем
по возможности сериализуется обратно в компактную форму.

```css
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
```

<div class="conic-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Когда позиционированные stops записаны не по порядку, gradiente нормализует их
в стабильный порядок. Это важно для состояния редактора, snapshots и сравнения
между разными renderers.

```css
conic-gradient(from 74deg, red, blue 72%, yellow 63%)
```

<div class="conic-preview-block" v-for="example in [examples.sortedStops]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

## Интерполяция

Интерполяция управляет путем между цветами. Для conic-градиентов это особенно
заметно, потому что hue-изменения оборачиваются вокруг центра и сразу бросаются
в глаза.

Пространство интерполяции по умолчанию - `srgb`.

```css
conic-gradient(in srgb, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Перцептуальные пространства вроде `oklab` часто дают более плавные угловые
переходы.

```css
conic-gradient(at 25% 75% in oklab, red, blue)
```

<div class="conic-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Полярные цветовые пространства могут использовать hue interpolation modes.
gradiente поддерживает `shorter`, `longer`, `increasing` и `decreasing`.

```css
conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="conic-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Hue-интерполяция имеет смысл только для полярных цветовых пространств. Если
hue mode передан для прямоугольного пространства вроде `oklab`, gradiente
сохранит color space и сериализует градиент без hue mode.

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

## Повторяющиеся конические градиенты

`repeating-conic-gradient(...)` использует тот же внутренний gradient kind, что
и `conic-gradient(...)`. Префикс устанавливает `isRepeating: true` в config, а
instance `type` остается `conic-gradient`.

```css
repeating-conic-gradient(from 45deg at 49% 45%, red 10%, 50%, blue 80%)
```

<div class="conic-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Повторяющиеся conic-градиенты полезны для делений колеса, полярных диаграмм,
loading rings, угловых линеек, технических overlay-слоев, радиальных полос и
генерируемых угловых паттернов.

## Программное создание

Большинству пользователей лучше начинать с `parse()`, потому что он принимает
тот же input shape, что и DSL. Когда нужно собрать градиент напрямую,
используйте `GradientConic`.

Конструктор принимает два параметра:

```txt
new GradientConic(stops, config?)
```

`stops` обязателен. `config` опционален, а пропущенные значения подставляются
из дефолтов класса.

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

## Трансформация конического градиента

Каждый renderer target получает одну и ту же исходную модель. В этом главная
идея Core API: один раз распарсить, много раз трансформировать.

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

У transformer outputs разные формы:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>CSS background string. Для conic-градиентов это нормализованная нативная CSS-строка `conic-gradient(...)` или `repeating-conic-gradient(...)`.</span>
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

const input = 'conic-gradient(from 74deg, red, blue 72%, yellow 63%)'
const normalized = format(input)
```

<div class="conic-preview-block" v-for="example in [examples.format]" :key="example.id">
  <ConicPreviewContent :example="example" />
</div>

Нормализация особенно полезна для conic-градиентов, потому что нативный CSS и
авторский input могут визуально расходиться, если stops записаны не по порядку.
gradiente парсит строку, сортирует позиционированные stops в стабильную модель
и затем использует эту модель для каждого renderer.

## Практический чеклист

Используйте этот порядок, когда собираете или валидируете conic-градиент:

1. Выберите центр через `at`, если развертка должна вращаться не вокруг центра блока.
2. Выберите `from`, если первый stop должен начинаться с конкретного угла.
3. Выберите интерполяцию: `srgb` для простой совместимости, `oklab` или `oklch` для более плавных переходов.
4. Добавьте минимум два color stops, чтобы получить полезный визуальный результат.
5. Добавьте явные процентные позиции stops, если угловые секторы должны переживать редактирование.
6. Используйте color hints, когда нужно сдвинуть midpoint перехода.
7. Используйте double-position stops, когда нужны жесткие секторы.
8. Используйте `repeating-conic-gradient(...)` для делений, полос или повторяющихся угловых bands.
9. Используйте `format()` перед сохранением пользовательского ввода.
10. Используйте `transformTo()` для renderer output вместо ручной конвертации строки.

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
