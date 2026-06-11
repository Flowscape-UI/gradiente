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
      error: value instanceof Error ? value.message : 'Не удалось отрисовать превью.',
    }
  }
}

const examples = {
  hero: makeDiamondExample(
    'hero',
    'Смещенное OKLCH diamond-поле',
    'diamond-gradient(farthest-corner at 48% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)',
  ),
  anatomy: makeDiamondExample(
    'anatomy',
    'Размер, позиция, интерполяция, color hint и stops',
    'diamond-gradient(closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)',
  ),
  defaultDiamond: makeDiamondExample(
    'default-diamond',
    'Diamond-градиент по умолчанию',
    'diamond-gradient(red, blue)',
  ),
  circleShape: makeDiamondExample(
    'circle-shape',
    'Diamond-метрика с равными радиусами',
    'diamond-gradient(circle, red, blue)',
  ),
  ellipseShape: makeDiamondExample(
    'ellipse-shape',
    'Явно растянутый diamond',
    'diamond-gradient(ellipse 35% 70%, cyan, blue 60%, black)',
  ),
  closestSide: makeDiamondExample(
    'closest-side',
    'Размер closest-side',
    'diamond-gradient(closest-side, red, blue)',
  ),
  closestCorner: makeDiamondExample(
    'closest-corner',
    'Размер closest-corner',
    'diamond-gradient(closest-corner at 25% 75%, #ff74f6, #405de6)',
  ),
  farthestSide: makeDiamondExample(
    'farthest-side',
    'Размер farthest-side',
    'diamond-gradient(farthest-side at left center, #ff74f6, #405de6)',
  ),
  explicitSize: makeDiamondExample(
    'explicit-size',
    'Явные x/y радиусы',
    'diamond-gradient(40% 80% at 35% 65% in oklab, red 0%, yellow 50%, blue 100%)',
  ),
  keywordPosition: makeDiamondExample(
    'keyword-position',
    'Keyword-позиция',
    'diamond-gradient(at top left, red, blue)',
  ),
  valuePosition: makeDiamondExample(
    'value-position',
    'Процентная позиция',
    'diamond-gradient(at 25% 75%, red, blue)',
  ),
  multiStop: makeDiamondExample(
    'multi-stop',
    'Позиционированные color stops',
    'diamond-gradient(red 0%, yellow 40%, blue 100%)',
  ),
  colorHint: makeDiamondExample(
    'color-hint',
    'Color hint',
    'diamond-gradient(red 0%, 35%, blue 100%)',
  ),
  doublePosition: makeDiamondExample(
    'double-position',
    'Жесткие diamond-полосы',
    'diamond-gradient(red 0% 35%, blue 35% 100%)',
  ),
  srgbInterpolation: makeDiamondExample(
    'srgb-interpolation',
    'sRGB-интерполяция',
    'diamond-gradient(in srgb, red, blue)',
  ),
  oklabInterpolation: makeDiamondExample(
    'oklab-interpolation',
    'OKLab-интерполяция',
    'diamond-gradient(at 25% 75% in oklab, red, blue)',
  ),
  oklchHue: makeDiamondExample(
    'oklch-hue',
    'OKLCH-интерполяция longer hue',
    'diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))',
  ),
  repeating: makeDiamondExample(
    'repeating',
    'Повторяющийся diamond-градиент',
    'repeating-diamond-gradient(at center, red 0%, blue 20%)',
  ),
  constructor: makeDiamondExample(
    'constructor',
    'Эквивалентный вывод конструктора',
    'diamond-gradient(closest-side at 35% 45% in oklch, #ff74f6 0%, #405de6 100%)',
  ),
  transform: makeDiamondExample(
    'transform',
    'Вход для renderer transformer',
    'diamond-gradient(40% 80% at 35% 65% in oklch longer hue, #ff74f6, #405de6)',
  ),
  format: makeDiamondExample(
    'format',
    'Форматированный пользовательский ввод',
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
        h('span', { class: 'diamond-render-set__eyebrow' }, 'Пример diamond-градиента'),
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
            'Превью загрузится, когда блок приблизится к viewport.',
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
                alt: `${props.example.label} отрисован через Canvas WebGL`,
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              })
              : h('div', {
                ref: (element: unknown) =>
                  setWebglSurfaceRef(props.example.id, element),
                class: 'diamond-render-tile__surface diamond-render-tile__placeholder',
                'data-gradiente-renderer': 'canvas-webgl',
                'data-gradiente-input': props.example.input,
              }, 'Рендеринг WebGL...'),
            renderCaption('Canvas WebGL снимок'),
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

# Diamond-градиенты

Diamond-градиент - это gradiente-specific вид градиента. С точки зрения
пользователя он работает почти как радиальный градиент, но вместо круглого поля
расстояния использует diamond distance field. Пиксели измеряются по тому,
насколько далеко они ушли от центра по горизонтали и вертикали, поэтому контуры
одинакового расстояния образуют ромбы.

Из-за этого `diamond-gradient(...)` хорошо подходит для faceted glows,
UI-подсветок, isometric-looking поверхностей, жестких полос, генерируемых
pattern-систем и эффектов, где обычный radial gradient выглядит слишком круглым.

```css
diamond-gradient(farthest-corner at 48% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`diamond-gradient` не является нативной CSS-функцией градиента. Каждый
preview-блок на этой странице отрисовывается через gradiente сразу в четырех
targets: CSS target, Canvas 2D, Canvas WebGL и SVG. CSS target - это
сгенерированный SVG data URL, а SVG target - pattern payload. Колонка WebGL
захватывается как snapshot, чтобы страница не держала слишком много активных
WebGL-контекстов одновременно.

<GradientFrameworkTabs
  id="diamond-framework-tabs-ru"
  eyebrow="Интеграция gradiente"
  title="Использование diamond-градиента во фреймворке"
  description="Diamond-градиенты не являются нативными CSS-функциями, поэтому transformTo('css') возвращает готовый для background SVG data URL. Одну и ту же распарсенную модель gradiente все равно можно подключить в React, Vanilla JS, Vue или Svelte."
  gradient="diamond-gradient(farthest-corner at 48% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)"
  gradient-kind="diamond-градиент"
  preview-aria-label="Превью diamond-градиента"
  tabs-aria-label="Примеры для фреймворков"
  code-label-suffix="пример кода"
  component-name="DiamondGradientPreview"
/>

## Из чего состоит diamond-градиент

У модели diamond-градиента есть пять смысловых частей:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Имя функции</strong>
    <span>`diamond-gradient(...)` или `repeating-diamond-gradient(...)`. Публичный тип экземпляра остается `diamond-gradient`; повтор хранится в config.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Поле расстояния</strong>
    <span>Diamond-метрика. `circle` сохраняет одинаковые x/y радиусы; `ellipse` позволяет использовать разные x/y радиусы.</span>
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
    <span>Color stops, опциональные процентные позиции, опциональные double positions и color hints вдоль diamond-радиуса.</span>
  </div>
</div>

Внутри `GradientDiamond` переиспользует radial config model. Главное отличие не
в публичном синтаксисе, а в расчете расстояния, который используют рендереры.

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

Позиции stops - это нормализованные числа: `0` означает центр, а `1` означает
вычисленную границу diamond. Repeating-рендереры могут сэмплировать дальше `1`,
когда видимому прямоугольнику нужны дополнительные diamond-полосы, чтобы закрыть
углы.

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

## Что делает gradiente

Для `diamond-gradient` gradiente берет на себя работу, которую нельзя переложить
на нативный CSS:

- Парсит diamond-строки в экземпляр `GradientDiamond`.
- Хранит размер, позицию центра, интерполяцию, stops и состояние повтора.
- Переиспользует radial config parsing без отдельной одноразовой модели.
- Подставляет дефолтные значения из одного места в конструкторе.
- Вычисляет отсутствующие позиции stops.
- Сохраняет color hints как полноценные stop-данные.
- Компактно сериализует double-position stops.
- Сэмплирует diamond field для CSS и SVG targets.
- Рисует ту же модель в Canvas 2D и Canvas WebGL.
- Преобразует одну и ту же модель в CSS, Canvas 2D, Canvas WebGL и SVG.

## Анатомия

Полный синтаксис состоит из одного опционального элемента конфигурации и
обязательного stop-листа:

```css
diamond-gradient(
  [shape] [size] [at position] [in color-space [hue-mode hue]],
  color-stop-or-hint,
  color-stop-or-hint,
  ...
)
```

Первый элемент до запятой считается конфигурацией только тогда, когда содержит
diamond config tokens. Все после первой запятой относится к stop-листу.

```css
diamond-gradient(closest-side at 30% 35% in oklch, red 0%, 35%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

В этом примере есть:

- `closest-side`: diamond доходит до ближайшей стороны от своего центра.
- `at 30% 35%`: центр смещен ближе к верхней левой области.
- `in oklch`: цвета интерполируются в OKLCH.
- `red 0%`: первый color stop расположен в центре.
- `35%`: color hint, который двигает середину перехода от red к blue.
- `blue 100%`: последний color stop расположен на вычисленной границе diamond.

## Дефолты

Если diamond config не указан, gradiente использует те же дефолты config, что и
радиальное семейство:

```css
diamond-gradient(red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.defaultDiamond]" :key="example.id">
  <DiamondPreviewContent :example="example" />
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
`diamond-gradient(ellipse farthest-corner at center in srgb, red, blue)` может
сериализоваться в компактный `diamond-gradient(red, blue)`.

## Геометрия diamond

Diamond-рендерер использует Manhattan-like поле расстояния:

```txt
t = abs(x - center.x) / radius.x + abs(y - center.y) / radius.y
```

Цвет сэмплируется в точке `t`. Когда `t` равно `0`, пиксель находится в центре.
Когда `t` равно `1`, пиксель лежит на вычисленной diamond-границе. Значения выше
`1` находятся за этой границей и в основном важны для repeating gradients или
заливки внешней области.

`circle` сохраняет одинаковые радиусы по x и y, поэтому у diamond симметричные
оси.

```css
diamond-gradient(circle, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.circleShape]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`ellipse` позволяет использовать разные радиусы по x и y. Это дефолт, потому что
он лучше адаптируется к прямоугольным областям.

```css
diamond-gradient(ellipse 35% 70%, cyan, blue 60%, black)
```

<div class="diamond-preview-block" v-for="example in [examples.ellipseShape]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Слова `circle` и `ellipse` унаследованы из radial-синтаксиса, но для
diamond-градиента они описывают радиусы, которые использует diamond distance
field, а не круглую визуальную форму.

## Размер

Размер определяет вычисленные x/y радиусы, которые использует diamond field. Он
может быть keyword-based или явным.

Extent keywords:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`closest-side`</strong>
    <span>Diamond доходит до ближайшей стороны от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`closest-corner`</strong>
    <span>Diamond доходит до ближайшего угла от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-side`</strong>
    <span>Diamond доходит до самой дальней стороны от центра.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`farthest-corner`</strong>
    <span>Diamond доходит до самого дальнего угла от центра. Это дефолт.</span>
  </div>
</div>

`closest-side` полезен для локальных подсветок, которые должны быстро
заканчиваться.

```css
diamond-gradient(closest-side, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.closestSide]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`closest-corner` зависит и от центра, и от прямоугольной области отрисовки.

```css
diamond-gradient(closest-corner at 25% 75%, #ff74f6, #405de6)
```

<div class="diamond-preview-block" v-for="example in [examples.closestCorner]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

`farthest-side` создает более широкие поля, но не заставляет diamond доходить до
самого дальнего угла.

```css
diamond-gradient(farthest-side at left center, #ff74f6, #405de6)
```

<div class="diamond-preview-block" v-for="example in [examples.farthestSide]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Явные размеры используют конкретные радиусы. Для `circle` нужен один length; для
`ellipse` можно использовать два length или percentage значения. Для явного
diamond ellipse первое значение - это радиус по x, второе - радиус по y:

```css
diamond-gradient(40% 80% at 35% 65% in oklab, red 0%, yellow 50%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.explicitSize]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

## Позиция

Позиция двигает diamond-центр. Она всегда указывается после `at`.

Keyword-позиции используют x/y keywords:

```css
diamond-gradient(at top left, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.keywordPosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

gradiente нормализует keyword-позиции в порядок x/y. Например, `at top left`
сериализуется как `at left top`.

Value-позиции используют два length-percentage значения:

```css
diamond-gradient(at 25% 75%, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.valuePosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Текущий parser держит позиции строгими: keyword-позиции состоят только из
keywords, а value-позиции требуют два length-percentage токена. Смешанные
CSS-формы вроде `left 20px top 10px` пока не входят в эту модель.

## Stop-лист

Stop-лист определяет, какие цвета появляются, пока diamond раскрывается от
центра. На практике diamond-градиенту обычно нужны минимум два color stops.

Если у color stop нет явной позиции, gradiente вычисляет ее по соседним stops.
Первый неразрешенный color stop становится `0%`, последний становится `100%`, а
неразрешенные stops между известными позициями распределяются равномерно.

```css
diamond-gradient(red 0%, yellow 40%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.multiStop]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Color hints - это bare percentages между двумя color stops. Они не создают новый
color stop, а двигают воспринимаемую середину сегмента интерполяции.

```css
diamond-gradient(red 0%, 35%, blue 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.colorHint]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Double-position stops создают жесткие diamond-полосы. Цвет, записанный с двумя
позициями, хранится как два соседних color stops с одним и тем же цветом, а
потом по возможности сериализуется обратно в компактную форму.

```css
diamond-gradient(red 0% 35%, blue 35% 100%)
```

<div class="diamond-preview-block" v-for="example in [examples.doublePosition]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

## Интерполяция

Интерполяция управляет путем между цветами. Для diamond-градиентов она особенно
важна, потому что острый центр и диагональные полосы делают грязные середины или
резкие изменения hue очень заметными.

Дефолтное пространство интерполяции - `srgb`.

```css
diamond-gradient(in srgb, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.srgbInterpolation]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Перцепционные пространства вроде `oklab` часто дают более плавные переходы.

```css
diamond-gradient(at 25% 75% in oklab, red, blue)
```

<div class="diamond-preview-block" v-for="example in [examples.oklabInterpolation]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Полярные цветовые пространства могут использовать режимы hue-интерполяции.
gradiente поддерживает `shorter`, `longer`, `increasing` и `decreasing`.

```css
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

<div class="diamond-preview-block" v-for="example in [examples.oklchHue]" :key="example.id">
  <DiamondPreviewContent :example="example" />
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

## Повторяющиеся diamond-градиенты

`repeating-diamond-gradient(...)` использует тот же внутренний вид градиента, что
и `diamond-gradient(...)`. Префикс выставляет `isRepeating: true` в config, а
`type` экземпляра остается `diamond-gradient`.

```css
repeating-diamond-gradient(at center, red 0%, blue 20%)
```

<div class="diamond-preview-block" v-for="example in [examples.repeating]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Повторяющиеся diamond-градиенты полезны для жестких UI-колец, scan-эффектов,
генерируемых pattern-систем, isometric grids, warning fields и абстрактных
фонов.

## Программное создание

Большинству пользователей стоит начинать с `parse()`, потому что он принимает ту
же форму ввода, которую использует DSL. Когда градиент нужно собрать напрямую,
используйте `GradientDiamond`.

Конструктор принимает два параметра:

```txt
new GradientDiamond(stops, config?)
```

`stops` обязателен. `config` опционален, а пропущенные значения берутся из
дефолтов класса.

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

## Трансформация diamond-градиента

Каждый renderer target получает одну и ту же исходную модель. В этом главный
смысл Core API: один раз распарсить, много раз трансформировать.

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

У outputs трансформеров разные формы:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>Строка CSS background. Для diamond-градиентов это сгенерированный SVG data URL, потому что в CSS нет нативной функции `diamond-gradient()`.</span>
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
    <span>SVG pattern payload с `defs`, `url` и сериализованными SVG-данными.</span>
  </div>
</div>

## Нормализация

Используйте `format()` перед сохранением пользовательского ввода. Он парсит
строку во внутреннюю модель и сериализует ее обратно в каноническую строку
gradiente.

```ts
import { format } from 'gradiente'

const input = 'diamond-gradient(closest-side at 35% 45% in oklch, #ff74f6 0%, 42%, #405de6 100%)'
const normalized = format(input)
```

<div class="diamond-preview-block" v-for="example in [examples.format]" :key="example.id">
  <DiamondPreviewContent :example="example" />
</div>

Нормализация полезна, когда пользователи вводят градиенты вручную, когда
сохраняется состояние редактора или когда сгенерированным градиентам нужен
стабильный output для тестов и snapshots.

## Практический чеклист

Используйте этот порядок при создании или валидации diamond-градиента:

1. Решите, достаточно ли дефолтной `ellipse`-метрики или `circle` должен принудительно сделать x/y радиусы одинаковыми.
2. Выберите размер: extent keyword для адаптивного поведения или явные радиусы для контролируемой геометрии.
3. Выберите позицию через `at`, если diamond-центр должен уйти из дефолтного центра.
4. Выберите интерполяцию: `srgb` для простой совместимости, `oklab` или `oklch` для более плавных переходов.
5. Добавьте минимум два color stops, чтобы получить полезный визуальный результат.
6. Добавьте явные позиции stops, если ширина полос должна переживать редактирование.
7. Используйте color hints, когда нужно сдвинуть середину перехода.
8. Используйте double-position stops, когда нужны жесткие diamond-полосы.
9. Используйте `format()` перед сохранением пользовательского ввода.
10. Используйте `transformTo()` для renderer output вместо попыток вручную конвертировать строку.

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
