<div align="center">

  <img src="https://raw.githubusercontent.com/Flowscape-UI/gradiente/fff32510afe7e3e1b7b2f73dbf7246843a06d859/assets/logo.svg" alt="gradiente logo" />

  <h1>gradiente</h1>

  <p>Minimalist & lightweight engine for sophisticated web gradients</p>

  <img src="./assets//flowscape-badge.svg" alt="npm version" />

  <a href="https://www.npmjs.com/package/gradiente">
    <img src="https://img.shields.io/npm/v/gradiente.svg?style=flat-square&labelColor=d84f4c&color=black" alt="npm version">
  </a>
  <a href="https://bundlephobia.com/result?p=gradiente">
    <img src="https://img.shields.io/bundlephobia/minzip/gradiente?style=flat-square&labelColor=d84f4c&color=black" alt="bundle size"/>
  </a>
  <a href="https://github.com/Flowscape-UI/gradiente/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Flowscape-UI/gradiente?style=flat-square&labelColor=d84f4c&color=black" alt="license"/>
  </a>
</div>


# Gradiente

**Gradiente** is a lightweight gradient parser and transformer for modern rendering systems.

Parse CSS gradients → work with structured data → render anywhere.

> Gradients as data, not strings.

---

## Install

```bash
npm install gradiente
````

---

## Example

```ts
import { parse, transformTo } from "gradiente";

const gradient = parse("linear-gradient(red, blue)");

const css = transformTo("css", gradient);
const canvas = transformTo("canvas", gradient);

canvas.draw(ctx, 300, 300);
```

---

## Supported

```ts
linear-gradient(...)
repeating-linear-gradient(...)

radial-gradient(...)
repeating-radial-gradient(...)

conic-gradient(...)
repeating-conic-gradient(...)
```

---

## What it does

* Parses gradients into structured objects
* Normalizes angles, positions, and stops
* Transforms gradients to different targets:

  * CSS
  * Canvas
  * (more coming)

---

## Built for

* design tools
* visual editors
* canvas engines
* WebGL / Pixi / Konva
* custom rendering pipelines

---

## Status

* [x] linear gradients
* [x] radial gradients
* [x] conic gradients
* [x] canvas + css transformers
* [ ] docs
* [ ] playground
* [ ] more render targets

---

## Philosophy

Gradiente treats gradients as a graphics primitive.

Not a string to preserve -
but data you can transform and render anywhere.