# What is gradiente

gradiente is a lightweight toolkit for working with gradients as structured data.

It helps you move from strings to a predictable, controllable representation.


## The problem

Gradients are usually written as strings:

```css
linear-gradient(to right, red, blue)
```

This works for rendering, but it is hard to:

* validate
* transform
* analyze
* reuse


## The idea

gradiente treats gradients as data.

```ts
import { parseStringToAbi } from 'gradiente'

const result = parseStringToAbi(
  'linear-gradient(to right, red, blue)'
)
```

Instead of a string, you get a structured representation.


## Why this matters

Once gradients are structured, you can:

* validate input
* build editors
* transform between formats
* generate gradients programmatically


## Pattern DSL

gradiente includes a small DSL for validating gradient structure.

```txt
^[color-stop,~color-stop].
```

This defines what inputs are allowed.


## Example

```txt
color-stop, color-stop ✅
color-stop, color-stop, color-stop ✅
color-stop, color-hint ❌
```


## What gradiente is not

* not a rendering engine
* not a CSS replacement
* not a visual tool

It is a **data layer for gradients**.


## Where it fits

gradiente is designed to work with:

* canvas systems
* rendering engines
* visual editors
* tools like Flowscape


## Next step

Start with basic usage:

👉 [Getting Started →](/getting-started)

Or explore the DSL:

👉 [Pattern DSL →](/dsl/what-is-dsl)
