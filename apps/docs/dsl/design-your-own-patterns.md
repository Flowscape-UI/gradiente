# 🧱 Designing Your Own Gradient Type

This section shows how to design a custom gradient using **gradiente** and the Pattern DSL.
You will go from idea → pattern → validation → real usage.


## 🎯 Goal

Define a gradient type by answering:

```txt
What inputs are allowed?
What structure must they follow?
How strict should validation be?
```


## 🧠 Step 1 - Define the idea

Start with a clear concept.

### Example

```txt
A gradient that:
- may have an optional direction
- must have at least two color stops
- may include color hints
```


## 📌 Step 2 - Translate to structure

Break it into rules:

```txt
config? → optional
color-stop → required
color-stop → required
color-hint → optional between stops
```


## 🧩 Step 3 - Build the pattern

Start simple:

```txt
^[color-stop,color-stop].
```

Then extend:

```txt
^[([config,color-stop]|color-stop),~color-stop].
```

Then support hints:

```txt
^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].
```


## 🧠 Step 4 - Validate the logic

Ask yourself:

* Can a hint appear without a stop? ❌
* Can config exist without enough stops? ❌
* Can the pattern end incorrectly? ❌

If yes → refine pattern


## 🧪 Step 5 - Test examples

### Valid

```txt
color-stop, color-stop
config, color-stop, color-stop
color-stop, color-hint, color-stop
```


### Invalid

```txt
config ❌
color-stop, color-hint ❌
config, color-stop ❌
```


## 🔄 Step 6 - Map to real values

Pattern works with types:

```txt
config → to left
color-stop → red 10%
color-hint → 50%
```


### Example

```css
linear-gradient(to left, red 10%, 50%, blue 80%)
```


## 🧩 Step 7 - Integrate into your system

Once pattern is defined, you can:

* validate user input
* build editors
* generate gradients
* normalize data


## 🧠 Design strategies

### Strict design

Use when:

* rendering must always be correct
* invalid states must be impossible


### Flexible design

Use when:

* building editors
* allowing partial input
* progressive user input


## 🔁 Iteration process

Design is iterative:

```txt
idea → pattern → test → refine
```

Start simple, then add constraints.


## 🧠 Mental model

Think of your pattern as:

```txt
a program that validates input flow
```

Not just a structure.


## 🔗 Use the playground

Designing patterns is much easier with visualization.

👉 **[Open DSL Playground →](/playground/dsl)**


## 🚀 Final takeaway

A gradient type is defined by:

* its structure (DSL)
* its constraints
* its intended usage

With Gradiente DSL, you control all of it.


## 💡 Closing thought

> Gradients are not strings.
> They are structured systems.
