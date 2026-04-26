# 🧩 Pattern Design Guide

This section explains how to design your own DSL patterns.
Instead of only reading patterns, you will learn how to **build them correctly and intentionally**.


## 🧠 Start from requirements

Before writing a pattern, define:

```txt
What inputs should be allowed?
What inputs must be rejected?
```


### Example

If you want:

```txt
at least one color-stop
```

Then your rule is:

```txt
^[color-stop,~color-stop].
```


## 📌 Build step-by-step

Do not write complex patterns immediately.

Start simple:

```txt
^color-stop.
```

Then expand:

```txt
^[color-stop,color-stop].
```

Then:

```txt
^[color-stop,~color-stop].
```


## 📌 Use sequences for order

If order matters, always use `[]`.

```txt
[config,color-stop]
```

Means:

```txt
config → then color-stop
```


## 📌 Use groups for alternatives

When multiple structures are possible:

```txt
(config|color-stop)
```


### Combine with sequence

```txt
([config,color-stop]|color-stop)
```

Means:

```txt
Either:
  config → color-stop
Or:
  color-stop
```


## 📌 Use repetition carefully

```txt
~color-stop
```

Means:

```txt
0..n color-stop
```


### Important

Always place repetition inside a sequence:

```txt
^[color-stop,~color-stop] ✅
```

Not:

```txt
^color-stop~color-stop ❌
```


## ⚠️ Avoid implicit behavior

The DSL does not assume anything.

Everything must be explicit.


### Bad

```txt
^(config|color-stop)~color-stop
```


### Good

```txt
^[(config|color-stop),~color-stop].
```


## 📌 Design strict vs flexible patterns

### Flexible pattern

```txt
^[([config,color-stop]|color-stop),~color-stop].
```

Allows:

```txt
config, color-stop
```


### Strict pattern

```txt
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```

Prevents incomplete gradients.


## 🧠 When to be strict

Use strict patterns when:

* input must be valid for rendering
* you want to prevent ambiguous states
* correctness is more important than flexibility


## 🧠 When to be flexible

Use flexible patterns when:

* building tools/editors
* allowing partial input
* supporting progressive input


## 🔁 Think in flows

Instead of thinking:

```txt
what does this pattern look like?
```

Think:

```txt
how will input flow through this pattern?
```


### Example

```txt
^[color-stop,~([color-hint,color-stop]|color-stop)].
```

Flow:

```txt
start → color-stop → repeat:
  either (hint → stop)
  or stop
→ end
```


## 🧩 Common pattern templates

### 1. Minimum one item

```txt
^[item,~item].
```


### 2. Optional config + items

```txt
^[([config,item]|item),~item].
```


### 3. Items with hints

```txt
^[item,~([hint,item]|item)].
```


### 4. Fixed structure

```txt
^[config,item,item].
```


## ❌ Common mistakes

### Missing sequence

```txt
(config|item)~item ❌
```


### Wrong OR placement

```txt
[item|item] ❌
```

Correct:

```txt
(item|item)
```


### Allowing invalid endings

```txt
item, hint ❌
```

Correct:

```txt
[item,~([hint,item]|item)]
```


## 🧠 Mental checklist

Before finalizing a pattern, check:

* Does it start with `^` and end with `.`?
* Are all sequences explicit (`[]`)?
* Are alternatives grouped (`()`)?
* Is repetition placed correctly (`~`)?
* Are invalid states impossible?


## 🚀 Summary

Designing DSL patterns is about:

* clarity
* explicit structure
* predictable behavior

Start simple, then refine.


## 🔗 Try it

Design your own pattern and test it in the playground:

👉 **[Open DSL Playground →](/playground/dsl)**