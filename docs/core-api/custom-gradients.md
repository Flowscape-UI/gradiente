# Custom Gradient Types

gradiente is not limited to built-in CSS gradients.
You can register your own gradient type and make it work with the same public API:

```ts
parse(...)
isGradient(...)
format(...)
transformTo(...)
transformFrom(...)
```

This is what makes gradiente extensible.


## Core idea

A gradient type is not just a string format.

In gradiente, a gradient type is a class that knows how to:

* read ABI data
* create a gradient instance
* expose structured properties
* serialize itself back to string
* work with transformers


## Mental model

```txt
gradient string
  ↓
parseStringToAbi()
  ↓
GradientFactory
  ↓
registered gradient class
  ↓
gradient object
```

Example:

```ts
const gradient = parse('linear-gradient(to right, red, blue)')
```

Internally:

```txt
linear-gradient(...)
  ↓
ABI with functionName = "linear-gradient"
  ↓
GradientFactory.get("linear-gradient")
  ↓
LinearGradient.fromAbi(...)
  ↓
LinearGradient instance
```


## GradientFactory

`GradientFactory` is the registry that connects a gradient function name to a gradient class.

```ts
GradientFactory.add("linear-gradient", LinearGradient)
GradientFactory.add("radial-gradient", RadialGradient)
GradientFactory.add("conic-gradient", ConicGradient)
```

When `parse()` receives a string, gradiente uses this registry to find the correct class.


## Required static interface

A custom gradient class must implement the static gradient interface:

```ts
export interface IGradientStatic<TGradient extends GradientBase = GradientBase> {
  fromAbi(abi: GradientAbi): TGradient
  fromString(input: string): TGradient
}
```

This means every registered gradient class must know how to create itself from:

* ABI
* string input


## Instance interface

A gradient instance should behave like every other gradient:

```ts
export interface IGradientBase<TConfig = unknown> {
  readonly type: GradientType
  readonly isRepeating: boolean
  readonly config: TConfig
  readonly stops: GradientStop[]

  clone(): this
  toString(): string
  toJSON(): GradientData<TConfig>
  addStop(stop: GradientStop): void
  removeStop(index: number): void
  equals(other: IGradientBase<TConfig>): boolean
}
```

This is important.

Once your custom gradient follows this shape, it can participate in the same ecosystem as built-in gradients.


## What registration does

Registration teaches gradiente how to create a gradient.

```ts
GradientFactory.add("my-gradient", MyGradient)
```

After this, the factory can resolve:

```ts
parse("my-gradient(...)")
```

Without registration, gradiente does not know what class should handle the input.


## Basic custom gradient structure

A custom gradient usually looks like this:

```ts
import {
  GradientBase,
  type GradientAbi,
  type GradientStop,
} from 'gradiente'

type MyGradientConfig = {
  angle: number
}

export class MyGradient extends GradientBase<MyGradientConfig> {
  public readonly type = 'my-gradient'
  public readonly isRepeating = false

  public static fromString(input: string): MyGradient {
    return this.fromAbi(parseStringToAbi(input))
  }

  public static fromAbi(abi: GradientAbi): MyGradient {
    return new MyGradient({
      config: {
        angle: 0,
      },
      stops: [
        // convert ABI inputs into stops
      ],
    })
  }

  public clone(): this {
    return new MyGradient({
      config: { ...this.config },
      stops: [...this.stops],
    }) as this
  }

  public toString(): string {
    return `my-gradient(...)`
  }
}
```

This is only a simplified example.

The real implementation should parse config, stops, positions, hints, and validation rules according to your gradient type.


## Full lifecycle

A custom gradient type usually goes through this lifecycle:

```txt
1. define the gradient syntax
2. define the ABI pattern
3. implement the gradient class
4. register it in GradientFactory
5. optionally add transformers
6. use it through public API
```


## Step 1 - define the syntax

First decide what your gradient looks like.

Example:

```css
my-gradient(45deg, red, blue)
```

This means the function name is:

```txt
my-gradient
```

The input contains:

```txt
config, color-stop, color-stop
```


## Step 2 - define validation rules

Use the Pattern DSL to describe allowed ABI structure.

```txt
^[config,color-stop,color-stop].
```

This means:

```txt
begin pattern
config
then color-stop
then color-stop
end pattern
```

For a more flexible type:

```txt
^[([config,color-stop]|color-stop),~color-stop].
```

This allows:

```txt
config, color-stop
config, color-stop, color-stop
color-stop
color-stop, color-stop
```

The pattern controls what structures are accepted before the gradient class is created.


## Step 3 - implement fromAbi

`fromAbi()` is the most important part.

It receives parsed ABI data and converts it into your gradient class.

```ts
public static fromAbi(abi: GradientAbi): MyGradient {
  if (abi.functionName !== 'my-gradient') {
    throw new Error('Expected my-gradient')
  }

  return new MyGradient({
    config: parseMyConfig(abi.inputs),
    stops: parseMyStops(abi.inputs),
  })
}
```

This is where your gradient becomes structured.


## Step 4 - implement fromString

Usually `fromString()` is a small helper:

```ts
public static fromString(input: string): MyGradient {
  return this.fromAbi(parseStringToAbi(input))
}
```

The string is parsed into ABI first.

Then ABI is converted into a class instance.


## Step 5 - implement serialization

Your gradient should be able to return back to string:

```ts
gradient.toString()
```

Example:

```ts
public toString(): string {
  const stops = this.stops.map((stop) => stop.value).join(', ')
  return `my-gradient(${stops})`
}
```

This is what makes `format()` work.

```ts
format('my-gradient(red, blue)')
```

Internally:

```txt
parse(input).toString()
```


## Step 6 - register the gradient

Register your class:

```ts
GradientFactory.add('my-gradient', MyGradient)
```

Now it becomes available through the public API:

```ts
const gradient = parse('my-gradient(red, blue)')
```

And validation works too:

```ts
isGradient('my-gradient(red, blue)') // true
```


## Step 7 - add transformers

A gradient class defines the data model.

A transformer defines how to export it.

```txt
GradientFactory.add(...)
  → teaches gradiente how to create the gradient

GradientTransformer.add(...)
  → teaches gradiente how to convert the gradient
```

Example:

```ts
class MyGradientToCss {
  target = 'css'
  gradientType = 'my-gradient'

  to(input: GradientBase<any>): string {
    return input.toString()
  }
}
```

Register it:

```ts
GradientTransformer.add(new MyGradientToCss())
```

Use it:

```ts
transformTo('css', 'my-gradient(red, blue)')
```


## Why this is not just a parser

A parser only answers:

```txt
Can I read this string?
```

A custom gradient type answers more:

```txt
Can I parse it?
Can I validate it?
Can I normalize it?
Can I clone it?
Can I serialize it?
Can I transform it?
Can I plug it into another renderer?
```

That is the difference.


## Built-in gradients use the same idea

Built-in gradients are not special.

They are registered gradient classes too:

```ts
GradientFactory.add("linear-gradient", LinearGradient)
GradientFactory.add("radial-gradient", RadialGradient)
GradientFactory.add("conic-gradient", ConicGradient)
```

This means custom gradients can follow the same architecture as internal gradients.


## Practical use cases

Custom gradient types are useful when you need:

* mesh gradients
* diamond gradients
* editor-specific gradients
* shader gradients
* design-tool-only gradients
* engine-specific gradient formats


## Example: diamond gradient

A future custom gradient could look like:

```css
diamond-gradient(at center, red, blue)
```

Possible ABI structure:

```txt
config, color-stop, color-stop
```

Pattern:

```txt
^[config,color-stop,color-stop].
```

Registered as:

```ts
GradientFactory.add('diamond-gradient', DiamondGradient)
```

Then exported through:

```ts
GradientTransformer.add(new DiamondGradientToCanvas())
GradientTransformer.add(new DiamondGradientToCss())
```


## Summary

Custom gradient support is built around two registries:

```txt
GradientFactory
GradientTransformer
```

Use `GradientFactory` when you want to teach gradiente how to create a gradient.

Use `GradientTransformer` when you want to teach gradiente how to export or import it.


## Final model

```txt
custom gradient syntax
  ↓
ABI
  ↓
custom gradient class
  ↓
GradientFactory registration
  ↓
public API
  ↓
optional transformers
```