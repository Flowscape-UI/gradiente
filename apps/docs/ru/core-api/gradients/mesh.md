# Mesh Gradients

Mesh gradient - это цветовая поверхность из вершин и патчей. Это самый явный
встроенный тип Gradiente: вместо одного направления, радиуса или угла ты
описываешь маленькую топологию, а рендер сэмплит цвета внутри нее.

<GradientPreview
  title="Mesh gradient rendered by Gradiente"
  gradient="mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)"
  caption="Превью рендерится CSS-трансформером Gradiente из этой точной mesh-gradient строки."
/>

## Ментальная модель

У mesh есть четыре слоя:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>grid</strong>
    <span>Объявляет topology: сколько рядов и колонок вершин ожидается, какой метод сэмплинга используется и в каком color space интерполируются цвета.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>vertices</strong>
    <span>Именованные точки. У каждой вершины есть id, x/y позиция и цвет.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>patches</strong>
    <span>Ячейки из четырех ссылок на вершины: top-left, top-right, bottom-right, bottom-left.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>handles</strong>
    <span>Опциональные edge metadata для cubic patch control. Gradiente парсит и сериализует их; renderers могут использовать это для curved patch geometry.</span>
  </div>
</div>

Минимальный валидный mesh - это `2 x 2` grid: четыре вершины и один patch.

## Полный синтаксис

```css
mesh-gradient(
  grid rows columns method bilinear|bicubic [in color-space [hue-mode hue]],
  vertex id x y color,
  vertex id x y color,
  patch id topLeft topRight bottomRight bottomLeft,
  handle patchId side fromX fromY toX toY
)
```

Части разделяются запятыми. Цвета могут содержать пробелы и вложенные функции,
потому что Gradiente разделяет только top-level commas.

```css
vertex v11 50% 50% hsl(39, 79%, 57%)
```

## Grid

```css
grid 3 3 method bicubic in oklch
```

Поля grid:

```txt
rows          количество рядов вершин
columns       количество колонок вершин
method        "bilinear" или "bicubic"
interpolation опциональный "in ..." color interpolation config
```

Правила:

- `rows` должен быть integer >= `2`.
- `columns` должен быть integer >= `2`.
- vertex count должен быть `rows * columns`.
- patch count должен быть `(rows - 1) * (columns - 1)`.
- `mesh-gradient` не поддерживает repeating gradients.

Примеры:

```txt
2 x 2 grid => 4 vertices, 1 patch
3 x 3 grid => 9 vertices, 4 patches
4 x 4 grid => 16 vertices, 9 patches
```

Дефолты:

```txt
rows: 2
columns: 2
method: "bilinear"
interpolation.colorSpace: "srgb"
```

Gradiente может вывести `rows` и `columns` из регулярных vertex ids или counts,
но для человека лучше писать grid явно.

## Vertex ids

Id вершины должен соответствовать:

```txt
^[A-Za-z_][A-Za-z0-9_-]*$
```

Для регулярной сетки лучше использовать id, в которых закодированы column и row:

```txt
v00 => column 0, row 0
v10 => column 1, row 0
v01 => column 0, row 1
v11 => column 1, row 1
```

Separated ids тоже работают:

```txt
v0_0
v1_0
v0_1
v1_1
```

Bicubic sampling требует регулярные ids, чтобы Gradiente мог найти соседние
вершины.

## Vertices

```css
vertex v00 0% 0% #5851db
```

Поля vertex:

```txt
vertex      literal keyword
id          стабильный id вершины
x           horizontal position
y           vertical position
color       любой Culori-readable color
```

Для responsive rendering обычно удобнее проценты:

```css
vertex v00 0% 0% #5851db
vertex v10 100% 0% #c13584
vertex v01 0% 100% #fcb045
vertex v11 100% 100% #405de6
```

Вершины не обязаны быть визуально идеально выровнены, но topology должна
соответствовать grid. Вершину можно сместить, чтобы исказить поверхность:

```css
vertex v11 47% 58% #ffdc80
```

## Patches

```css
patch p00 v00 v10 v11 v01
```

Поля patch:

```txt
patch        literal keyword
id           стабильный patch id
topLeft      vertex id
topRight     vertex id
bottomRight  vertex id
bottomLeft   vertex id
```

Порядок важен: всегда clockwise от top-left.

Для `2 x 2` grid:

```txt
v00 ---- v10
 |        |
 |  p00   |
 |        |
v01 ---- v11
```

Patch:

```css
patch p00 v00 v10 v11 v01
```

Для `3 x 3` grid:

```txt
v00 ---- v10 ---- v20
 |  p00   |  p10   |
v01 ---- v11 ---- v21
 |  p01   |  p11   |
v02 ---- v12 ---- v22
```

Patches:

```css
patch p00 v00 v10 v11 v01
patch p10 v10 v20 v21 v11
patch p01 v01 v11 v12 v02
patch p11 v11 v21 v22 v12
```

## Handles

Handles - это опциональные edge metadata:

```css
handle p00 top 25% 0% 75% 0%
```

Поля handle:

```txt
handle   literal keyword
patchId  target patch id
side     "top" | "right" | "bottom" | "left"
fromX    x первой control coordinate
fromY    y первой control coordinate
toX      x второй control coordinate
toY      y второй control coordinate
```

Gradiente валидирует, хранит, клонирует, сериализует и возвращает handles через
`getPatches()`. Текущий color sampling строится по vertices и patches; handles -
это reserved metadata для рендеров с cubic patch geometry.

## Минимальный mesh

```css
mesh-gradient(
  grid 2 2 method bilinear,
  vertex v00 0% 0% red,
  vertex v10 100% 0% blue,
  vertex v01 0% 100% yellow,
  vertex v11 100% 100% cyan,
  patch p00 v00 v10 v11 v01
)
```

<GradientPreview
  title="Minimal 2 x 2 bilinear mesh"
  gradient="mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% cyan, patch p00 v00 v10 v11 v01)"
/>

## Bilinear sampling

`bilinear` сэмплит каждый patch по четырем corner colors.

Внутри одного patch:

```txt
u: horizontal local coordinate от 0 до 1
v: vertical local coordinate от 0 до 1
```

Сэмплер интерполирует:

```txt
top    = mix(topLeft, topRight, u)
bottom = mix(bottomLeft, bottomRight, u)
color  = mix(top, bottom, v)
```

Используй `bilinear`, когда нужна более дешевая отрисовка и прямое смешивание
углов.

## Bicubic sampling

`bicubic` использует соседние вершины grid, чтобы получить более гладкую
поверхность. Это лучше подходит для мягких generated backgrounds.

Требования:

- регулярные vertex ids: `v00`, `v10`, `v01`, `v11`;
- patches должны соответствовать соседним grid cells;
- grid должен быть полным.

Если bicubic sampling не может построить регулярную сетку, Gradiente бросает
ошибку validation/sampling вместо молчаливого неправильного результата.

<GradientPreview
  title="Bicubic 4 x 4 mesh"
  gradient="mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)"
/>

## Color interpolation

Mesh interpolation задается в строке grid:

```css
grid 3 3 method bicubic in srgb
grid 3 3 method bicubic in oklch
grid 3 3 method bicubic in oklch longer hue
```

Hue modes:

```txt
shorter
longer
increasing
decreasing
```

Hue mode применяется только к polar color spaces. Если color space не polar,
Gradiente игнорирует hue mode при нормализации.

## Парсинг и чтение

```ts
import { parse } from 'gradiente'

const input = `mesh-gradient(
  grid 2 2 method bicubic in oklch,
  vertex v00 0% 0% #5851db,
  vertex v10 100% 0% #c13584,
  vertex v01 0% 100% #fcb045,
  vertex v11 100% 100% #405de6,
  patch p00 v00 v10 v11 v01
)`

const gradient = parse(input)

// "mesh-gradient"
console.log(gradient.type)

console.log(gradient.getConfig())
console.log(gradient.getVertices())
console.log(gradient.getPatches())
```

## Сэмплинг цвета

`samplePatchColor(patchId, u, v)` сэмплит один patch в локальных координатах.

```ts
const color = gradient.samplePatchColor('p00', 0.5, 0.5)

console.log(color)
```

`u` и `v` должны быть от `0` до `1`.

```txt
u = 0, v = 0 => top-left patch corner
u = 1, v = 0 => top-right patch corner
u = 1, v = 1 => bottom-right patch corner
u = 0, v = 1 => bottom-left patch corner
```

## Трансформация

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(input)

const cssBackground = transformTo('css', gradient)
```

CSS output генерирует renderable adapter background для mesh gradients, потому
что в браузерах нет нативной функции `mesh-gradient()`.

## Как создать mesh шаг за шагом

1. Выбери размер grid.
2. Нарисуй layout вершин.
3. Назови вершины по column и row.
4. Задай x/y позиции.
5. Задай цвета.
6. Создай patch для каждой ячейки.
7. Выбери `bilinear` или `bicubic`.
8. Выбери interpolation color space.
9. Сделай parse и validation.
10. Нормализуй перед сохранением.

Для `3 x 3` mesh:

```txt
vertices: 3 * 3 = 9
patches: (3 - 1) * (3 - 1) = 4
```

Сначала vertices:

```css
vertex v00 0% 0% #5851db
vertex v10 50% 0% #c13584
vertex v20 100% 0% #fcb045
vertex v01 0% 50% #fd1d1d
vertex v11 50% 50% #ffdc80
vertex v21 100% 50% #405de6
vertex v02 0% 100% #833ab4
vertex v12 50% 100% #f77737
vertex v22 100% 100% #2fd3c4
```

Потом patches:

```css
patch p00 v00 v10 v11 v01
patch p10 v10 v20 v21 v11
patch p01 v01 v11 v12 v02
patch p11 v11 v21 v22 v12
```

Потом все вместе:

```css
mesh-gradient(grid 3 3 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 50% 0% #c13584, vertex v20 100% 0% #fcb045, vertex v01 0% 50% #fd1d1d, vertex v11 50% 50% #ffdc80, vertex v21 100% 50% #405de6, vertex v02 0% 100% #833ab4, vertex v12 50% 100% #f77737, vertex v22 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

## Частые ошибки

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Неверное число vertices</strong>
    <span>`grid 3 3` требует ровно 9 vertices.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Неверное число patches</strong>
    <span>`grid 3 3` требует ровно 4 patches.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Неверный patch order</strong>
    <span>Нужен порядок `topLeft topRight bottomRight bottomLeft`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Missing vertex</strong>
    <span>Каждая ссылка patch должна указывать на существующий vertex id.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Non-regular ids with bicubic</strong>
    <span>Bicubic нужны ids, которые Gradiente может сопоставить rows/columns.</span>
  </div>
</div>

## Производительность

Mesh тяжелее, чем linear, radial, diamond и conic. Для interactive tools:

- парси только когда input меняется;
- кэшируй parsed gradient objects;
- не пересоздавай CSS/SVG output на каждый pointer move;
- во время редактирования рендерь маленькие previews, а для export - большие.

## Что тестировать

```css
mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% cyan, patch p00 v00 v10 v11 v01)
mesh-gradient(grid 2 2 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 100% 0% #c13584, vertex v01 0% 100% #fcb045, vertex v11 100% 100% #405de6, patch p00 v00 v10 v11 v01)
mesh-gradient(grid 3 3 method bicubic in oklch, vertex v00 0% 0% #5851db, vertex v10 50% 0% #c13584, vertex v20 100% 0% #fcb045, vertex v01 0% 50% #fd1d1d, vertex v11 50% 50% #ffdc80, vertex v21 100% 50% #405de6, vertex v02 0% 100% #833ab4, vertex v12 50% 100% #f77737, vertex v22 100% 100% #2fd3c4, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```
