# Кастомные трансформеры

gradiente можно расширять с помощью кастомных трансформеров.  
Это позволяет поддерживать любые системы рендеринга и форматы данных.


## Идея

Трансформер - это модуль, который знает, как преобразовать градиент в конкретную target-систему.

```txt id="r0o9fi"
gradient → transformer → output
```


## Базовый интерфейс

Трансормер должен имплиментировать:

```ts id="6nqzmn"
interface IGradientTransformerModule<TOutput> {
  target: string
  gradientType: string

  to(input: GradientBase<any>): TOutput
  from?(input: TOutput): GradientBase<any>
}
```


## Базовый пример

```ts
import { LinearGradient } from 'gradiente'

class MyCssTransformer {
  target = 'my-css'
  gradientType = 'linear-gradient'

  to(input: GradientBase<any>) {
    if (!(input instanceof LinearGradient)) {
      throw new Error('Expected LinearGradient')
    }

    return input.toString()
  }
}
```


## Регистрация трансформера

```ts
import { GradientTransformer } from 'gradiente'

GradientTransformer.add(new MyCssTransformer())
```


## Использование

```ts
transformTo('my-css', 'linear-gradient(red, blue)')
```


## Canvas пример (концепт)

```ts
class CanvasTransformer {
  target = 'canvas'
  gradientType = 'linear-gradient'

  to(input: GradientBase<any>) {
    return {
      draw(ctx, width, height) {
        // draw gradient
      }
    }
  }
}
```


## Обратная транформация

При необходимости можно имплиментировать `from`:

```ts
// convert external format back to gradient
from(input) {
}
```


## Как выбираются модули

gradiente выбирает трансформер на основе:
```txt
target + gradientType
```

Пример:

```txt
css + linear-gradient
canvas + radial-gradient
```


## Ментальная модель

```txt
target = where you want to go
gradientType = what you are converting
```


## Встроенные модули

gradiente уже включает:

- CSS transformers
- Canvas transformers

И возможность строить свои трансформеры.
В будущем список будет пополняться


## Почему это круто

Это позволяет:
- интегрировать gradiente в любой движок
- поддерживать кастомные рендер-пайплайны
- строить адаптеры для инструментов (Konva, Pixi, WebGL и др.)


## Итог

```txt
implement → register → use
```