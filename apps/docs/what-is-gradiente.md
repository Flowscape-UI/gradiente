# What is gradiente

gradiente is a gradient engine for software that needs gradients to behave like
data, not like fragile strings.

It parses gradients into a structured model, normalizes them, validates them,
and transforms them into renderer-specific output for CSS, Canvas 2D, WebGL, and
SVG. The goal is simple: one gradient definition should be able to move through
an editor, a renderer, a serializer, a preset system, and a custom engine without
losing meaning.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('linear-gradient(to right, red, blue)')
const css = transformTo('css', gradient)
```

That looks small, but the idea behind it is larger. gradiente is infrastructure
for gradients.

## Why It Exists

gradiente came from a real product problem.

While building the flowscape engine, I needed a gradient library that was
universal, extensible, and safe enough to become part of a rendering foundation.
The engine needed to handle gradients as editable state, not as decorative CSS
snippets. A gradient had to be parsed, inspected, transformed, rendered,
serialized, compared, tested, and eventually extended with custom behavior.

For simple colors, the ecosystem already has excellent tools. `culori` is a
great example: it treats colors seriously, supports many color spaces, and gives
developers a reliable foundation for color manipulation.

For gradients, I could not find an equivalent foundation.

CSS gives us gradient syntax. Browsers render that syntax. Some libraries can
generate strings. But a renderer-agnostic gradient model that can be safely used
inside engines, editors, and tooling was missing. That gap is why gradiente
exists.

## The Problem With Strings

Most gradients start their life as strings:

```css
linear-gradient(to right, red, blue)
```

A string is great when the only goal is to hand it to a browser. It is weak when
the gradient becomes application state.

Once gradients enter real tools, you need to answer harder questions:

- Is this gradient valid?
- What type of gradient is it?
- What are its stops, hints, vertices, patches, or geometry settings?
- Can it be normalized before saving?
- Can it be rendered outside CSS?
- Can it be compared with another gradient?
- Can it survive a visual editor roundtrip?
- Can a custom renderer use the same source of truth?

Strings do not answer those questions cleanly. They force every system to parse
and reinterpret the same syntax again.

gradiente exists to make that unnecessary.

## The Core Idea

gradiente treats a gradient as a structured object.

```ts
import { parse, format } from 'gradiente'

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')

console.log(gradient.type)
console.log(gradient.getConfig())

if ('getStops' in gradient) {
  console.log(gradient.getStops())
}

console.log(format(gradient))
```

The string is still important. It remains the human-friendly input and output
format. But inside the system, the string is not the source of truth forever.
After parsing, gradiente works with a model that can be validated, transformed,
and reasoned about.

## More Than CSS Gradients

CSS gradients are only one target.

gradiente can transform the same internal model into different rendering
outputs:

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse('radial-gradient(circle at 30% 35%, white, blue)')

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

This matters because modern tools rarely have one rendering layer. A design
editor may use CSS for previews, Canvas for interaction, WebGL for performance,
and SVG for export. The gradient should not be rewritten for each target.

gradiente keeps the gradient definition stable and lets transformer modules
adapt it to the renderer.

## Custom Transformers

The built-in targets are not a ceiling. A product can register its own
transformer module and use it through the same `transformTo()` entry point as
the official modules.

A transformer module follows a small contract:

- `target` is the output system name, such as `css`, `svg`, or your own
  `design-token`.
- `gradientType` is the gradient kind the module accepts, such as
  `linear-gradient`.
- `target + gradientType` is the registry key.
- `to()` transforms a gradiente model into your output format.
- `from()` is optional and can be added when the output format can be converted
  back into a gradiente model through `transformFrom()`.

For reusable modules, extend `GradientTransformerModule`. The base class checks
that the incoming gradient has the expected runtime type before calling your
`transform()` method:

```ts
import {
  GradientLinear,
  GradientTransformer,
  GradientTransformerModule,
  parse,
  transformTo,
} from 'gradiente'

type DesignTokenStop =
  | {
      type: 'color-stop'
      color: string
      position: number
    }
  | {
      type: 'color-hint'
      position: number
    }

type DesignTokenGradient = {
  kind: 'gradient'
  syntax: string
  stops: DesignTokenStop[]
}

class LinearGradientToDesignToken extends GradientTransformerModule<
  GradientLinear,
  DesignTokenGradient
> {
  constructor() {
    super({
      target: 'design-token',
      gradientType: 'linear-gradient',
      gradientClass: GradientLinear,
      expectedName: 'GradientLinear',
    })
  }

  protected transform(gradient: GradientLinear): DesignTokenGradient {
    return {
      kind: 'gradient',
      syntax: gradient.toString(),
      stops: gradient.getStops().map((stop) => {
        if (stop.type === 'color-hint') {
          return {
            type: stop.type,
            position: stop.position,
          }
        }

        return {
          type: stop.type,
          color: stop.value,
          position: stop.position,
        }
      }),
    }
  }
}

GradientTransformer.add(new LinearGradientToDesignToken())

const gradient = parse('linear-gradient(to right, red 0%, blue 100%)')
const token = transformTo<DesignTokenGradient>('design-token', gradient)
```

That means gradiente can power custom renderers, export formats, design-token
pipelines, editor preview systems, native bridges, or internal engine adapters
without changing the gradient model itself.

## Built For Real Gradient Types

gradiente currently supports five built-in gradient kinds:

- `linear-gradient`
- `radial-gradient`
- `diamond-gradient`
- `conic-gradient`
- `mesh-gradient`

Some of these are native to CSS. Some are gradiente-specific.

That distinction is intentional. A gradient engine should not be limited to the
exact functions browsers support today. It should be able to model useful
gradient concepts and then produce renderable output for the target that needs
them.

For example, `diamond-gradient` and `mesh-gradient` are not native CSS
functions. gradiente can still parse them, normalize them, inspect them, and
transform them into CSS adapter output, Canvas output, WebGL output, or SVG
output.

## Safety And Extensibility

Extensibility is only useful when it is safe.

gradiente is designed around explicit gradient kinds, transformer modules, and
validation rules. A gradient should not become a bag of loosely related values.
It should have a known type, known configuration, known data shape, and known
transformers.

That is why the public API is intentionally small:

```ts
import { format, isGradient, parse, transformTo } from 'gradiente'

isGradient('linear-gradient(red, blue)')

const gradient = parse('linear-gradient(red, blue)')
const normalized = format(gradient)
const css = transformTo('css', gradient)
```

Small APIs are easier to trust. The complexity stays inside the engine, where it
can be tested and shared across renderers.

## The Philosophy

gradiente is built on a few principles:

- A gradient is data before it is pixels.
- The internal model is the source of truth.
- Renderers are adapters, not owners of gradient meaning.
- Parsing, normalization, validation, and transformation should be consistent.
- Custom gradient systems should be possible without rewriting the foundation.
- Good defaults matter, but users must still be able to control the details.

This is the same philosophy that led to the library in the first place. If a
visual engine needs gradients as a serious primitive, a plain string helper is
not enough. The gradient system has to be stable, typed, extensible, and
renderer-agnostic.

## What gradiente Is Not

gradiente is not a replacement for CSS.

It is not trying to become a design application, a full renderer, or a color
science library. It also does not replace `culori`; gradiente depends on the
kind of color-level foundation that libraries like `culori` make possible.

gradiente focuses on the layer above individual colors: the gradient itself.

It owns the shape of the gradient, the stop model, the custom gradient kinds,
the normalization rules, and the transformation pipeline.

## Where It Fits

gradiente is designed for:

- rendering engines;
- visual editors;
- design tools;
- gradient generators;
- canvas and WebGL systems;
- preset and theme systems;
- applications that need portable gradient definitions.

It started as infrastructure for flowscape, but it is built to be useful outside
flowscape as well.

If your app only needs one hard-coded CSS background, you probably do not need
gradiente. If gradients are editable, generated, transformed, validated,
serialized, or rendered across multiple targets, gradiente is the layer that
makes that work predictable.

## Next Step

Start with the practical API:

[Getting Started →](/getting-started)

Then explore the built-in gradient types:

[Gradient Types →](/core-api/gradients/)
