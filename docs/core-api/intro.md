# Core API

gradiente exposes a small public API for parsing, checking, formatting, and transforming gradients.

## parse

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
````

`parse()` converts a gradient string into a gradient object.

Under the hood, gradiente tokenizes the string, builds ABI, and creates the correct gradient class.

## isGradient

```ts
import { isGradient } from 'gradiente'

isGradient('linear-gradient(red, blue)') // true
isGradient('hello world') // false
```

Use it when you need a safe validation check.

## format

```ts
import { format } from 'gradiente'

format('linear-gradient(to right, red, blue)')
```

`format()` parses and serializes the gradient back to a normalized string.

It also accepts an existing gradient object:

```ts
const gradient = parse('linear-gradient(red, blue)')

format(gradient)
```

## transformTo

```ts
import { transformTo } from 'gradiente'

const css = transformTo('css', 'linear-gradient(to right, red, blue)')
```

`transformTo()` converts a gradient into a target format.

Examples of targets:

```txt
css
canvas
konva
pixi
```

Some targets may be planned or custom.

## transformFrom

```ts
import { transformFrom } from 'gradiente'

const gradient = transformFrom('css', 'linear-gradient', {
  // target-specific input
})
```

`transformFrom()` creates a gradiente gradient object from another target format.

## Mental model

```txt
string
  ↓ parse()
gradient object
  ↓ format()
string

gradient object
  ↓ transformTo()
target format

target format
  ↓ transformFrom()
gradient object
```

## Summary

Use:

```txt
parse        → create gradient object
isGradient   → validate input safely
format       → normalize to string
transformTo  → export to target format
transformFrom → import from target format
```