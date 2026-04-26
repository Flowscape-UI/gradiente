# 🌍 Реальные примеры DSL

В этом разделе показано, как DSL паттернов градиентов используется для моделирования реального поведения градиентов.
Вместо абстрактных примеров здесь показано, как паттерны соответствуют реальным структурам градиентов.

## 🎯 Цель

Каждый паттерн задаёт, какие входные данные градиента допустимы


## 🟦 1. Базовый линейный градиент

### Паттерн

```ts
^[color-stop,~color-stop].
```

### Значение

```bash
Начало паттерна
  Чередуем color-stop N-раз
Конец паттерна
```

### Рабочие примеры


```bash
color-stop
color-stop, color-stop
color-stop, color-stop, color-stop

linear-gradient(red, blue)
linear-gradient(red, blue, green)
```


## 🟦 2. Линейный градиент с направлением

### Паттерн

```ts
^[([config,color-stop]|color-stop),~color-stop].
```

### Как это читается

```bash
# Первый пример
Начало паттерна
  Открываем секвенцию
    Открываем группу ИЛИ
      ИЛИ config, затем color-stop ИЛИ color-stop
    Закрываем группу ИЛИ
  Закрываем секвенцию
  Итерируем N-раз по color-stop
Конец паттерна

# Второй пример
Или читаем так:
Начинаем градиент либо с config, color-stop
  Либо color-stop
    Далее только color-stop N-раз
```

### Валидные примеры этого паттерна

```bash
color-stop, color-stop
config, color-stop, color-stop

linear-gradient(red, blue)
linear-gradient(180deg, red, blue)
linear-gradient(180deg, red, blue, white 50% 100%)
```

## 🟦 3. Линейный градиент с hint

### Паттерн

```ts
^[color-stop,~([color-hint,color-stop]|color-stop)].
```

### Meaning

```bash
Читаем так:
Начинаем градиент с color-stop
  Затем чередуем либо color-hint, color-stop либо color-stop 
```

### Валидные примеры

```bash
color-stop, color-stop
color-stop, color-hint, color-stop
color-stop, color-stop, color-hint, color-stop

linear-gradient(red, 50%, blue)
linear-gradient(red 10%, 50%, blue 80%)
```


## 🟦 4. Строгий CSS-подобный градиент

### Паттерн

```ts
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```

### Meaning

```bash
Начинаем градиент либо с config, color-stop либо с color-stop
  Так же допускаем что после config, color-stop может быть либо color-hint,color-stop либо color-stop
    Далее допускаем чередование либо из color-hint, color-stop либо color-stop

# Допустимые примеры
linear-gradient(red, green)
linear-gradient(red, green, blue)
linear-gradient(red, 50%, blue)
linear-gradient(180deg, red 50%, blue)
linear-gradient(to left, red, green, 50%, blue)

# Недопустимые
linear-gradient(180deg, green) ❌
linear-gradient(180deg, 50%) ❌
linear-gradient(red, 50%, 70%, blue) ❌
```


## 🟦 5. Mesh-подобный градиент (кастомный)

### Паттерн

```ts
^[color-stop,~color-stop].
```

### Meaning

```bash
Допустимы только color-stop минимум (2)
config отсутствует
hint не используются
```

### Использование

Кастомные системы градиентов:
- mesh gradients
- node-based gradients
- shader-based gradients


## 🟦 6. Градиент с фиксированной структурой

### Паттерн

```ts
^[config,color-stop,color-stop].
```

### Meaning

```bash
config затем ровно два color-stop
```

### Использование

Системы, где:
- структура фиксирована
- гибкость не требуется


## 🟦 7. Опциональный config без hint

### Паттерн

```ts
^[([config,color-stop]|color-stop),~color-stop].
```

### Значение

- config опционален
- color-hint не допускаются
- используются только color-stop

### Использование

Упрощённые редакторы градиентов


## 🧠 Основная идея

Разные системы градиентов требуют разных правил.
DSL позволяет задать точное определение допустимой структуры.


## 🔗 Попробовать самостоятельно

Любой паттерн с этой страницы можно проверить интерактивно:

👉 **[Открыть DSL Playground →](/playground/dsl)**


## 🚀 Итог

- DSL-паттерны переиспользуемы
- каждый паттерн задаёт конкретное правило валидации
- сложность зависит от задачи