# Conic Gradients

Конический градиент сэмплит цвета по углу вокруг центральной точки. Позиции
stop-точек описывают rotation progress, а не расстояние.

<GradientPreview
  title="Conic gradient rendered by Gradiente"
  gradient="conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%), hsl(3, 69%, 66%) 72%, hsl(30, 85%, 58%) 63%, hsl(208, 94%, 47%))"
  caption="Gradiente нормализует stop-точки не по порядку перед созданием adapter output."
/>

## Анатомия

```css
conic-gradient(
  [from angle]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

Конфиг описывает старт angular sampling и позицию центра.

## Start angle

```css
conic-gradient(from 90deg, red, blue)
conic-gradient(from 0.25turn, red, blue)
```

Дефолт:

```txt
from: 0deg
```

Угол нормализуется во внутренней модели и сериализуется в читаемую форму.

## Position

```css
conic-gradient(at center, red, blue)
conic-gradient(at 35% 45%, red, blue)
conic-gradient(from 74deg at 50% 50%, red, blue)
```

Дефолт:

```txt
position: "center center"
```

## Stop-точки

Conic stop positions сопоставляются с angular progress вокруг центра.

```css
conic-gradient(red, blue)
conic-gradient(red 0%, yellow 25%, blue 100%)
conic-gradient(red 0deg, yellow 90deg, blue 360deg)
```

Текущая внутренняя stop-модель Gradiente нормализует позиции как проценты. Если
нужен deterministic output, лучше задавать percentage stops.

## Порядок stop-точек

Gradiente сортирует resolved stop positions. Поэтому такой input:

```css
conic-gradient(
  from 74deg at 50% 50%,
  hsl(325, 64%, 54%),
  hsl(3, 69%, 66%) 72%,
  hsl(30, 85%, 58%) 63%,
  hsl(208, 94%, 47%)
)
```

нормализуется так:

```ts
import { format } from 'gradiente'

const input = `conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%), hsl(3, 69%, 66%) 72%, hsl(30, 85%, 58%) 63%, hsl(208, 94%, 47%))`

// "conic-gradient(from 74deg at 50% 50%, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 63%, hsl(3, 69%, 66%) 72%, hsl(208, 94%, 47%) 100%)"
console.log(format(input))
```

Это удобно для редакторов, потому что сохраненная строка становится канонической.

## Hard angular edges

Две stop-точки в одной позиции создают жесткую angular boundary.

```css
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
```

Gradiente сохраняет double-position stops через общую stop-модель.

## Интерполяция

```css
conic-gradient(in srgb, red, blue)
conic-gradient(in oklch, red, blue)
conic-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

Интерполяция происходит между angular stops.

<GradientPreview
  title="Conic OKLCH hue interpolation"
  gradient="conic-gradient(from 25deg at 50% 50% in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 35%, hsl(208, 94%, 47%) 100%)"
/>

## Трансформация

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'conic-gradient(from 74deg at center in oklch, #d53f96, #ef9439, #077fe9)'
)

const css = transformTo('css', gradient)
```

## Как создать самому

1. Выбери центр через `at ...`.
2. Выбери rotation offset через `from ...`.
3. По возможности добавляй stops в angular order.
4. Используй одинаковые позиции для hard wedges.
5. Нормализуй пользовательский input через `format()`.
6. Используй `oklch` hue modes для color wheels и hue transitions.

## Что тестировать

```css
conic-gradient(red, blue)
conic-gradient(from 450deg, red, blue)
conic-gradient(from 74deg at 50% 50%, red, blue 72%, yellow 63%, cyan)
conic-gradient(red 0% 25%, blue 25% 50%, yellow 50% 100%)
conic-gradient(from 0deg in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
repeating-conic-gradient(from 45deg, red 0%, blue 12%)
```
