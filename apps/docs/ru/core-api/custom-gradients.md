## Кастомные типы градиентов

gradiente не ограничивается встроенными CSS-градиентами. Можно зарегистрировать собственный тип градиента и использовать его через тот же публичный API:

```ts
parse(...)
isGradient(...)
format(...)
transformTo(...)
transformFrom(...)
```

Это то что делает gradiente расширяемым.


## Основная идея

Тип градиента - это не просто строковый формат.

В Gradiente тип градиента - это класс, который:
- читает ABI
- создаёт экземпляр градиента
- предоставляет структурированные свойства
- сериализуется обратно в строку
- работает с трансформерами


## Ментальная модель

```txt
gradient string
  ↓
parseStringToAbi()
  ↓
GradientFactory
  ↓
registered gradient class
  ↓
gradient object
```

Пример:

```ts
const gradient = parse('linear-gradient(to right, red, blue)')
```

Под капотом:

```txt
linear-gradient(...)
  ↓
ABI with functionName = "linear-gradient"
  ↓
GradientFactory.get("linear-gradient")
  ↓
LinearGradient.fromAbi(...)
  ↓
LinearGradient instance
```


## GradientFactory

`GradientFactory` - это реестр, который связывает имя функции градиента с классом градиента.

```ts
GradientFactory.add("linear-gradient", LinearGradient)
GradientFactory.add("radial-gradient", RadialGradient)
GradientFactory.add("conic-gradient", ConicGradient)
```

Когда `parse()` получает строку, Gradiente использует этот реестр, чтобы найти соответствующий класс.


## Обязательный статический интерфейс

Кастомный класс градиента должен реализовывать статический интерфейс градиента:

```ts
export interface IGradientStatic<TGradient extends GradientBase = GradientBase> {
  fromAbi(abi: GradientAbi): TGradient
  fromString(input: string): TGradient
}
```

Это означает, что каждый зарегистрированный класс градиента должен уметь создаваться из:
- ABI
- строки


## Интерфейс экземпляра

Экземпляр градиента должен вести себя так же, как и любой другой градиент:

```ts
export interface IGradientBase<TConfig = unknown> {
  readonly type: GradientType
  readonly isRepeating: boolean
  readonly config: TConfig
  readonly stops: GradientStop[]

  clone(): this
  toString(): string
  toJSON(): GradientData<TConfig>
  addStop(stop: GradientStop): void
  removeStop(index: number): void
  equals(other: IGradientBase<TConfig>): boolean
}
```

Это важно.

Как только кастомный градиент соответствует этой структуре, он становится частью той же экосистемы, что и встроенные градиенты.

## Что даёт регистрация

Регистрация сообщает gradiente, как создавать градиент.

```ts
GradientFactory.add("my-gradient", MyGradient)
```

После этого фабрика может определять:

```ts
parse("my-gradient(...)")
```

Без регистрации gradiente не знает, какой класс должен обрабатывать входные данные.


## Базовая структура кастомного градиента

Кастомный градиент обычно выглядит так:

```ts
import {
  GradientBase,
  type GradientAbi,
  type GradientStop,
} from 'gradiente'

type MyGradientConfig = {
  angle: number
}

export class MyGradient extends GradientBase<MyGradientConfig> {
  public readonly type = 'my-gradient'
  public readonly isRepeating = false

  public static fromString(input: string): MyGradient {
    return this.fromAbi(parseStringToAbi(input))
  }

  public static fromAbi(abi: GradientAbi): MyGradient {
    return new MyGradient({
      config: {
        angle: 0,
      },
      stops: [
        // convert ABI inputs into stops
      ],
    })
  }

  public clone(): this {
    return new MyGradient({
      config: { ...this.config },
      stops: [...this.stops],
    }) as this
  }

  public toString(): string {
    return `my-gradient(...)`
  }
}
```

Это упрощённый пример.

В реальной реализации нужно обрабатывать конфигурацию, стопы, позиции, hints и правила валидации в соответствии с типом градиента.

## Полный жизненный цикл

Кастомный тип градиента обычно проходит через следующие этапы:

```txt
1. определить синтаксис градиента
2. задать ABI-паттерн
3. реализовать класс градиента
4. зарегистрировать его в GradientFactory
5. при необходимости добавить трансформеры
6. использовать через публичный API
```


## Step 1 - определиться с синтаксисом

Сначала надо определиться как должен выглядеть собственный градиент

Пример:

```css
my-gradient(45deg, red, blue)
```

Значит functionName:

```txt
my-gradient
```

параметры состояит из:

```txt
config, color-stop, color-stop
```


## Step 2 - создание правил валидации

Используй паттерны DSL чтобы описать разрешенную структуру ABI.

```txt
^[config,color-stop,color-stop].
```

Этот паттерн переводится как:

```txt
begin pattern
config
then color-stop
then color-stop
end pattern
```

Для более гибких типов:

```txt
^[([config,color-stop]|color-stop),~color-stop].
```

Это позволит сделать такие варианты:

```txt
config, color-stop
config, color-stop, color-stop
color-stop
color-stop, color-stop
```

Паттерн определяет, какие структуры допустимы до создания класса градиента.


## Step 3 - имплиментация fromAbi

`fromAbi()` самая важная часть.

Он получает распарсенный ABI и преобразует его в класс градиента.

```ts
public static fromAbi(abi: GradientAbi): MyGradient {
  if (abi.functionName !== 'my-gradient') {
    throw new Error('Expected my-gradient')
  }

  return new MyGradient({
    config: parseMyConfig(abi.inputs),
    stops: parseMyStops(abi.inputs),
  })
}
```

Здесь градиент становится структурированными данными.


## Step 4 - имплиментация fromString

Обычно `fromString()` - это небольшой вспомогательный метод:

```ts
public static fromString(input: string): MyGradient {
  return this.fromAbi(parseStringToAbi(input))
}
```

Сначала строка парсится в ABI.

Затем ABI преобразуется в экземпляр класса.


## Step 5 - имплиментация serialization

Градиент должен уметь преобразовываться обратно в строку:

```ts
gradient.toString()
```

Пример:

```ts
public toString(): string {
  const stops = this.stops.map((stop) => stop.value).join(', ')
  return `my-gradient(${stops})`
}
```

Именно это обеспечивает работу `format()`.

```ts
format('my-gradient(red, blue)')
```

Под капотом:

```txt
parse(input).toString()
```


## Step 6 - зарегестрируй градиент

Зарегестрируй свой класс:

```ts
GradientFactory.add('my-gradient', MyGradient)
```

Теперь он доступен в публичном API:

```ts
const gradient = parse('my-gradient(red, blue)')
```

Так же работает и валидация:

```ts
isGradient('my-gradient(red, blue)') // true
```


## Step 7 - добавление трансформеров

Класс градиента определяет модель данных.

Трансформер определяет, как её экспортировать.

```txt
GradientFactory.add(...)
  → teaches gradiente how to create the gradient

GradientTransformer.add(...)
  → teaches gradiente how to convert the gradient
```

Пример:

```ts
class MyGradientToCss {
  target = 'css'
  gradientType = 'my-gradient'

  to(input: GradientBase<any>): string {
    return input.toString()
  }
}
```

Зарегестрируй это:

```ts
GradientTransformer.add(new MyGradientToCss())
```

Используй это:

```ts
transformTo('css', 'my-gradient(red, blue)')
```


## Почему это не просто парсер

Парсер отвечает на вопрос:

```txt
Могу ли я прочесть эту строку?
```

Кастомный тип градиента отвечает на гараздо больше вопросов:

```txt
Могу ли я его распарсить?  
Могу ли я его валидировать?  
Могу ли я его нормализовать?  
Могу ли я его клонировать?  
Могу ли я его сериализовать?  
Могу ли я его трансформировать?  
Могу ли я подключить его к другому рендереру?
```

В этом и есть отличие.


## Встроенные градиенты работают по такому же принципу

Встроенные градиенты не являются чем-то особенным.

Это такие же зарегистрированные классы градиентов:

```ts
GradientFactory.add("linear-gradient", LinearGradient)
GradientFactory.add("radial-gradient", RadialGradient)
GradientFactory.add("conic-gradient", ConicGradient)
```

Это означает, что кастомные градиенты могут следовать той же архитектуре, что и встроенные.


## Практические сценарии использования

Кастомные типы градиентов полезны, когда нужно:

- mesh gradients
- diamond gradients
- editor-specific gradients
- shader gradients
- design-tool-only gradients
- engine-specific gradient formats


## Например: diamond gradient

Кастомный градиент может выглядеть следующим образом:

```css
diamond-gradient(at center, red, blue)
```

Возможная структура ABI:

```txt
config, color-stop, color-stop
```

Паттерн:

```txt
^[config,color-stop,color-stop].
```

Регистрируется как:

```ts
GradientFactory.add('diamond-gradient', DiamondGradient)
```

Потом регистрируются трансформеры под него:

```ts
GradientTransformer.add(new DiamondGradientToCanvas())
GradientTransformer.add(new DiamondGradientToCss())
```


## Итог

Поддержка кастомных градиентов построена вокруг двух реестров:

```txt
GradientFactory
GradientTransformer
```

`GradientFactory` используется, когда нужно задать gradiente, как создавать градиент.

`GradientTransformer` используется, когда нужно задать gradiente, как экспортировать или импортировать его.


## Финальная модель

```txt
custom gradient syntax
  ↓
ABI
  ↓
custom gradient class
  ↓
GradientFactory registration
  ↓
public API
  ↓
optional transformers
```