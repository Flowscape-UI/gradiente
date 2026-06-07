# Radial Gradients

Радиальный градиент сэмплит цвета по расстоянию от центральной точки. Расстояние
может быть круговым или эллиптическим, а размер может выводиться из render box
или задаваться явно.

<GradientPreview
  title="Radial gradient rendered by Gradiente"
  gradient="radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 18%, #fb7655 58%, #405de6 100%)"
  caption="Центр, размер, color space и stop-точки взяты из этой строки Gradiente."
/>

## Анатомия

```css
radial-gradient(
  [shape]
  [size]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

Radial config может содержать форму, размер, позицию и интерполяцию в одном
элементе перед stop-листом.

## Shape

```css
radial-gradient(circle, red, blue)
radial-gradient(ellipse, red, blue)
```

`circle` использует один радиус. `ellipse` использует горизонтальный и
вертикальный радиусы.

Дефолт:

```txt
shape: "ellipse"
```

## Size

Размер может быть extent keyword или явными length-percentage значениями.

```css
radial-gradient(circle closest-side, red, blue)
radial-gradient(circle farthest-corner, red, blue)
radial-gradient(ellipse 40% 70%, red, blue)
```

Extent keywords:

```txt
closest-side
closest-corner
farthest-side
farthest-corner
```

Дефолт:

```txt
size: "farthest-corner"
```

Для ellipse два явных значения описывают horizontal и vertical radius. Для circle
достаточно одного значения.

## Position

Центр задается через `at`.

```css
radial-gradient(circle at center, red, blue)
radial-gradient(circle at left top, red, blue)
radial-gradient(circle at 30% 35%, red, blue)
```

Gradiente хранит позицию как keywords или length-percentage values:

```ts
import { parse } from 'gradiente'

const gradient = parse('radial-gradient(circle at 30% 35%, red, blue)')

console.log(gradient.getConfig().position)
```

Дефолт:

```txt
position: "center center"
```

## Stop-точки и hints

Radial использует ту же stop-модель, что и linear:

```css
radial-gradient(circle, red, blue)
radial-gradient(circle, red 0%, yellow 35%, blue 100%)
radial-gradient(circle, red 0%, 25%, blue 100%)
```

Позиция stop-точки описывает расстояние от центра, а не x/y координату.

## Интерполяция

```css
radial-gradient(circle in srgb, red, blue)
radial-gradient(circle in oklch, red, blue)
radial-gradient(circle in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```

Интерполяция применяется вдоль радиуса после вычисления геометрического
расстояния.

<GradientPreview
  title="Offset radial in OKLCH"
  gradient="radial-gradient(ellipse farthest-corner at 70% 35% in oklch longer hue, hsl(325, 64%, 54%) 0%, hsl(30, 85%, 58%) 45%, hsl(208, 94%, 47%) 100%)"
/>

## Дефолты

```txt
shape: "ellipse"
size: "farthest-corner"
position: "center center"
interpolation.colorSpace: "srgb"
isRepeating: false
```

Дефолты убираются из normalized string.

```ts
import { format } from 'gradiente'

// "radial-gradient(red, blue)"
console.log(format('radial-gradient(ellipse farthest-corner at center center in srgb, red, blue)'))
```

## Repeating radial gradients

```ts
import { parse } from 'gradiente'

const gradient = parse('repeating-radial-gradient(circle, red 0%, blue 12%)')

// true
console.log(gradient.isRepeating())

// "repeating-radial-gradient(circle, red 0%, blue 12%)"
console.log(gradient.toString())
```

## Трансформация

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'radial-gradient(circle at 25% 30%, #fff 0%, #ff74f6 25%, #405de6 100%)'
)

const css = transformTo('css', gradient)
```

## Как создать самому

1. Реши, нужен circle или ellipse.
2. Выбери центр через `at ...`.
3. Используй extent keyword, если градиент должен адаптироваться к box.
4. Используй явный size, если радиус должен быть контролируемым.
5. Добавь stops по расстоянию от центра.
6. Используй perceptual interpolation для мягких glow.

```css
radial-gradient(circle closest-side at 30% 35% in oklch, #fff 0%, #ff74f6 18%, #405de6 100%)
```

## Что тестировать

```css
radial-gradient(red, blue)
radial-gradient(circle closest-side at left top, red, blue)
radial-gradient(ellipse 40% 70% at 30% 80%, red, blue)
radial-gradient(circle at 30% 35%, red 0%, 45%, blue 100%)
radial-gradient(circle at 30% 35% in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
```
