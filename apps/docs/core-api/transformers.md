# Transformers

Gradients in gradiente are not tied to a specific rendering system.
Transformers allow you to convert gradients into different targets such as CSS or Canvas.


## Basic usage

```ts
import { transformTo } from 'gradiente'

const result = transformTo(
  'css',
  'linear-gradient(to right, red, blue)'
)
```


## Targets

A target defines where the gradient will be used.

Examples:

```txt
css
canvas
konva (future)
pixi (future)
```


## Example: CSS

```ts
transformTo('css', 'linear-gradient(red, blue)')
```

Returns:

```txt
linear-gradient(red, blue)
```


## Example: Canvas

```ts
const paint = transformTo(
  'canvas',
  'linear-gradient(red, blue)'
)

paint.draw(ctx, width, height)
```


## How it works

Transformers convert a gradient object into another format.

```txt
string → parse → gradient → transform → target format
```


## Mental model

```txt
gradient object
  ↓
transformTo('target')
  ↓
output for that system
```


## Supported directions

Transformers can work both ways:

```ts
transformTo('css', gradient)
transformFrom('css', 'linear-gradient', input)
```


## Why transformers matter

They allow gradiente to act as a bridge between systems:

* CSS
* Canvas
* rendering engines
* custom tools


## Key idea

> gradiente is not a renderer
> it prepares gradient data for different systems


## Extensibility

gradiente can be extended with custom transformers.

Internally, each transformer is a module that defines:

```ts
{
  target: string
  gradientType: string
  to(...)
  from?(...)
}
```

This allows you to support any format or rendering system.

(Custom transformers are covered in the next section.)


## Summary

```txt
transformTo   → export gradient
transformFrom → import gradient
targets       → define output system
modules       → implement conversion logic
```