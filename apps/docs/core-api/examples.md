# Examples

This page shows practical gradiente examples, from basic parsing to advanced extension.


## 1. Parse a gradient

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient"
console.log(gradient.type)

// false
console.log(gradient.isRepeating)

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 }
// ]
console.log(gradient.stops)
```


## 2. Check if a string is a gradient

```ts
import { isGradient } from 'gradiente'

// true
console.log(isGradient('linear-gradient(red, blue)'))

// false
console.log(isGradient('hello world'))
```

Use this before parsing user input.


## 3. Format a gradient

```ts
import { format } from 'gradiente'

// "linear-gradient(red, blue)"
console.log(format('linear-gradient(red,blue)'))
```

`format()` parses the input and serializes it back to a normalized string.


## 4. Inspect gradient config

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// Angles transforming in radians
// {
//   angle: 1.570796
// }
console.log(gradient.config)
```

The exact config depends on the gradient type.

For a linear gradient, config usually contains normalized direction data such as angle.


## 5. Convert gradient back to string

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')

// "linear-gradient(90deg, red, blue)"
console.log(gradient.toString())
```

Use `toString()` when you need a CSS-like gradient string again.


## 6. Convert gradient to JSON

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')

// {
//   type: "linear-gradient",
//   isRepeating: false,
//   config: {
//     angles: 0,
//   },
//   stops: [
//     { type: "color-stop", value: "red", position: 0 },
//     { type: "color-stop", value: "blue", position: 1 }
//   ]
// }
console.log(gradient.toJSON())
```

Use `toJSON()` when you need to store gradient data.


## 7. Clone a gradient

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
const copy = gradient.clone()

// "linear-gradient(red, blue)"
console.log(copy.toString())

// true
console.log(gradient.equals(copy))
```

`clone()` is useful when you want to modify a gradient without touching the original object.


## 8. Add a color stop

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
gradient.addStop({
  type: 'color-stop',
  value: 'green',
  position: 0.5
})

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 },
//   { type: "color-stop", value: "green", position: 0.5 }
// ]
console.log(gradient.stops)

// "linear-gradient(red, blue, green 50%)"
console.log(gradient.toString())
```

`position` is normalized from `0` to `1`.

```ts
0   // 0%
0.5 // 50%
1   // 100%
```


## 9. Add a color hint

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
gradient.addStop({
  type: 'color-hint',
  value: '50%',
  position: 0.5
})

console.log(gradient.stops)
// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 },
//   { type: "color-hint", value: "50%", position: 0.5 }
// ]
```

A `color-hint` is not a color stop.

It describes the interpolation midpoint between neighboring color stops.


## 10. Remove a stop

```ts
import { parse } from 'gradiente'

const gradient = parse('linear-gradient(red, green, blue)')
gradient.removeStop(1)

// [
//   { type: "color-stop", value: "red", position: 0 },
//   { type: "color-stop", value: "blue", position: 1 }
// ]
console.log(gradient.stops)

console.log(gradient.toString())
// "linear-gradient(red, blue)"
```

`removeStop(index)` removes a stop by array index.


## 11. Validate before parsing

```ts
import { isGradient, parse } from 'gradiente'

const input = 'linear-gradient(red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)

  console.log(gradient.toString())
  // "linear-gradient(red, blue)"
}
```

Use this when working with user input.


## 12. Handle invalid input

```ts
import { parse } from 'gradiente'

try {
  const gradient = parse('not-a-gradient')

  console.log(gradient)
} catch (error) {
  console.log(error instanceof Error ? error.message : 'Invalid gradient')
  // Example:
  // "No gradient registered for: not-a-gradient"
}
```

`parse()` throws when the input cannot be converted into a registered gradient type.


## 13. Parse a repeating gradient

```ts
import { parse } from 'gradiente'

const gradient = parse(
  'repeating-linear-gradient(to right, red 0%, blue 10%)'
)

// "linear-gradient"
console.log(gradient.type)

// true
console.log(gradient.isRepeating)

// "repeating-linear-gradient(to right, red 0%, blue 10%)"
console.log(gradient.toString())
```

Repeating gradients keep the same gradient type, but `isRepeating` is `true`.


## 14. Transform to CSS

```ts
import { transformTo } from 'gradiente'

const css = transformTo<string>(
  'css',
  'linear-gradient(to right, red, blue)'
)

// "linear-gradient(to right, red, blue)"
console.log(css)
```

The CSS transformer returns a string.


## 15. Transform an existing gradient

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(red, blue)')
const css = transformTo<string>('css', gradient)

// "linear-gradient(red, blue)"
console.log(css)
```

`transformTo()` accepts both strings and gradient objects.


## 16. Transform to Canvas

```ts
import { transformTo } from 'gradiente'

const paint = transformTo(
  'canvas',
  'linear-gradient(to right, red, blue)'
)

// "function"
console.log(typeof paint.draw)
```

Canvas transformers return a paint result.

You can draw it manually:

```ts
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

paint.draw(ctx, canvas.width, canvas.height)
```


## 17. Use with a canvas element

```ts
import { transformTo } from 'gradiente'

const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!

const paint = transformTo(
  'canvas',
  'linear-gradient(45deg, red, blue)'
)
paint.draw(ctx, canvas.width, canvas.height)


// "Gradient drawn"
console.log('Gradient drawn')
```


## 18. Transform from another format

```ts
import { transformFrom } from 'gradiente'

const gradient = transformFrom(
  'css',
  'linear-gradient',
  'linear-gradient(to right, red, blue)'
)

// "linear-gradient(to right, red, blue)"
console.log(gradient.toString())
```

`transformFrom()` converts target-specific input back into a gradiente gradient object.


## 19. Validate a Pattern DSL expression

```ts
import { validatePattern } from 'gradiente'

validatePattern('^[color-stop,~color-stop].')

// "Pattern is valid"
console.log('Pattern is valid')
```

`validatePattern()` throws if the pattern is invalid.


## 20. Check Pattern DSL safely

```ts
import { isPatternValid } from 'gradiente'

// true
console.log(isPatternValid('^[color-stop,~color-stop].'))

// false
console.log(isPatternValid('color-stop'))
```

Use `isPatternValid()` when you do not want to catch errors manually.


## 21. Invalid Pattern DSL example

```ts
import { validatePattern } from 'gradiente'

try {
  validatePattern('^(config|color-stop)~color-stop.')
} catch (error) {
    // Example:
    // "Implicit sequence is not allowed"
  console.log(error instanceof Error ? error.message : 'Invalid pattern')
}
```

The DSL does not allow implicit sequences.

Use this instead:

```ts
validatePattern('^[(config|color-stop),~color-stop].')
```


## 22. Custom transformer

```ts
import {
  GradientTransformer,
  LinearGradient,
  transformTo,
  type GradientBase,
  type IGradientTransformerModule
} from 'gradiente'

class LinearGradientToDebug
  implements IGradientTransformerModule<string> {
  readonly target = 'debug'
  readonly gradientType = 'linear-gradient'

  to(input: GradientBase<any>): string {
    if (!(input instanceof LinearGradient)) {
      throw new Error('Expected LinearGradient')
    }

    return `Linear gradient with ${input.stops.length} stops`
  }
}

GradientTransformer.add(new LinearGradientToDebug())

const result = transformTo<string>(
  'debug',
  'linear-gradient(red, blue)'
)

// "Linear gradient with 2 stops"
console.log(result)
```

Custom transformers let you export gradients to your own target format.


## 23. Remove a custom transformer

```ts
import { GradientTransformer } from 'gradiente'

const removed = GradientTransformer.remove(
  'debug',
  'linear-gradient'
)

// true
console.log(removed)
```

Use this when you need to unregister a transformer.


## 24. Check a registered transformer

```ts
import { GradientTransformer } from 'gradiente'

const transformer = GradientTransformer.get(
  'css',
  'linear-gradient'
)

// "css"
console.log(transformer?.target)

// "linear-gradient"
console.log(transformer?.gradientType)
```

Transformers are resolved by:

```txt
target + gradientType
```


## 25. Custom gradient type

```ts
import {
  GradientBase,
  GradientFactory,
  parse,
  parseStringToAbi,
  type GradientAbi
} from 'gradiente'

type MyGradientConfig = {
  angle: number
}

class MyGradient extends GradientBase<MyGradientConfig> {
  readonly type = 'my-gradient'
  readonly isRepeating = false

  static fromString(input: string): MyGradient {
    return this.fromAbi(parseStringToAbi(input))
  }

  static fromAbi(abi: GradientAbi): MyGradient {
    if (abi.functionName !== 'my-gradient') {
      throw new Error('Expected my-gradient')
    }

    return new MyGradient({
      config: { angle: 0 },
      stops: [
        { type: 'color-stop', value: 'red', position: 0 },
        { type: 'color-stop', value: 'blue', position: 1 }
      ]
    })
  }

  toString(): string {
    return 'my-gradient(red, blue)'
  }
}

GradientFactory.add('my-gradient', MyGradient)

const gradient = parse('my-gradient(red, blue)')

// "my-gradient"
console.log(gradient.type)

// "my-gradient(red, blue)"
console.log(gradient.toString())
```

This example is intentionally simple.

A real custom gradient should convert ABI inputs into config and stops.


## 26. Full workflow

```ts
import {
  parse,
  isGradient,
  format,
  transformTo
} from 'gradiente'

const input = 'linear-gradient(to right, red, blue)'

if (isGradient(input)) {
  const gradient = parse(input)
  gradient.addStop({
    type: 'color-stop',
    value: 'green',
    position: 0.5
  })

  const normalized = format(gradient)
  const css = transformTo<string>('css', gradient)
  const canvasPaint = transformTo('canvas', gradient)

  // "linear-gradient(to right, red, blue, green 50%)"
  console.log(normalized)

  // "linear-gradient(to right, red, blue, green 50%)"
  console.log(css)

  // "function"
  console.log(typeof canvasPaint.draw)
}
```


## Summary

Start simple:

```ts
parse(input)
```

Then inspect and modify:

```ts
gradient.stops
gradient.addStop(...)
gradient.toString()
```

Export to other systems:

```ts
transformTo('css', gradient)
transformTo('canvas', gradient)
```

Extend when needed:

```ts
GradientTransformer.add(...)
GradientFactory.add(...)
```