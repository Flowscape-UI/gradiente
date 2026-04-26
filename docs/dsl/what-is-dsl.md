# Gradient Pattern DSL

Gradiente includes a small domain-specific language (DSL) used to describe and validate the structure of gradient ABI inputs.

This DSL is not a regex engine and not a general parser.
It is a **strict, minimal rule language** designed specifically for gradient patterns.


## 🧠 What problem it solves

Gradient inputs can have many valid forms:

```txt
config, color-stop, color-stop
color-stop, color-hint, color-stop
color-stop, color-stop, color-stop
```

Instead of hardcoding rules for each gradient type, DSL allows you to define them declaratively:

```txt
^[color-stop,~color-stop].
```


## 🧩 Core concept

The DSL validates **types**, not raw strings.

Before validation, input is transformed into ABI:

```ts
[
  { type: "config" },
  { type: "color-stop" },
  { type: "color-hint" },
  { type: "color-stop" }
]
```

DSL matches:

```txt
config, color-stop, color-hint, color-stop
```


## 🔤 Tokens

### Entities

| Token        | Meaning                |
| ------------ | ---------------------- |
| `config`     | gradient configuration |
| `color-stop` | color stop             |
| `color-hint` | interpolation hint     |


### Operators

| Token | Meaning            |                  |
| ----- | ------------------ | ---------------- |
| `^`   | start of pattern   |                  |
| `.`   | end of pattern     |                  |
| `[]`  | ordered sequence   |                  |
| `()`  | grouping           |                  |
| `     | `                  | OR (alternative) |
| `~`   | repetition (0..n)  |                  |
| `,`   | sequence separator |                  |


## 📌 Rules

### 1. Pattern must start and end

```txt
^ ... .
```

Valid:

```txt
^color-stop.
```

Invalid:

```txt
color-stop
```


### 2. Sequence is explicit

```txt
[config,color-stop]
```

Order matters.

Invalid:

```txt
color-stop, config
```


### 3. No implicit sequence

Invalid:

```txt
^(config|color-stop)~color-stop.
```

Valid:

```txt
^[(config|color-stop),~color-stop].
```


### 4. OR logic

```txt
(config|color-stop)
```

Matches:

```txt
config
color-stop
```


### 5. Repetition

```txt
~color-stop
```

Means:

```txt
0..n color-stop
```

Used as:

```txt
^[color-stop,~color-stop].
```


### 6. Grouping

```txt
([color-hint,color-stop]|color-stop)
```

Means:

* either `color-hint, color-stop`
* or `color-stop`


## 🧪 Examples

### One stop

```txt
^color-stop.
```


### Two stops

```txt
^[color-stop,color-stop].
```


### Any number of stops

```txt
^[color-stop,~color-stop].
```


### With config

```txt
^[([config,color-stop]|color-stop),~color-stop].
```


### With color hints

```txt
^[color-stop,~([color-hint,color-stop]|color-stop)].
```


## 🎯 Recommended default pattern

```txt
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```

This ensures:

* config is valid only with proper stops
* hints are always followed by stops
* structure is strictly correct


## ❌ Common mistakes

### Missing sequence

```txt
(config|color-stop)~color-stop ❌
```


### Wrong OR placement

```txt
[color-stop|color-stop] ❌
```

Correct:

```txt
(color-stop|color-stop)
```

---

### Dangling hint

```txt
color-stop, color-hint ❌
```


## 🧠 Mental model

Think of DSL as:

> a program that consumes input step-by-step

It works like:

```txt
patternIndex + inputIndex → next state
```


## 🔍 Visualization

Pattern:

```txt
^[color-stop,~color-stop].
```

Structure:

```txt
BEGIN
  SEQUENCE
    color-stop
    REPEAT
      color-stop
END
```


## 📌 Summary

* DSL describes structure, not values
* explicit syntax, no implicit behavior
* strict validation rules
* small but expressive language


## 🚀 What this enables

* reusable gradient validation
* custom gradient types
* predictable parsing behavior