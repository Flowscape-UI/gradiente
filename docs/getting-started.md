# Getting Started

Gradiente is a lightweight gradient toolkit for working with gradients as structured data.
Instead of treating gradients as strings, gradiente parses them into a predictable representation that can be validated, transformed, and used by rendering systems.

## Installation

```bash
npm install gradiente
````

## Basic usage

```ts
import { parseStringToAbi } from 'gradiente'

const gradient = parseStringToAbi(
  'linear-gradient(to right, red, blue)'
)

console.log(gradient)
```

## Why structured gradients?

CSS gradients are useful, but strings are hard to inspect, validate, and transform.

gradiente helps you move from this:

```css
linear-gradient(to right, red, blue)
```

to structured data that can be used by tools, editors, and rendering engines.

## Pattern DSL

Gradiente also includes a small Pattern DSL for validating gradient ABI inputs.

```txt
^[color-stop,~color-stop].
```

This means:

```txt
Start of pattern
Expect one color-stop
Then allow zero or more additional color-stops
End of pattern
```

## Try the playground

Use the playground to explore how patterns are tokenized, validated, and visualized.

[Open DSL Playground →](/playground/dsl)

## Next steps

* Learn how the Pattern DSL works
* Explore real-world gradient patterns
* Use gradiente inside rendering systems