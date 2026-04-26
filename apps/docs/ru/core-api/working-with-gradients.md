# Парсинг градиента

```ts
import { parse } from 'gradiente'

const gradient = parse(
  'linear-gradient(to right, red, blue)'
)
```


## Метаданные градиента

```ts
gradient.type
gradient.isRepeating
gradient.config
gradient.stops
```


### Пример

```ts
gradient.type        // 'linear-gradient'
gradient.isRepeating // false
gradient.config      // direction, angle, etc.
gradient.stops       // array of stops
```


## Работа с градиентнымм стопами

Стопы - это массивы данных хранящие базовую информацию о градиенте (цвет, позиция, точка смещения центра):

```ts
gradient.stops
```


### Добавление градиентного стопа

```ts
gradient.addStop({
  color: 'green',
  position: 0.5
})
```


### Удаление стопа

Удаление происходит по индексу
```ts
// Stops removing by it's index
gradient.removeStop(0)
```


## Клонирование градиента

Создаёт безопасную копию
```ts
const copy = gradient.clone()
```


## Сравнение градиентов

Может быть полезен при дебаг режиме
```ts
gradient.equals(copy) // true
```


## Обратная конвертация в строку

```ts
gradient.toString()
```


### Пример

```ts
// → normalized output
parse('linear-gradient(red, blue)').toString()
```


## Конвертация в JSON

```ts
gradient.toJSON()
```


### Пример

```ts
{
  type: 'linear-gradient',
  isRepeating: false,
  config: {...},
  stops: [...]
}
```


## Базовое использование

```ts
const gradient = parse(input)

// inspect
gradient.stops

// modify
gradient.addStop({ color: 'green', position: 0.5 })

// serialize
const output = gradient.toString()
```


## Итог

```txt
parse → get gradient object
inspect → read properties
modify → add/remove stops
clone → safe copy
equals → compare gradients
toString → serialize to string
toJSON → serialize to data
```