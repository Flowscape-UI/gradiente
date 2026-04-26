# Трансформеры

Градиенты в gradiente не привязаны к конкретной системе рендеринга.   Трансформеры позволяют преобразовывать их в разные target-системы, такие как CSS или Canvas.


## Базовое использование

```ts
import { transformTo } from 'gradiente'

const result = transformTo(
  'css',
  'linear-gradient(to right, red, blue)'
)
```


## Targets

Target определяет систему, в которую надо перевести градиент

Пример:
```txt
css
canvas
konva (future)
pixi (future)
```


## Пример: CSS

```ts
transformTo('css', 'linear-gradient(red, blue)')
```

вернёт:

```txt
linear-gradient(red, blue)
```


## Пример: Canvas

```ts
const paint = transformTo(
  'canvas',
  'linear-gradient(red, blue)'
)

paint.draw(ctx, width, height)
```


## Как это работает

Трансформер конвертирует градиент из строки в объект, затем этот объект переводится в другой формат.

```txt
string → parse → gradient → transform → target format
```


## Как это устроено

```txt
gradient object
  ↓
transformTo('target')
  ↓
output for that system
```


## Направление трансформации

Трансформеры работают в обе стороны:
```ts
transformTo('css', gradient)
transformFrom('css', 'linear-gradient', input)
```


## Почему они важны

Они позволяют gradiente действовать как мост между системами CSS, Canvas и другие:
- CSS
- Canvas
- rendering engines
- custom tools


## Ключевая особенность

> gradiente - не рендерер
> gradiente - структурирует строковые градиенты так, чтобы с ними было легко и удобно работать в разных системах


## Расширяемость

Gradiente можно расширять с помощью кастомных трансформеров.

Внутри каждый трансформер - это модуль, который определяет:

```ts
{
  target: string
  gradientType: string
  to(...)
  from?(...)
}
```

Это позволяет трансофмировать градиенты под любую систему

(Как создать кастомные трансформеры описано на следующей странице)


## Итог

```txt
transformTo   → export gradient
transformFrom → import gradient
targets       → define output system
modules       → implement conversion logic
```