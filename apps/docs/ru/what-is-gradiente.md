# Что такое gradiente

gradiente - это gradient engine для приложений, где градиенты должны быть
данными, а не хрупкими строками.

Он парсит градиенты во внутреннюю модель, нормализует их, валидирует и
преобразует в output для CSS, Canvas 2D, WebGL и SVG. Главная идея простая:
одно описание градиента должно проходить через редактор, renderer, serializer,
preset system и кастомный движок без потери смысла.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const css = transformTo('css', gradient)
```

На поверхности это выглядит как небольшой API. Но за ним стоит более важная
идея: gradiente - это инфраструктура для градиентов.

## Почему Он Появился

gradiente появился из реальной продуктовой боли.

Когда я начал разрабатывать движок flowscape, мне нужна была библиотека для
градиентов, которая могла бы стать частью rendering foundation. Она должна была
быть универсальной, расширяемой и достаточно безопасной, чтобы использоваться не
только в демо, но и внутри полноценного визуального движка.

Мне нужно было работать с градиентами как с editable state. Градиент должен был
парситься, читаться, трансформироваться, рендериться, сериализоваться,
сравниваться, тестироваться и расширяться кастомной логикой.

Для простых цветов в экосистеме уже есть сильные решения. `culori` - отличный
пример: она серьезно относится к цветам, поддерживает разные color spaces и дает
надежную базу для работы с цветом.

Но аналога такого уровня для градиентов я не нашел.

CSS дает синтаксис градиентов. Браузеры умеют этот синтаксис рендерить. Некоторые
библиотеки умеют генерировать строки. Но renderer-agnostic модель градиента,
которую можно безопасно использовать в движках, редакторах и tooling, отсутствовала.
Именно этот пробел стал причиной появления gradiente.

## Проблема Строк

Большинство градиентов начинается со строки:

```css
linear-gradient(to right, red, blue)
```

Если цель только одна - отдать эту строку браузеру, все хорошо. Но как только
градиент становится состоянием приложения, строка начинает мешать.

В реальных инструментах появляются вопросы:

- Валидный ли это градиент?
- Какой у него тип?
- Где его stops, hints, vertices, patches или geometry settings?
- Можно ли нормализовать его перед сохранением?
- Можно ли отрисовать его не только в CSS?
- Можно ли сравнить его с другим градиентом?
- Переживет ли он roundtrip через визуальный редактор?
- Может ли кастомный renderer использовать тот же source of truth?

Строки не отвечают на эти вопросы чисто. Они заставляют каждую систему заново
парсить и интерпретировать один и тот же синтаксис.

gradiente нужен, чтобы это больше не приходилось делать.

## Главная Идея

gradiente рассматривает градиент как структурированный объект.

```ts
import { parse, format } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

console.log(gradient.type)
console.log(gradient.getConfig())

if ('getStops' in gradient) {
  console.log(gradient.getStops())
}

console.log(format(gradient))
```

Строка все еще важна. Она остается удобным форматом для ввода и вывода. Но
внутри системы строка не должна навсегда оставаться source of truth. После
парсинга gradiente работает с моделью, которую можно валидировать,
трансформировать и анализировать.

## Больше Чем CSS Gradients

CSS gradients - это только один target.

gradiente может преобразовать одну и ту же внутреннюю модель в разные rendering
outputs:

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('radial-gradient(circle at 30% 35%, white, blue)')

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

Это важно, потому что современные инструменты редко используют только один
rendering layer. Дизайн-редактор может использовать CSS для превью, Canvas для
интеракции, WebGL для производительности и SVG для экспорта. Градиент не должен
переписываться отдельно под каждый target.

gradiente сохраняет определение градиента стабильным, а transformer modules
адаптируют его под нужный renderer.

## Собственные Transformers

Встроенные targets - это не потолок. Продукт может зарегистрировать собственный
transformer module и использовать его через тот же `transformTo()`, что и
официальные модули.

У transformer module маленький контракт:

- `target` - имя output-системы, например `css`, `svg` или собственный
  `design-token`.
- `gradientType` - тип градиента, который принимает модуль, например
  `linear-gradient`.
- `target + gradientType` - ключ регистрации.
- `to()` преобразует модель gradiente в нужный output format.
- `from()` опционален и нужен тогда, когда output format можно преобразовать
  обратно в модель gradiente через `transformFrom()`.

Для переиспользуемых модулей удобно расширять `GradientTransformerModule`.
Базовый класс проверяет, что пришел ожидаемый runtime-тип градиента, и только
после этого вызывает метод `transform()`:

```ts
import {
  GradientLinear,
  GradientTransformer,
  GradientTransformerModule,
  parse,
  transformTo,
} from 'gradiente'

type DesignTokenStop =
  | {
      type: 'color-stop'
      color: string
      position: number
    }
  | {
      type: 'color-hint'
      position: number
    }

type DesignTokenGradient = {
  kind: 'gradient'
  syntax: string
  stops: DesignTokenStop[]
}

class LinearGradientToDesignToken extends GradientTransformerModule<
  GradientLinear,
  DesignTokenGradient
> {
  constructor() {
    super({
      target: 'design-token',
      gradientType: 'linear-gradient',
      gradientClass: GradientLinear,
      expectedName: 'GradientLinear',
    })
  }

  protected transform(gradient: GradientLinear): DesignTokenGradient {
    return {
      kind: 'gradient',
      syntax: gradient.toString(),
      stops: gradient.getStops().map((stop) => {
        if (stop.type === 'color-hint') {
          return {
            type: stop.type,
            position: stop.position,
          }
        }

        return {
          type: stop.type,
          color: stop.value,
          position: stop.position,
        }
      }),
    }
  }
}

GradientTransformer.add(new LinearGradientToDesignToken())

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')
const token = transformTo<DesignTokenGradient>('design-token', gradient)
```

Это значит, что gradiente может обслуживать custom renderers, форматы экспорта,
design-token pipelines, системы превью для редакторов, native bridges или
внутренние adapters движка без изменения самой модели градиента.

## Создан Для Реальных Типов Градиентов

Сейчас в gradiente есть пять встроенных типов:

- `linear-gradient`
- `radial-gradient`
- `diamond-gradient`
- `conic-gradient`
- `mesh-gradient`

Некоторые из них нативны для CSS. Некоторые являются gradiente-specific.

Это осознанное решение. Gradient engine не должен быть ограничен только теми
функциями, которые браузеры поддерживают сегодня. Он должен уметь описывать
полезные gradient concepts и создавать renderable output для нужной среды.

Например, `diamond-gradient` и `mesh-gradient` не являются нативными CSS
функциями. Но gradiente все равно может их парсить, нормализовать, читать и
преобразовывать в CSS adapter output, Canvas output, WebGL output или SVG
output.

## Безопасность И Расширяемость

Расширяемость полезна только тогда, когда она безопасна.

gradiente построен вокруг явных gradient kinds, transformer modules и validation
rules. Градиент не должен превращаться в набор случайных значений. У него должен
быть понятный тип, понятная конфигурация, понятная data shape и понятные
transformers.

Поэтому публичный API намеренно небольшой:

```ts
import { format, isGradient, parse, transformTo } from 'gradiente'

isGradient('linear-gradient(red, blue)')

const gradient = parse('linear-gradient(red, blue)')
const normalized = format(gradient)
const css = transformTo('css', gradient)
```

Маленькому API проще доверять. Сложность остается внутри движка, где ее можно
тестировать и переиспользовать между renderers.

## Философия

gradiente строится на нескольких принципах:

- Градиент сначала является данными, и только потом пикселями.
- Внутренняя модель является source of truth.
- Renderers - это adapters, а не владельцы смысла градиента.
- Parsing, normalization, validation и transformation должны быть консистентными.
- Кастомные gradient systems должны быть возможны без переписывания основы.
- Хорошие defaults важны, но пользователь должен иметь контроль над деталями.

Именно эта философия привела к созданию библиотеки. Если визуальному движку
нужны градиенты как серьезный primitive, простого string helper недостаточно.
Gradient system должен быть стабильным, типизированным, расширяемым и
renderer-agnostic.

## Чем gradiente Не Является

gradiente не заменяет CSS.

Он не пытается стать дизайн-приложением, полноценным renderer или color science
library. Он также не заменяет `culori`; наоборот, gradiente опирается на тот
уровень color foundation, который делают возможным такие библиотеки.

gradiente работает на слой выше отдельных цветов: на уровне самого градиента.

Он отвечает за форму градиента, stop model, кастомные gradient kinds, правила
нормализации и transformation pipeline.

## Где Он Используется

gradiente рассчитан на:

- rendering engines;
- visual editors;
- design tools;
- gradient generators;
- canvas и WebGL systems;
- preset и theme systems;
- приложения, которым нужны portable gradient definitions.

Он появился как инфраструктура для flowscape, но устроен так, чтобы быть
полезным и вне flowscape.

Если приложению нужен один захардкоженный CSS background, gradiente может быть
избыточен. Но если градиенты редактируются, генерируются, трансформируются,
валидируются, сериализуются или рендерятся в разные targets, gradiente становится
тем слоем, который делает эту работу предсказуемой.

## Дальше

Начни с практического API:

[Быстрый старт →](/ru/getting-started)

Затем изучи встроенные типы градиентов:

[Типы градиентов →](/ru/core-api/gradients/)
