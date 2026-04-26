# Custom Transformers

gradiente can be extended with custom transformers.
This allows you to support any rendering system or data format.


## Idea

A transformer is a module that knows how to convert a gradient to a specific target.

```txt
gradient → transformer → output
```


## Basic interface

A transformer implements:

```ts
interface IGradientTransformerModule<TOutput> {
  target: string
  gradientType: string

  to(input: GradientBase<any>): TOutput
  from?(input: TOutput): GradientBase<any>
}
```


## Minimal example

```ts
import { LinearGradient } from 'gradiente'

class MyCssTransformer {
  target = 'my-css'
  gradientType = 'linear-gradient'

  to(input: GradientBase<any>) {
    if (!(input instanceof LinearGradient)) {
      throw new Error('Expected LinearGradient')
    }

    return input.toString()
  }
}
```


## Register transformer

```ts
import { GradientTransformer } from 'gradiente'

GradientTransformer.add(new MyCssTransformer())
```


## Use it

```ts
transformTo('my-css', 'linear-gradient(red, blue)')
```


## Canvas example (concept)

```ts
class CanvasTransformer {
  target = 'canvas'
  gradientType = 'linear-gradient'

  to(input: GradientBase<any>) {
    return {
      draw(ctx, width, height) {
        // draw gradient
      }
    }
  }
}
```


## Reverse transformation

If needed, you can implement `from`:

```ts
from(input) {
  // convert external format back to gradient
}
```


## How modules are resolved

gradiente selects a transformer based on:

```txt
target + gradientType
```

Example:

```txt
css + linear-gradient
canvas + radial-gradient
```


## Mental model

```txt
target = where you want to go
gradientType = what you are converting
```


## Built-in modules

gradiente already includes:

* CSS transformers
* Canvas transformers

Custom modules extend this system.


## Why this is powerful

You can:

* plug gradiente into any engine
* support custom rendering pipelines
* build adapters for tools (Konva, Pixi, WebGL, etc.)


## Summary

```txt
implement → register → use
```