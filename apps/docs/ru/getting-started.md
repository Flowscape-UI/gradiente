# Быстрый старт

gradiente - это инструмент для работы с градиентами как со структурированными
данными.

Он умеет парсить строку градиента, нормализовать ее, читать как объект и
преобразовывать в output для CSS, Canvas 2D, WebGL или SVG.

<GradientPreview
  title="Первый градиент gradiente"
  gradient="linear-gradient(to right in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  caption="Это превью отрисовано из той же строки через transformTo('css', gradient)."
/>

## Установка

Установи пакет из npm:

```bash
npm install gradiente
```

gradiente рассчитан на современные ESM-проекты и хорошо работает с Vite,
Rollup, Webpack и похожими сборщиками.

## Первый Градиент

Начни с `parse()`. Эта функция читает строку градиента и возвращает нужный
объект gradiente.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient"
console.log(gradient.type)

// "linear-gradient(to right, red, blue)"
console.log(gradient.toString())
```

`parse()` бросает ошибку, если строка не является поддерживаемым градиентом.
Для безопасной проверки пользовательского ввода используй `isGradient()`.

```ts
import { isGradient, parse } from 'gradiente'

const input = 'linear-gradient(to right, red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)

  // "linear-gradient"
  console.log(gradient.type)
}
```

## Использование Трансформеров

Используй `transformTo()`, когда нужно отправить один и тот же градиент в
конкретный renderer. В gradiente сейчас есть четыре встроенных transformer
targets:

```txt
css
canvas-2d
canvas-webgl
svg
```

### CSS

Используй `transformTo('css', gradient)`, когда нужен CSS background value.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const css = transformTo('css', gradient)

// "linear-gradient(to right, red, blue)"
console.log(css)
```

В браузере результат можно сразу записать в `backgroundImage`.

```ts
import { transformTo } from 'gradiente'

const preview = document.querySelector<HTMLElement>('.preview')
const css = transformTo('css', 'linear-gradient(to right, red, blue)')

if (preview) {
  preview.style.backgroundImage = css
}
```

Для gradiente-specific типов, например `diamond-gradient` и `mesh-gradient`,
CSS-трансформер возвращает renderable adapter background, потому что в браузерах
нет нативных CSS-функций для таких градиентов.

```ts
import { transformTo } from 'gradiente'

const css = transformTo(
  'css',
  'diamond-gradient(at center in oklch, #5851db, #fcb045)'
)

// true
console.log(css.startsWith('url("data:image/svg+xml'))
```

### Canvas 2D

Canvas 2D transformer возвращает paint object с методом `draw()`.

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')
const paint = transformTo(
  'canvas-2d',
  'radial-gradient(circle at 30% 35%, #fff 0%, #ff74f6 35%, #405de6 100%)'
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

### Canvas WebGL

WebGL transformer тоже возвращает paint object, но рисует напрямую в canvas
element.

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

### SVG

SVG transformer возвращает описание paint server. Вставь `defs` в SVG и примени
`url` к фигуре, которую нужно залить.

```ts
import { transformTo } from 'gradiente'

const svg = document.querySelector<SVGSVGElement>('svg')
const rect = svg?.querySelector<SVGRectElement>('rect')
const paint = transformTo(
  'svg',
  'linear-gradient(to right, #ff74f6, #405de6)'
)

if (svg && rect) {
  svg.insertAdjacentHTML('afterbegin', paint.defs)
  rect.setAttribute('fill', paint.url)
}
```

## Нормализация Ввода

Используй `format()` перед сохранением пользовательского ввода. Функция парсит
градиент и сериализует его обратно в каноническую строку gradiente.

```ts
import { format } from 'gradiente'

const normalized = format(
  'conic-gradient(from 74deg, red, blue 72%, yellow 63%)'
)

// "conic-gradient(from 74deg, red 0%, yellow 63%, blue 72%)"
console.log(normalized)
```

Нормализация полезна для редакторов, сохраненных пресетов, тестов и
сгенерированных градиентов.

## Чтение Данных

После парсинга градиент можно читать как данные.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

console.log(gradient.getConfig())

if ('getStops' in gradient) {
  console.log(gradient.getStops())
}
```

Большинство встроенных градиентов основаны на stop-точках. `mesh-gradient`
устроен иначе: он хранит вершины и патчи, а не простой список stops.

## Использование Всех Типов Градиентов

В gradiente сейчас есть пять встроенных типов. Один и тот же публичный API
работает для всех.

<div class="gradient-preview-grid">
  <GradientPreview
    title="Linear"
    gradient="linear-gradient(to right in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  />
  <GradientPreview
    title="Radial"
    gradient="radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 30%, #405de6 100%)"
  />
  <GradientPreview
    title="Diamond"
    gradient="diamond-gradient(at center in oklch, #5851db 0%, #c13584 40%, #fcb045 100%)"
  />
  <GradientPreview
    title="Conic"
    gradient="conic-gradient(from 74deg at 50% 50%, #d53f96 0%, #ef9439 63%, #077fe9 100%)"
  />
  <GradientPreview
    title="Mesh"
    gradient="mesh-gradient(grid 2 2 method bicubic in oklab, vertex v00 0% 0% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 0% 100% #fb7655, vertex v11 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01)"
  />
</div>

Та же идея в коде:

```ts
import { transformTo } from 'gradiente'

const gradients = {
  linear: 'linear-gradient(to right, #ff74f6, #405de6)',
  radial: 'radial-gradient(circle at 30% 35%, #fff, #ff74f6, #405de6)',
  diamond: 'diamond-gradient(at center in oklch, #5851db, #fcb045)',
  conic: 'conic-gradient(from 74deg at 50% 50%, #d53f96, #ef9439 63%, #077fe9)',
  mesh: 'mesh-gradient(grid 2 2 method bicubic in oklab, vertex v00 0% 0% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 0% 100% #fb7655, vertex v11 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01)',
}

for (const [name, input] of Object.entries(gradients)) {
  const element = document.querySelector<HTMLElement>(
    `[data-gradient="${name}"]`
  )

  if (element) {
    element.style.backgroundImage = transformTo('css', input)
  }
}
```

## Что Читать Дальше

- [Типы градиентов](/ru/core-api/gradients/) подробно объясняют каждый встроенный градиент.
- [Core API](/ru/core-api/intro) объясняет `parse`, `format` и `transformTo`.
- [Трансформеры](/ru/core-api/transformers) объясняют CSS, Canvas, WebGL и SVG output.
- [Pattern DSL](/ru/dsl/what-is-dsl) нужен для кастомных правил валидации.
- [Playground](https://flowscape-ui.github.io/gradiente/playground/) помогает визуально проверить поведение gradiente.
