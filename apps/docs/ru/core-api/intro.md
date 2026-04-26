# Ключевое API

gradiente предоставляет небольшой публичный API для парсинга, проверки, форматирования и трансформации градиентов.

## parse

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
````

`parse()` конвертирует строку градиента в объект

Под капотом gradiente токенизирует строку, строит ABI и создаёт соответствующий класс градиента.

## isGradient

```ts
import { isGradient } from 'gradiente'

isGradient('linear-gradient(red, blue)') // true
isGradient('hello world') // false
```

Используя это для безопасной валидации

## format

```ts
import { format } from 'gradiente'

format('linear-gradient(to right, red, blue)')
```

`format()` конвертирует строку или объект в нормализованную строку градиента

It also accepts an existing gradient object:

```ts
const gradient = parse('linear-gradient(red, blue)')

format(gradient)
```

## transformTo

```ts
import { transformTo } from 'gradiente'

const css = transformTo('css', 'linear-gradient(to right, red, blue)')
```

`transformTo()` переводит строковый градиент в градиент для любой таргетированнной системы

Примеры:
```txt
css
canvas
konva
pixi
```

Некоторые будут добавлены в будущих релизах или сделаны под ключ для своих целей

## transformFrom

```ts
import { transformFrom } from 'gradiente'

const gradient = transformFrom('css', 'linear-gradient', {
  // target-specific input
})
```

`transformFrom()` переводит обратно в gradiente формат

## Модель работы

```txt
string
  ↓ parse()
gradient object
  ↓ format()
string

gradient object
  ↓ transformTo()
target format

target format
  ↓ transformFrom()
gradient object
```

## Заключение

Используй:
```txt
parse        → create gradient object
isGradient   → validate input safely
format       → normalize to string
transformTo  → export to target format
transformFrom → import from target format
```