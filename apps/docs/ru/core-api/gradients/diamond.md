# Diamond Gradients

`diamond-gradient` - это Gradiente-specific тип. Он использует radial-style
конфигурацию, но расстояние измеряется через diamond field, а не через круг или
эллипс.

<GradientPreview
  title="Diamond gradient rendered by Gradiente"
  gradient="diamond-gradient(farthest-corner at center in oklch, #5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)"
  caption="Это не нативная CSS-функция. Превью рендерится через CSS-трансформер Gradiente."
/>

## Анатомия

```css
diamond-gradient(
  [shape]
  [size]
  [at position]
  [in color-space [hue-mode hue]],
  color-stop,
  ...
)
```

Синтаксис специально похож на `radial-gradient`. Так проще переходить между
radial и diamond эффектами.

## Отличие от radial

В radial equal-distance точки образуют круги или эллипсы. В diamond equal-distance
точки образуют ромбовидные кольца. Визуально это дает более геометричный переход
от центра.

```css
radial-gradient(circle at center, red, blue)
diamond-gradient(at center, red, blue)
```

Оба градиента могут иметь одинаковые stop-точки и интерполяцию, но distance field
у них разный.

## Shape, size и position

`diamond-gradient` переиспользует radial config parser:

```css
diamond-gradient(at center, red, blue)
diamond-gradient(at left top, red, blue)
diamond-gradient(closest-side at 30% 35%, red, blue)
diamond-gradient(farthest-corner at center, red, blue)
```

Дефолты:

```txt
shape: "ellipse"
size: "farthest-corner"
position: "center center"
interpolation.colorSpace: "srgb"
isRepeating: false
```

`shape` принимается для domain consistency с radial gradients. Визуальный итог
все равно считается через diamond distance model.

## Stops и interpolation

Stop-точки ведут себя как radial stops: позиции описывают расстояние от центра.

```css
diamond-gradient(#5851db 0%, #c13584 35%, #fcb045 70%, #405de6 100%)
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
diamond-gradient(red 0%, 40%, blue 100%)
```

Color hints и double-position stops работают так же, как в других stop-based
градиентах.

## Нормализация

```ts
import { format, parse } from 'gradiente'

const gradient = parse(
  'diamond-gradient(farthest-corner at center in oklch, #5851db, #fcb045)'
)

// "diamond-gradient"
console.log(gradient.type)

// "diamond-gradient(in oklch, #5851db, #fcb045)"
console.log(format(gradient))
```

Дефолтный size и center исчезают из строки, а non-default interpolation остается.

## Трансформация

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'diamond-gradient(at 45% 40%, #5851db 0%, #c13584 35%, #fcb045 100%)'
)

const cssBackground = transformTo('css', gradient)
```

Для CSS трансформер возвращает renderable adapter output. В документации превью
использует `transformTo('css', gradient)`, поэтому custom-типы видны даже без
нативной CSS-поддержки браузера.

## Как создать самому

1. Начни с идеи radial gradient.
2. Замени `radial-gradient` на `diamond-gradient`.
3. Оставь центр через `at ...`.
4. Используй `closest-side` для плотного центра или `farthest-corner` для full coverage.
5. Добавь stops по расстоянию от центра.
6. Используй `in oklch`, если нужен более мягкий color path.

```css
diamond-gradient(at 50% 45% in oklch, #5851db 0%, #c13584 35%, #fcb045 75%, #405de6 100%)
```

## Что тестировать

```css
diamond-gradient(red, blue)
diamond-gradient(at left top, red, blue)
diamond-gradient(closest-side at 30% 35%, red 0%, 50%, blue 100%)
diamond-gradient(red 0% 30%, blue 30% 100%)
diamond-gradient(in oklch longer hue, hsl(325, 64%, 54%), hsl(208, 94%, 47%))
repeating-diamond-gradient(at center, red 0%, blue 12%)
```
