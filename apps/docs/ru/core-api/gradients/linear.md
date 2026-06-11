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
      error: value instanceof Error ? value.message : 'Не удалось отрисовать превью.',
    }
  }
}

const examples = {
  hero: makeLinearExample(
    'hero',
    '120deg OKLCH-переход',
    'linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)',
  ),
  anatomy: makeLinearExample(
    'anatomy',
    'Направление, интерполяция, color hint и stops',
    'linear-gradient(to right in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultDirection: makeLinearExample(
    'default-direction',
    'Направление по умолчанию',
    'linear-gradient(red, blue)',
  ),
  keywordDirection: makeLinearExample(
    'keyword-direction',
    'Keyword-направление',
    'linear-gradient(to right, red, blue)',
  ),
  diagonalDirection: makeLinearExample(
    'diagonal-direction',
    'Диагональное keyword-направление',
    'linear-gradient(to top left, red 0%, blue 100%)',
  ),
  numericAngle: makeLinearExample(
    'numeric-angle',
    'Числовой угол',
    'linear-gradient(0.25turn, red, blue)',
  ),
  normalizedAngle: makeLinearExample(
    'normalized-angle',
    'Нормализованный угол',
    'linear-gradient(450deg, red, blue)',
  ),
  multiStop: makeLinearExample(
    'multi-stop',
    'Позиционированные color stops',
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
    'sRGB интерполяция',
    'linear-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeLinearExample(
    'oklab-interpolation',
    'OKLab интерполяция',
    'linear-gradient(in oklab, red, blue)',
  ),
  oklchHue: makeLinearExample(
    'oklch-hue',
    'OKLCH longer hue интерполяция',
    'linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeLinearExample(
    'repeating',
    'Повторяющийся линейный градиент',
    'repeating-linear-gradient(to right, red 0%, blue 10%)',
  ),
  constructor: makeLinearExample(
    'constructor',
    'Эквивалентный вывод конструктора',
    'linear-gradient(to right in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeLinearExample(
    'transform',
    'Вход для renderer transformer',
    'linear-gradient(135deg in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeLinearExample(
    'format',
    'Форматированный пользовательский ввод',
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
      [id]: value instanceof Error ? value.message : 'Не удалось отрисовать WebGL превью.',
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
        h('span', { class: 'linear-render-set__eyebrow' }, 'Пример линейного градиента'),
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
            'Превью загрузится, когда блок приблизится к viewport.',
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
            getWebglSnapshot(props.example.id)
              ? h('img', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'linear-render-tile__surface linear-render-tile__image',
                src: getWebglSnapshot(props.example.id),
                alt: `${props.example.label} отрисован через Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'linear-render-tile__surface linear-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Рендеринг WebGL...'),
            renderCaption('Снимок Canvas WebGL'),
            getWebglError(props.example.id)
              ? h(
                'p',
                { class: 'linear-render-set__error' },
                getWebglError(props.example.id),
              )
              : null,
          ]),
          h('figure', { class: 'linear-render-tile' }, [
            h('svg', {
              class: 'linear-render-tile__surface',
              viewBox: '0 0 100 100',
              preserveAspectRatio: 'none',
              role: 'img',
              'aria-label': `${props.example.label} отрисован через SVG`,
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

# Линейные градиенты

Линейный градиент - это цветовой переход, спроецированный вдоль прямой оси.
Renderer проводит невидимую линию через область отрисовки, сопоставляет каждый
пиксель с этой линией и сэмплит упорядоченные stops в найденной позиции.

В gradiente линейный градиент - это не просто CSS-строка. Это типизированная
модель градиента с направлением, настройками интерполяции, stops, опциональными
color hints и repeating-флагом. Одна и та же модель может быть преобразована в
CSS, Canvas 2D, Canvas WebGL, SVG или в target пользовательского transformer-а.

```css
linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)
```

<div class="linear-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Каждый preview-блок на этой странице отрисовывает один и тот же исходный
градиент сразу в четырех targets: CSS, Canvas 2D, Canvas WebGL и SVG. Колонка
WebGL - это snapshot, созданный через `transformTo('canvas-webgl', gradient)`,
поэтому страница не держит много активных WebGL contexts одновременно. Превью
загружаются лениво, когда пример приближается к viewport.

<GradientFrameworkTabs
  id="linear-framework-tabs-ru"
  eyebrow="Интеграция gradiente"
  title="Использование линейного градиента во фреймворке"
  description="Одна и та же модель gradiente может быть подключена в React, Vanilla JS, Vue или Svelte. Каждый пример парсит исходную строку, преобразует ее через transformTo('css') и применяет результат как настоящий background image."
  gradient="linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  gradient-kind="линейный градиент"
  preview-aria-label="Превью линейного градиента"
  tabs-aria-label="Примеры для фреймворков"
  code-label-suffix="пример кода"
  component-name="LinearGradientPreview"
/>

## Из Чего Состоит Линейный Градиент

У модели линейного градиента есть четыре концептуальные части:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Имя функции</strong>
    <span>`linear-gradient(...)` или `repeating-linear-gradient(...)`. Публичный instance type остаётся `linear-gradient`; repeating хранится в config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Направление</strong>
    <span>Keyword-направление вроде `to right`, диагональ вроде `to top left` или угол вроде `120deg`, `0.25turn`, `1.57rad`, `100grad`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Интерполяция</strong>
    <span>Color space после `in` и опциональный hue route для polar color spaces: `shorter`, `longer`, `increasing`, `decreasing`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Stop-лист</strong>
    <span>Color stops, опциональные процентные позиции, double positions и color hints.</span>
  </div>
</div>

Модель, которую хранит gradiente, не зависит от renderer-а:

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

Угол нормализуется в радианы. Позиции stops хранятся как нормализованные числа:
`0` означает `0%`, а `1` означает `100%`.

Модель stop для линейного градиента - это общая gradiente stop-модель:

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

Цвета остаются строками, чтобы сохранять авторский ввод. Renderers конвертируют
и сэмплят их только тогда, когда им нужны конкретные цвета.

## Что Делает gradiente

Для `linear-gradient` gradiente берёт на себя работу, которая обычно размазывается
между парсерами, UI-кодом, сериализаторами и renderer-ами:

- Парсит CSS-like строки в instance `GradientLinear`.
- Нормализует направление в радианы.
- Выводит отсутствующие позиции stops.
- Сортирует stops, сохраняя стабильный порядок для одинаковых позиций.
- Хранит color hints как полноценные элементы stop-листа.
- Сжимает double-position stops при сериализации.
- Хранит repeating-состояние из `repeating-linear-gradient(...)`.
- Сэмплит интерполяцию для renderer-ов, которым нужны concrete color stops.
- Преобразует одну и ту же модель в CSS, Canvas 2D, Canvas WebGL и SVG.

## Анатомия

Полный синтаксис состоит из одного опционального config-элемента и обязательного
stop-листа:

```css
linear-gradient(
  [direction] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

Первый элемент до запятой считается config только тогда, когда содержит tokens
направления или интерполяции. Всё после первой запятой относится к stop-листу.

```css
linear-gradient(to right in oklch, red 0%, 35%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

В этом примере есть:

- `to right`: ось градиента идёт слева направо.
- `in oklch`: цвета интерполируются в OKLCH.
- `red 0%`: первая цветовая stop-точка находится в начале.
- `35%`: color hint, который сдвигает midpoint перехода от red к blue.
- `blue 100%`: финальная цветовая stop-точка находится в конце.

## Направление

Направление определяет, как невидимая sampling line пересекает область
отрисовки.

Если направление не указано, gradiente использует CSS-like default: сверху вниз.
Внутренний угол равен `Math.PI` радиан, и serializer не выводит его, потому что
это значение по умолчанию.

```css
linear-gradient(red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.defaultDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Keyword-направления удобны для ручного написания, потому что их легко читать.

```css
linear-gradient(to right, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.keywordDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Диагональные keyword-направления тоже поддерживаются.

```css
linear-gradient(to top left, red 0%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.diagonalDirection]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Числовые углы лучше подходят для generated data, анимации и точных контролов.
gradiente принимает `deg`, `rad`, `turn` и `grad`.

```css
linear-gradient(0.25turn, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.numericAngle]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Углы нормализуются. Например, `450deg` эквивалентен `90deg`, поэтому
сериализация может превратиться в `to right`.

```css
linear-gradient(450deg, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.normalizedAngle]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Распространённые направления соответствуют таким внутренним углам:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>без значения / `to bottom`</strong>
    <span>`Math.PI` радиан. Это default, поэтому он не выводится в `toString()`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to top`</strong>
    <span>`0` радиан.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to right`</strong>
    <span>`Math.PI / 2` радиан.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`to left`</strong>
    <span>`Math.PI * 1.5` радиан.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>диагонали</strong>
    <span>`to top right`, `to bottom right`, `to bottom left` и `to top left` хранятся как нормализованные диагональные углы.</span>
  </div>
</div>

## Stop-лист

Stop-лист определяет, какие цвета появляются на линии градиента и где они
появляются. Практически полезный линейный градиент обычно содержит минимум две
color stops.

Если у color stop нет явной позиции, gradiente выводит её из соседних stops.
Первая неразрешённая color stop становится `0%`; последняя становится `100%`;
неразрешённые stops между известными позициями распределяются равномерно.

```css
linear-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Color hints - это голые проценты между двумя color stops. Они не создают новый
цвет. Они сдвигают воспринимаемую середину интерполяционного сегмента.

```css
linear-gradient(to right, red 0%, 35%, blue 100%)
```

<div class="linear-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Double-position stops создают жёсткие диапазоны. Цвет с двумя позициями хранится
как две соседние color stops с одинаковым цветом, а при возможности
сериализуется обратно в компактную форму.

```css
linear-gradient(to right, red 0% 35%, blue 35% 100%)
```

<div class="linear-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

## Интерполяция

Интерполяция управляет путём между цветами. Это одно из главных отличий обычной
CSS-строки от renderer-модели gradiente: Canvas 2D, WebGL и SVG не везде нативно
поддерживают CSS Color 4 interpolation syntax, поэтому gradiente вычисляет
renderable color stops для этих targets.

Пространство интерполяции по умолчанию - `srgb`.

```css
linear-gradient(in srgb, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Перцепционные пространства вроде `oklab` часто дают более плавные переходы.

```css
linear-gradient(in oklab, red, blue)
```

<div class="linear-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Polar color spaces могут использовать режимы hue interpolation. gradiente
поддерживает `shorter`, `longer`, `increasing` и `decreasing`.

```css
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="linear-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <LinearPreviewContent :example="example" />
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

## Повторяющиеся Линейные Градиенты

`repeating-linear-gradient(...)` использует тот же внутренний gradient kind, что
и `linear-gradient(...)`. Префикс выставляет `isRepeating: true` в config, а
instance `type` остаётся `linear-gradient`.

```css
repeating-linear-gradient(to right, red 0%, blue 10%)
```

<div class="linear-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Repeating-градиенты особенно полезны для stripes, scanlines, rulers, debugging
overlays и generated pattern systems.

## Программное Создание

Большинству пользователей стоит начинать с `parse()`, потому что он принимает
тот же input shape, который разработчики уже знают по CSS. Если градиент нужно
собрать напрямую, используй `GradientLinear`.

Конструктор принимает два параметра:

```txt
new GradientLinear(stops, config?)
```

`stops` обязателен. `config` опционален, а отсутствующие значения берутся из
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

## Трансформация Линейного Градиента

Каждый renderer target получает одну и ту же исходную модель. В этом суть Core
API: один раз распарсить, много раз преобразовать.

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

У outputs transformer-ов разные формы:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>CSS background-строка.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-2d`</strong>
    <span>Paint object с `draw(ctx, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-webgl`</strong>
    <span>Paint object с `draw(canvas, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`svg`</strong>
    <span>SVG paint server payload с `defs`, `url` и сериализованными SVG-данными.</span>
  </div>
</div>

## Нормализация

Используй `format()` перед сохранением пользовательского ввода. Он парсит строку
во внутреннюю модель и сериализует её обратно в canonical gradiente string.

```ts
import { format } from 'gradiente'

const input = 'linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="linear-preview-block" v-for="example in [examples.format]" :key="example.id">
  <LinearPreviewContent :example="example" />
</div>

Нормализация полезна, когда пользователи вводят градиенты вручную, когда editor
state сохраняется или когда generated gradients должны иметь стабильный output
для тестов и snapshots.

## Дефолты

Это class defaults для нового линейного градиента, если config values не
переданы:

```txt
angle: Math.PI
interpolation.colorSpace: "srgb"
isRepeating: false
```

Default values не выводятся в `toString()`. Например, `180deg` и `in srgb` - это
значения по умолчанию для non-repeating linear gradient, поэтому их не нужно
сериализовать.

## Практический Чеклист

Используй этот порядок при создании или валидации линейного градиента:

1. Выбери направление: keyword для hand-authored gradients, angle для generated data.
2. Выбери интерполяцию: `srgb` для CSS parity, `oklab` или `oklch` для более плавных ramps.
3. Добавь минимум две color stops, чтобы визуальный output был полезным.
4. Укажи позиции stops явно, если дизайн должен переживать редактирование.
5. Используй color hints, когда нужно сдвинуть midpoint перехода.
6. Используй double-position stops, когда нужны жёсткие bands.
7. Используй `format()` перед сохранением пользовательского ввода.
8. Используй `transformTo()` для renderer output вместо ручной конвертации строки.

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
