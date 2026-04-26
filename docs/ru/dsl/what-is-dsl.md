# Gradient Pattern DSL

В gradiente есть небольшой DSL (domain-specific language), который используется для описания и валидации структуры ABI градиентов.

Это не regex-движок и не универсальный парсер.  
Это **строгий минималистичный язык правил**, предназначенный именно для описания градиентных паттернов.

## 🧠 Какую задачу он решает

Градиенты могут иметь множество допустимых форм:

```txt
config, color-stop, color-stop
color-stop, color-hint, color-stop
color-stop, color-stop, color-stop
```

Вместо хардкода правил для каждого типа градиента DSL позволяет задавать их декларативно:

```txt
^[color-stop,~color-stop].
```


## 🧩 Концепты ядра

DSL валидирует **типы**, а не строки.

Перед валидацией входные данные преобразуются в ABI:

```ts
[
  { type: "config" },
  { type: "color-stop" },
  { type: "color-hint" },
  { type: "color-stop" }
]
```

DSL сопоставляет:

```txt
config, color-stop, color-hint, color-stop
```


## 🔤 Токены

### Сущности

| Токен        | Значение                         |
| ------------ | -------------------------------- |
| `config`     | конфигурация градиента           |
| `color-stop` | цветовой стоп                    |
| `color-hint` | интерполяционная точка           |


### Операторы

| Токен | Значение                         |
| ----- | -------------------------------- |
| `^`   | начало паттерна                  |
| `.`   | конец паттерна                   |
| `[]`  | упорядоченная последовательность |
| `()`  | группировка                      |
| `|`   | или                              |
| `~`   | повторение (0..n)                |
| `,`   | разделитель последовательности   |


## 📌 Правила

### 1. Паттерн должен иметь начало и конец

```txt
^ ... .
```

Валидный:

```txt
^color-stop.
```

Невалидный:

```txt
color-stop
```


### 2. Последовательность задаётся явно

```txt
[config,color-stop]
```

Order matters.

Невалидный:

```txt
color-stop, config
```


### 3. Нет неявной последовательности

Невалидный:

```txt
^(config|color-stop)~color-stop.
```

Валидный:

```txt
^[(config|color-stop),~color-stop].
```


### 4. Логика ИЛИ

```txt
(config|color-stop)
```

Означает:

```txt
config или color-stop
```


### 5. Repetition

```txt
~color-stop
```

Означает:

```txt
0..n color-stop
```

Пример:

```txt
^[color-stop,~color-stop].
```


### 6. Группа

```txt
([color-hint,color-stop]|color-stop)
```

Означает:

- последовательность из `color-hint, color-stop`
- или `color-stop`


## 🧪 Примеры

### Один стоп

```txt
^color-stop.
```


### Два стопа

```txt
^[color-stop,color-stop].
```


### Любое количество стопов

```txt
^[color-stop,~color-stop].
```


### С конфигом

```txt
^[([config,color-stop]|color-stop),~color-stop].
```


### С color hints

```txt
^[color-stop,~([color-hint,color-stop]|color-stop)].
```


## 🎯 Рекомендованный паттерн по умолчанию

```txt
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```

Это обеспечивает:

- конфиг валидный только если даллее идут стопы
- color-hints всегда чередуются с color-stops
- стуктура строга типизирована


## ❌ Частые ошибки

### Забытая последовательность

```txt
(config|color-stop)~color-stop ❌
```


### Неправильная позиция ИЛИ

```txt
[color-stop|color-stop] ❌
```

Правильно:

```txt
(color-stop|color-stop)
```

---

### Одиночный color-hint

```txt
color-stop, color-hint ❌
```


## 🧠 Ментальная модель

DSL можно рассматривать как:

> программу, которая обрабатывает входные данные шаг за шагом

Он работает так:

```txt
patternIndex + inputIndex → next state
```


## 🔍 Визуализация

Паттерн:

```txt
^[color-stop,~color-stop].
```

Структура:

```txt
BEGIN
  BEGIN SEQUENCE
    color-stop
    REPEAT color-stop N times
  END SEQUENCE
END
```


## 📌 Итог

- DSL описывает структуру, а не значения
- явный синтаксис, без неявного поведения
- строгие правила валидации
- небольшой, но выразительный язык


## 🚀 Что это даёт

- переиспользуемую валидацию градиентов
- кастомные типы градиентов
- предсказуемое поведение парсинга