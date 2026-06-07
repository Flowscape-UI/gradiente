# Linear Gradients

Линейный градиент - это цветовая линия, спроецированная на прямоугольник.
Каждый пиксель сопоставляется с этой линией, после чего Gradiente сэмплит
отсортированные stop-точки.

<GradientPreview
  title="Linear gradient rendered by Gradiente"
  gradient="linear-gradient(120deg in oklch, #ff74f6 0%, #fb7655 45%, #405de6 100%)"
  caption="Превью отрисовано из той же строки Gradiente, которая показана в примере."
/>

## Анатомия

```css
linear-gradient(
  [direction]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

Первый элемент до запятой может быть конфигом. Все последующие элементы относятся
к stop-листу.

```css
linear-gradient(to right in oklch, red 0%, 35%, blue 100%)
```

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>direction</strong>
    <span>`to right`, `to top left`, `90deg`, `0.25turn` или другой angle token.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>color-space</strong>
    <span>`srgb`, `oklab`, `oklch`, `lab`, `lch`, `display-p3` и другие поддерживаемые пространства.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>hue-mode</strong>
    <span>`shorter`, `longer`, `increasing`, `decreasing`. Работает для polar spaces: `hsl`, `lch`, `oklch`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>color-stop</strong>
    <span>Цвет и ноль, одна или две процентные позиции. Голый процент между цветами - это color hint.</span>
  </div>
</div>

## Направление

CSS keywords описывают, куда идет градиент:

```css
linear-gradient(to right, red, blue)
linear-gradient(to top left, red, blue)
```

Числовые углы тоже поддерживаются:

```css
linear-gradient(90deg, red, blue)
linear-gradient(0.25turn, red, blue)
```

Gradiente хранит направление как нормализованный угол в радианах. Сериализатор
возвращает распространенные углы в читаемые CSS keywords.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const config = gradient.getConfig()

console.log(config.angle)
```

## Stop-точки

Stop-лист управляет тем, где цвета находятся на линии.

```css
linear-gradient(red, blue)
linear-gradient(red 0%, blue 100%)
linear-gradient(red 0%, yellow 40%, blue 100%)
```

Если позиция не указана, Gradiente выводит ее из соседних stop-точек. Первая
неразрешенная цветовая точка становится `0%`, последняя становится `100%`,
середина распределяется равномерно.

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, yellow, blue)')

console.log(gradient.getStops())
```

## Color hints

Color hint - это процент без цвета. Он сдвигает середину интерполяции между
соседними цветами.

```css
linear-gradient(to right, red 0%, 35%, blue 100%)
```

Это не третий цвет. Это указание, что визуальная середина между red и blue должна
быть на `35%`, а не на `50%`.

## Double-position stops

Один цвет может занимать жесткий диапазон:

```css
linear-gradient(to right, red 0% 35%, blue 35% 100%)
```

Gradiente хранит это как две соседние color-stop с одинаковым цветом и при
возможности сериализует обратно в compact double-position форму.

## Интерполяция

```css
linear-gradient(in srgb, red, blue)
linear-gradient(in oklch, red, blue)
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

`oklab` и `oklch` полезны для более плавных визуальных переходов. `srgb` нужен,
когда важнее CSS-default поведение.

<GradientPreview
  title="OKLCH with hue path"
  gradient="linear-gradient(135deg in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 55%, hsl(208, 94%, 47%) 100%)"
/>

## Дефолты

```txt
angle: Math.PI
interpolation.colorSpace: "srgb"
isRepeating: false
```

Дефолты не выводятся в `toString()`.

```ts
import { format } from 'gradiente'

// "linear-gradient(red, blue)"
console.log(format('linear-gradient(180deg in srgb, red 0%, blue 100%)'))
```

## Repeating linear gradients

Repeating-градиент сохраняет тот же internal type, а repeating flag хранится в
config.

```ts
import { parse } from 'gradiente'

const gradient = parse('repeating-linear-gradient(to right, red 0%, blue 10%)')

// "linear-gradient"
console.log(gradient.type)

// true
console.log(gradient.isRepeating())

// "repeating-linear-gradient(to right, red 0%, blue 10%)"
console.log(gradient.toString())
```

## Трансформация

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'linear-gradient(135deg in oklch longer hue, #ff74f6, #405de6)'
)

const css = transformTo('css', gradient)
```

## Как создать самому

1. Выбери направление: keyword для читабельности, angle для generated data.
2. Выбери интерполяцию: `srgb` для CSS parity, `oklab` или `oklch` для плавности.
3. Добавь минимум две color-stop.
4. Укажи позиции явно, если визуал должен быть стабильным.
5. Используй hints только когда нужно сдвинуть midpoint перехода.
6. Нормализуй пользовательский ввод через `format()`.

```ts
import { format } from 'gradiente'

const input = 'linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)'

// "linear-gradient(to right in oklch, #ff74f6 0%, 42%, #405de6 100%)"
console.log(format(input))
```

## Что тестировать

```css
linear-gradient(red, blue)
linear-gradient(to top left, red 0%, blue 100%)
linear-gradient(450deg, red, blue)
linear-gradient(to right, red 0%, 35%, blue 100%)
linear-gradient(red 0% 35%, blue 35% 100%)
linear-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```
