# Примеры

На этой странице собраны практические примеры работы с gradiente - от базового парсинга до расширенных возможностей.

## 1. Парсинг градиента

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient"
console.log(gradient.type)

// false
console.log(gradient.isRepeating)

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 }
// ]
console.log(gradient.stops)
```


## 2. Проверка строки на градиент

```ts
import { isGradient } from 'gradiente'

// true
console.log(isGradient('linear-gradient(red, blue)'))

// false
console.log(isGradient('hello world'))
```

Использовать перед парсингом пользовательского ввода.


## 3. Форматирование градиента

```ts
import { format } from 'gradiente'

// "linear-gradient(red, blue)"
console.log(format('linear-gradient(red,blue)'))
```

`format()` парсит входные данные и сериализует их обратно в нормализованную строку.

## 4. Просмотр конфигурации градиента

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// Angles transforming in radians
// {
//   angle: 1.570796
// }
console.log(gradient.config)
```

Точная конфигурация зависит от типа градиента.

Для линейного градиента конфигурация обычно содержит нормализованные данные направления, например угол.


## 5. Преобразование градиента обратно в строку

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient(90deg, red, blue)"
console.log(gradient.toString())
```

`toString()` используется, когда нужно получить CSS-подобную строку градиента.


## 6. Преобразование градиента в JSON

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')

// {
//   type: "linear-gradient",
//   isRepeating: false,
//   config: {
//     angles: 0,
//   },
//   stops: [
//     { type: "color-stop", value: "red", position: 0 },
//     { type: "color-stop", value: "blue", position: 1 }
//   ]
// }
console.log(gradient.toJSON())
```

`toJSON()` используется, когда нужно сохранить данные градиента.


## 7. Клонирование градиента

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
const copy = gradient.clone()

// "linear-gradient(red, blue)"
console.log(copy.toString())

// true
console.log(gradient.equals(copy))
```

`clone()` используется, когда нужно изменить градиент, не затрагивая исходный объект.


## 8. Добавь color stop

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
gradient.addStop({
  type: 'color-stop',
  value: 'green',
  position: 0.5
})

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 },
//   { type: "color-stop", value: "green", position: 0.5 }
// ]
console.log(gradient.stops)

// "linear-gradient(red, blue, green 50%)"
console.log(gradient.toString())
```

`position` нормализуется в диапазоне от `0` до `1`. Но можно и выйти за эти пределы

```ts
0   // 0%
0.5 // 50%
1   // 100%
```


## 9. Добавление color hint

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
gradient.addStop({
  type: 'color-hint',
  value: '50%',
  position: 0.5
})

console.log(gradient.stops)
// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 },
//   { type: "color-hint", value: "50%", position: 0.5 }
// ]
```

`color-hint` - это не цветовой стоп.

Он задаёт точку интерполяции между соседними цветовыми стопами.


## 10. Удаление стопа

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, green, blue)')
gradient.removeStop(1)

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 }
// ]
console.log(gradient.stops)

console.log(gradient.toString())
// "linear-gradient(red, blue)"
```

`removeStop(index)` удаляет стоп по индексу в массиве.


## 11. Валидация перед парсингом

```ts
import { isGradient, parse } from 'gradiente'

const input = 'linear-gradient(red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)

  console.log(gradient.toString())
  // "linear-gradient(red, blue)"
}
```

Используется при работе с пользовательским вводом.


## 12. Обработка некорректного ввода

```ts
import { parse } from 'gradiente'

try {
  const gradient = parse('not-a-gradient')

  console.log(gradient)
} catch (error) {
  // Example:
  // "No gradient registered for: not-a-gradient"
  console.log(error instanceof Error ? error.message : 'Invalid gradient')
}
```

`parse()` выбрасывает ошибку, если входные данные нельзя преобразовать в зарегистрированный тип градиента.


## 13. Парсинг повторяющихся градиентов

```ts
import { parse } from 'gradiente'

const gradient = parse(
  'repeating-linear-gradient(to right, red 0%, blue 10%)'
)

// "linear-gradient"
console.log(gradient.type)

// true
console.log(gradient.isRepeating)

// "repeating-linear-gradient(to right, red 0%, blue 10%)"
console.log(gradient.toString())
```

Повторяющиеся градиенты сохраняют тот же тип, но `isRepeating` устанавливается в `true`.


## 14. Трансформация в CSS

```ts
import { transformTo } from 'gradiente'

const css = transformTo<string>(
  'css',
  'linear-gradient(to right, red, blue)'
)

// "linear-gradient(to right, red, blue)"
console.log(css)
```

CSS-трансформер возвращает строку.


## 15. Преобразование существующего градиента

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
const css = transformTo<string>('css', gradient)

// "linear-gradient(red, blue)"
console.log(css)
```

`transformTo()` принимает как строки, так и объекты градиента.


## 16. Преобразование в Canvas

```ts
import { transformTo } from 'gradiente'

const paint = transformTo(
  'canvas',
  'linear-gradient(to right, red, blue)'
)

// "function"
console.log(typeof paint.draw)
```

Canvas-трансформеры возвращают результат для отрисовки.

Его можно отрисовать вручную:

```ts
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

paint.draw(ctx, canvas.width, canvas.height)
```


## 17. Использование с canvas-элементом

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

const paint = transformTo(
  'canvas',
  'linear-gradient(45deg, red, blue)'
)
paint.draw(ctx, canvas.width, canvas.height)


// "Gradient drawn"
console.log('Gradient drawn')
```


## 18. Преобразование из другого формата

```ts
import { transformFrom } from 'gradiente'

const gradient = transformFrom(
  'css',
  'linear-gradient',
  'linear-gradient(to right, red, blue)'
)

// "linear-gradient(to right, red, blue)"
console.log(gradient.toString())
```

`transformFrom()` преобразует данные target-системы обратно в объект градиента Gradiente.


## 19. Валидация выражения Pattern DSL

```ts
import { validatePattern } from 'gradiente'

validatePattern('^[color-stop,~color-stop].')

// "Pattern is valid"
console.log('Pattern is valid')
```

`validatePattern()` выбрасывает ошибку, если паттерн некорректен.


## 20. Безопасная проверка Pattern DSL

```ts
import { isPatternValid } from 'gradiente'

// true
console.log(isPatternValid('^[color-stop,~color-stop].'))

// false
console.log(isPatternValid('color-stop'))
```

`isPatternValid()` используется, когда не требуется обрабатывать ошибки вручную.


## 21. Пример некорректного Pattern DSL

```ts
import { validatePattern } from 'gradiente'

try {
  validatePattern('^(config|color-stop)~color-stop.')
} catch (error) {
    // Example:
    // "Implicit sequence is not allowed"
  console.log(error instanceof Error ? error.message : 'Invalid pattern')
}
```

DSL не допускает неявные последовательности.

Вместо этого используется:

```ts
validatePattern('^[(config|color-stop),~color-stop].')
```


## 22. Кастомный трансформер

```ts
import {
  GradientTransformer,
  LinearGradient,
  transformTo,
  type GradientBase,
  type IGradientTransformerModule
} from 'gradiente'

class LinearGradientToDebug
  implements IGradientTransformerModule<string> {
  readonly target = 'debug'
  readonly gradientType = 'linear-gradient'

  to(input: GradientBase<any>): string {
    if (!(input instanceof LinearGradient)) {
      throw new Error('Expected LinearGradient')
    }

    return `Linear gradient with ${input.stops.length} stops`
  }
}

GradientTransformer.add(new LinearGradientToDebug())

const result = transformTo<string>(
  'debug',
  'linear-gradient(red, blue)'
)

// "Linear gradient with 2 stops"
console.log(result)
```

Кастомные трансформеры позволяют экспортировать градиенты в собственный target-формат.

## 23. Удаление кастомного трансформера

```ts
import { GradientTransformer } from 'gradiente'

const removed = GradientTransformer.remove(
  'debug',
  'linear-gradient'
)

// true
console.log(removed)
```

Используется, когда нужно удалить регистрацию трансформера.


## 24. Проверка зарегистрированного трансформера

```ts
import { GradientTransformer } from 'gradiente'

const transformer = GradientTransformer.get(
  'css',
  'linear-gradient'
)

// "css"
console.log(transformer?.target)

// "linear-gradient"
console.log(transformer?.gradientType)
```

Transformers are resolved by:

```txt
target + gradientType
```


## 25. Кастомный тип градиента

```ts
import {
  GradientBase,
  GradientFactory,
  parse,
  parseStringToAbi,
  type GradientAbi
} from 'gradiente'

type MyGradientConfig = {
  angle: number
}

class MyGradient extends GradientBase<MyGradientConfig> {
  readonly type = 'my-gradient'
  readonly isRepeating = false

  static fromString(input: string): MyGradient {
    return this.fromAbi(parseStringToAbi(input))
  }

  static fromAbi(abi: GradientAbi): MyGradient {
    if (abi.functionName !== 'my-gradient') {
      throw new Error('Expected my-gradient')
    }

    return new MyGradient({
      config: { angle: 0 },
      stops: [
        { type: 'color-stop', value: 'red', position: 0 },
        { type: 'color-stop', value: 'blue', position: 1 }
      ]
    })
  }

  toString(): string {
    return 'my-gradient(red, blue)'
  }
}

GradientFactory.add('my-gradient', MyGradient)

const gradient = parse('my-gradient(red, blue)')

// "my-gradient"
console.log(gradient.type)

// "my-gradient(red, blue)"
console.log(gradient.toString())
```

Этот пример намеренно упрощён.

В реальной реализации кастомный градиент должен преобразовывать ABI во внутреннюю конфигурацию и стопы.


## 26. Полный workflow

```ts
import {
  parse,
  isGradient,
  format,
  transformTo
} from 'gradiente'

const input = 'linear-gradient(to right, red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)
  gradient.addStop({
    type: 'color-stop',
    value: 'green',
    position: 0.5
  })

  const normalized = format(gradient)
  const css = transformTo<string>('css', gradient)
  const canvasPaint = transformTo('canvas', gradient)

  // "linear-gradient(to right, red, blue, green 50%)"
  console.log(normalized)

  // "linear-gradient(to right, red, blue, green 50%)"
  console.log(css)

  // "function"
  console.log(typeof canvasPaint.draw)
}
```


## Итог

Начни с простого:

```ts
parse(input)
```

Затем изучай и модифицируй:

```ts
gradient.stops
gradient.addStop(...)
gradient.toString()
```

Экспортируй под другие системы:

```ts
transformTo('css', gradient)
transformTo('canvas', gradient)
```

Расширя когда нужно:

```ts
GradientTransformer.add(...)
GradientFactory.add(...)
```