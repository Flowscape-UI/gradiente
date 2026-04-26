# 🌍 Real-World Pattern Examples

This section shows how Gradient Pattern DSL is used to model real gradient behaviors.
Instead of abstract examples, you will see how patterns map to actual gradient structures.


## 🎯 Goal

Each pattern defines:

```txt
what gradient inputs are valid
```


## 🟦 1. Basic linear gradient

### Pattern

```txt
^[color-stop,~color-stop].
```


### Meaning

```txt
Start of pattern

Expect:
  at least one color-stop

Then:
  zero or more additional color-stops

End of pattern
```


### Valid examples

```txt
color-stop
color-stop, color-stop
color-stop, color-stop, color-stop
```


### Real gradients

```css
linear-gradient(red, blue)
linear-gradient(red, blue, green)
```


## 🟦 2. Linear gradient with direction

### Pattern

```txt
^[([config,color-stop]|color-stop),~color-stop].
```


### Meaning

```txt
Start of pattern

Then:
  Either:
    config followed by color-stop
  Or:
    color-stop

Then:
  zero or more color-stops

End of pattern
```


### Valid examples

```txt
color-stop
config, color-stop
config, color-stop, color-stop
```


### Real gradients

```css
linear-gradient(to left, red, blue)
linear-gradient(180deg, red, blue, green)
```


## 🟦 3. Linear gradient with hints

### Pattern

```txt
^[color-stop,~([color-hint,color-stop]|color-stop)].
```


### Meaning

```txt
Start of pattern

Expect:
  a color-stop

Then repeat:
  Either:
    color-hint followed by color-stop
  Or:
    color-stop

End of pattern
```


### Valid examples

```txt
color-stop, color-stop
color-stop, color-hint, color-stop
color-stop, color-stop, color-hint, color-stop
```


### Real gradients

```css
linear-gradient(red, 50%, blue)
linear-gradient(red 10%, 50%, blue 80%)
```


## 🟦 4. Strict CSS-like gradient

### Pattern

```txt
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```


### Meaning

```txt
Start of pattern

Then:
  Either:
    config → color-stop → (color-stop OR hint → color-stop)
  Or:
    color-stop

Then repeat:
  (color-stop OR hint → color-stop)

End of pattern
```


### Why this pattern exists

This pattern enforces:

* no dangling hints
* no incomplete gradients
* valid interpolation structure


### Valid examples

```txt
color-stop, color-stop
config, color-stop, color-stop
config, color-stop, color-hint, color-stop
```


### Invalid examples

```txt
config, color-stop ❌
color-stop, color-hint ❌
color-stop, color-hint, color-hint, color-stop ❌
```


## 🟦 5. Mesh-like gradient (custom)

### Pattern

```txt
^[color-stop,~color-stop].
```


### Meaning

```txt
Only color-stops are allowed
No config
No hints
```


### Use case

Custom gradient systems:

* mesh gradients
* node-based gradients
* shader-based gradients


## 🟦 6. Fixed structure gradient

### Pattern

```txt
^[config,color-stop,color-stop].
```


### Meaning

```txt
config
then exactly two color-stops
```


### Use case

Systems where:

* structure is fixed
* flexibility is not needed


## 🟦 7. Optional config without hints

### Pattern

```txt
^[([config,color-stop]|color-stop),~color-stop].
```


### Meaning

* config is optional
* hints are not allowed
* only color-stops


### Use case

Simplified gradient editors


## 🧠 Key takeaway

Different gradient systems require different rules.

DSL allows you to:

```txt
define exactly what is valid
```


## 🔗 Try it yourself

Take any pattern from this page and explore it interactively:

👉 **[Open DSL Playground →](/playground/dsl)**


## 🚀 Summary

* DSL patterns are reusable
* each pattern encodes a real validation rule
* complexity depends on your needs