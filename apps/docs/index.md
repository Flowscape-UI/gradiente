---
layout: home

hero:
  name: "Gra-di-en-te"
  text: "Parse, normalize and render gradients."
  tagline: "A gradient engine for modern rendering systems - from CSS strings to structured data, Canvas, and beyond."
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: DSL Playground
      link: /playground/dsl
features:
  - icon:
      src: /icons/file-code.svg
    title: Parse gradients into data
    details: Turn CSS-like gradients into structured, predictable objects instead of fragile strings.
  - icon:
      src: /icons/checkbox.svg
    title: Normalize complex input
    details: Resolve angles, stops, positions and repeated forms into a consistent internal model.
  - icon:
      src: /icons/fork-outline.svg
    title: Transform anywhere
    details: Convert gradients to CSS, Canvas, and other rendering targets through a modular transformer system.
  - icon:
      src: /icons/cube-stacks.svg
    title: Built for engines and editors
    details: Designed for canvas engines, visual editors, design tools, whiteboards and custom render pipelines.
---

<br />

::: code-group
  ```bash [npm]
  npm install gradiente
  ```
  ```bash [pnpm]
  pnpm add gradiente
  ```
  ```bash [yarn]
  yarn add gradiente
  ```
  ```bash [bun]
  bun add gradiente
  ```
  ```js [JS module]
  <script type="module">
    import { parse } from 'https://unpkg.com/gradiente@2.0.0/dist/index.mjs';

    const gradient = parse('linear-gradient(red, blue)');
    console.log(gradient);
  </script>
  ```
:::


<div class="gradient-story">
  <div class="gradient-story__content">
    <p class="gradient-story__eyebrow">Gradients</p>
    <h2>Gradients look simple. They are not.</h2>
    <p>
      A gradient is just “a smooth transition between colors” - until you try to
      render it outside the browser. Different engines interpret angles differently,
      color spaces shift perception, and even something as simple as two color stops
      can produce noticeably different results.
    </p>
    <p>
      In CSS, gradients are strings. In real systems, they are data: angles,
      positions, interpolation rules and color models. If you don't control those
      parts, you don't really control the gradient.
    </p>
  </div>
  <div class="gradient-story__preview">
    <div class="gradient-card">
      <div class="gradient-card__visual"></div>
      <div class="gradient-card__code">
        <code class="code">
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 26%),
          linear-gradient(135deg, #ff74f6, #fb7655, #f63539);
        </code>
      </div>
    </div>
  </div>
</div>


<GradienteFlow />

<br /><br />

## Gradients are more complex than they look

A gradient is usually described as a smooth transition between colors.  
In practice, that definition is incomplete.

The moment you try to render the same gradient in different environments,  
you start noticing inconsistencies. Angles shift, transitions feel different,  
and sometimes the result does not match what you expected at all.

### Angles are not universal

In CSS, directions like `to right` or `135deg` follow a specific convention.  
Other systems often use a different reference point or rotation direction.

This means the same gradient can visually rotate when moved between systems,  
even if the numbers look identical.

---

### Interpolation is not just math

Blending two colors is not a single operation.

Depending on the color space used, the transition can feel:

- muddy
- overly saturated
- perceptually uneven

RGB, HSL, Lab or OKLCH will all produce different results from the same inputs.

---

### Stops are implicit logic

When you write:

```css
linear-gradient(red, blue)
```

you are not providing full information.

The system must infer:

- where each stop is positioned
- how they are distributed
- how to interpolate between them

These defaults are part of the rendering logic, not the syntax.

---

### Rendering targets disagree

Browsers can render gradients that Canvas cannot directly reproduce.
Some engines lack features like color hints or advanced interpolation.

To make gradients portable, they must be transformed into a normalized model
that different renderers can understand.

---

Gradients look simple because the syntax is compact.
But under the surface, they behave more like structured data than strings.

<br /><br />

# Part of a bigger system

Gradiente exists because gradients stop being simple the moment you try to control them.

But this problem does not end with gradients.

The same questions appear everywhere:
- how to represent visual data in a consistent way
- how to move it between different rendering systems
- how to keep behavior predictable as complexity grows

Gradiente is one answer to that - focused on color and transitions.

Flowscape is the broader system behind it.  
A 2D engine designed for building visual editors, tools and rendering pipelines where everything is treated as structured data instead of fragile abstractions.

Gradients are just one layer.

---

If you are building something visual - a canvas, an editor, a design tool - you will eventually run into the same problems.

This is where it starts.