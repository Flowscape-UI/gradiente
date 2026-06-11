<script setup lang="ts">
import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import { parse, transformTo } from 'gradiente'

type CanvasTarget = 'canvas-2d'

type MeshPreviewExample = {
  id: string
  label: string
  input: string
}

type MeshPreviewState = {
  normalized: string
  cssBackground: string
  svgId: string
  svgDefs: string
  error: string
  isReady: boolean
}

type SvgPreviewPayload = {
  id: string
  defs: string
}

function createSvgPreview(svgPayload: SvgPreviewPayload, id: string) {
  return {
    id,
    defs: svgPayload.defs.replaceAll(svgPayload.id, id),
  }
}

const heroMesh = 'mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)'

const simpleMesh = 'mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01)'

const inferredGridMesh = 'mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)'

const distortedMesh = 'mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)'

const gridMesh = 'mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'

const bicubicMesh = 'mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'

const hueMesh = 'mesh-gradient(grid 2 2 method bilinear in hsl longer hue, vertex v00 0% 0% hsl(10, 100%, 50%), vertex v10 100% 0% hsl(350, 100%, 50%), vertex v01 0% 100% hsl(10, 100%, 50%), vertex v11 100% 100% hsl(350, 100%, 50%), patch p00 v00 v10 v11 v01)'

const handleMesh = 'mesh-gradient(grid 2 2 method bicubic in oklch longer hue, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01, handle p00 top 25% 0% 75% 0%, handle p00 right 100% 25% 100% 75%)'

function makeMeshExample(
  id: string,
  label: string,
  input: string,
): MeshPreviewExample {
  return {
    id,
    label,
    input,
  }
}

const examples = {
  hero: makeMeshExample(
    'hero',
    '4x4 bicubic OKLab field',
    heroMesh,
  ),
  anatomy: makeMeshExample(
    'anatomy',
    'Grid, vertices, patch, method, and interpolation',
    simpleMesh,
  ),
  inferredGrid: makeMeshExample(
    'inferred-grid',
    'Inferred 2x2 grid',
    inferredGridMesh,
  ),
  distorted: makeMeshExample(
    'distorted',
    'Distorted vertex positions',
    distortedMesh,
  ),
  grid3x3: makeMeshExample(
    'grid-3x3',
    '3x3 topology with four patches',
    gridMesh,
  ),
  bilinear: makeMeshExample(
    'bilinear',
    'Bilinear patch sampling',
    gridMesh,
  ),
  bicubic: makeMeshExample(
    'bicubic',
    'Bicubic patch sampling',
    bicubicMesh,
  ),
  hue: makeMeshExample(
    'hue',
    'HSL longer hue sampling',
    hueMesh,
  ),
  handles: makeMeshExample(
    'handles',
    'Serialized patch handles',
    handleMesh,
  ),
  constructor: makeMeshExample(
    'constructor',
    'Equivalent constructor output',
    simpleMesh,
  ),
  sampling: makeMeshExample(
    'sampling',
    'Patch color sampling input',
    distortedMesh,
  ),
  transform: makeMeshExample(
    'transform',
    'Renderer transformer input',
    bicubicMesh,
  ),
  format: makeMeshExample(
    'format',
    'Formatted user input',
    inferredGridMesh,
  ),
}

const exampleList = Object.values(examples)
const previewStates = ref<Record<string, MeshPreviewState>>({})
const canvas2dRefs = new Map<string, HTMLCanvasElement>()
const webglSurfaceRefs = new Map<string, HTMLElement>()
const webglSnapshots = ref<Record<string, string>>({})
const webglErrors = ref<Record<string, string>>({})
const pendingWebglSnapshots = new Set<string>()

let resizeObserver: ResizeObserver | null = null
let isMounted = false

function getExample(id: string) {
  return exampleList.find((example) => example.id === id)
}

function getOwnRecordValue(record: Record<string, string>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key)
    ? record[key]
    : ''
}

function getPreviewState(example: MeshPreviewExample): MeshPreviewState {
  return previewStates.value[example.id] ?? {
    normalized: example.input,
    cssBackground: '',
    svgId: '',
    svgDefs: '',
    error: '',
    isReady: false,
  }
}

function setPreviewState(id: string, state: MeshPreviewState) {
  previewStates.value = {
    ...previewStates.value,
    [id]: state,
  }
}

function resolvePreview(example: MeshPreviewExample) {
  const current = previewStates.value[example.id]

  if (current?.isReady || current?.error) {
    return
  }

  try {
    const gradient = parse(example.input)
    const svg = transformTo('svg', gradient) as SvgPreviewPayload
    const svgId = `mesh-preview-${example.id}`
    const svgPreview = createSvgPreview(svg, svgId)

    setPreviewState(example.id, {
      normalized: gradient.toString(),
      cssBackground: transformTo('css', gradient),
      svgId: svgPreview.id,
      svgDefs: svgPreview.defs,
      error: '',
      isReady: true,
    })
  } catch (value) {
    setPreviewState(example.id, {
      normalized: example.input,
      cssBackground: '',
      svgId: '',
      svgDefs: '',
      error: value instanceof Error ? value.message : 'Failed to render preview.',
      isReady: false,
    })
  }
}

function getWebglSnapshot(id: string) {
  return getOwnRecordValue(webglSnapshots.value, id)
}

function getWebglError(id: string) {
  return getOwnRecordValue(webglErrors.value, id)
}

function getRenderSize(element: Element | undefined, fallback = 320) {
  const rect = element?.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const cssWidth = rect?.width || fallback
  const cssHeight = rect?.height || cssWidth
  const width = Math.max(1, Math.round(cssWidth * dpr))
  const height = Math.max(1, Math.round(cssHeight * dpr))

  return { width, height }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const { width, height } = getRenderSize(canvas)

  if (canvas.width !== width) {
    canvas.width = width
  }

  if (canvas.height !== height) {
    canvas.height = height
  }

  return { width, height }
}

function drawCanvas2d(id: string) {
  const example = getExample(id)
  const canvas = canvas2dRefs.get(id)

  if (!example || getPreviewState(example).error || !canvas) {
    return
  }

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  const { width, height } = resizeCanvas(canvas)
  const paint = transformTo('canvas-2d', example.input)

  paint.draw(ctx, width, height)
}

function drawWebgl(id: string) {
  const example = getExample(id)

  if (
    !example ||
    getPreviewState(example).error ||
    getWebglSnapshot(id) ||
    pendingWebglSnapshots.has(id)
  ) {
    return
  }

  pendingWebglSnapshots.add(id)

  const canvas = document.createElement('canvas')
  const { width, height } = getRenderSize(webglSurfaceRefs.get(id))

  canvas.width = width
  canvas.height = height

  try {
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })

    if (!gl) {
      throw new Error('WebGL is not supported.')
    }

    const paint = transformTo('canvas-webgl', example.input)

    paint.draw(canvas, width, height)

    gl.finish()

    const snapshot = canvas.toDataURL('image/png')

    if (!snapshot || snapshot === 'data:,') {
      throw new Error('WebGL snapshot could not be captured.')
    }

    webglSnapshots.value = {
      ...webglSnapshots.value,
      [id]: snapshot,
    }
    webglErrors.value = {
      ...webglErrors.value,
      [id]: '',
    }

    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch (value) {
    webglErrors.value = {
      ...webglErrors.value,
      [id]: value instanceof Error ? value.message : 'WebGL preview failed.',
    }
  } finally {
    pendingWebglSnapshots.delete(id)
  }
}

function drawExample(id: string) {
  drawCanvas2d(id)
  drawWebgl(id)
}

function setWebglSurfaceRef(id: string, element: unknown) {
  const surface = element instanceof HTMLElement
    ? element
    : null

  if (!surface) {
    webglSurfaceRefs.delete(id)
    return
  }

  webglSurfaceRefs.set(id, surface)

  if (isMounted) {
    void nextTick(() => drawWebgl(id))
  }
}

function setCanvasRef(
  id: string,
  _target: CanvasTarget,
  element: unknown,
) {
  const canvas = element instanceof HTMLCanvasElement
    ? element
    : null

  if (!canvas) {
    canvas2dRefs.delete(id)
    return
  }

  canvas.dataset.meshPreviewId = id
  canvas2dRefs.set(id, canvas)

  if (isMounted) {
    resizeObserver?.observe(canvas)
    void nextTick(() => drawExample(id))
  }
}

const MeshPreviewContent = defineComponent({
  name: 'MeshPreviewContent',
  props: {
    example: {
      type: Object as PropType<MeshPreviewExample>,
      required: true,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    const isVisible = ref(false)
    let intersectionObserver: IntersectionObserver | null = null

    function renderCaption(label: string) {
      return h('figcaption', { class: 'mesh-render-tile__caption' }, [
        h('span', { class: 'mesh-render-tile__caption-text' }, label),
      ])
    }

    function activatePreview() {
      if (isVisible.value) {
        return
      }

      isVisible.value = true
      intersectionObserver?.disconnect()
      resolvePreview(props.example)
      void nextTick(() => drawExample(props.example.id))
    }

    onMounted(() => {
      if (!root.value) {
        return
      }

      if (!('IntersectionObserver' in window)) {
        activatePreview()
        return
      }

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            activatePreview()
          }
        },
        {
          rootMargin: '520px 0px',
        },
      )

      intersectionObserver.observe(root.value)
    })

    onBeforeUnmount(() => {
      intersectionObserver?.disconnect()
      canvas2dRefs.delete(props.example.id)
      webglSurfaceRefs.delete(props.example.id)
    })

    return () => {
      const state = getPreviewState(props.example)

      return h('figure', { ref: root, class: 'mesh-render-set' }, [
        h('figcaption', { class: 'mesh-render-set__header' }, [
          h('span', { class: 'mesh-render-set__eyebrow' }, 'Mesh gradient example'),
          h('strong', { class: 'mesh-render-set__label' }, props.example.label),
          h('code', { class: 'mesh-render-set__syntax' }, state.normalized),
        ]),
        state.error
          ? h('p', { class: 'mesh-render-set__error' }, state.error)
          : !isVisible.value || !state.isReady
            ? h(
              'div',
              {
                class: 'mesh-render-lazy',
                'data-gradiente-lazy-preview': props.example.id,
              },
              'Preview loads when it reaches the viewport.',
            )
            : h('div', { class: 'mesh-render-grid' }, [
              h('figure', { class: 'mesh-render-tile' }, [
                h('div', {
                  class: 'mesh-render-tile__surface',
                  style: { backgroundImage: state.cssBackground },
                  'data-gradiente-renderer': 'css',
                  'data-gradiente-input': props.example.input,
                }),
                renderCaption('CSS target'),
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                h('canvas', {
                  ref: (element: unknown) =>
                    setCanvasRef(props.example.id, 'canvas-2d', element),
                  class: 'mesh-render-tile__surface',
                  'data-gradiente-renderer': 'canvas-2d',
                  'data-gradiente-input': props.example.input,
                }),
                renderCaption('Canvas 2D'),
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                getWebglSnapshot(props.example.id)
                  ? h('img', {
                    ref: (element: unknown) =>
                      setWebglSurfaceRef(props.example.id, element),
                    class: 'mesh-render-tile__surface mesh-render-tile__image',
                    src: getWebglSnapshot(props.example.id),
                    alt: `${props.example.label} rendered with Canvas WebGL`,
                    'data-gradiente-renderer': 'canvas-webgl',
                    'data-gradiente-input': props.example.input,
                  })
                  : h('div', {
                    ref: (element: unknown) =>
                      setWebglSurfaceRef(props.example.id, element),
                    class: 'mesh-render-tile__surface mesh-render-tile__placeholder',
                    'data-gradiente-renderer': 'canvas-webgl',
                    'data-gradiente-input': props.example.input,
                  }, 'Rendering WebGL...'),
                renderCaption('Canvas WebGL snapshot'),
                getWebglError(props.example.id)
                  ? h(
                    'p',
                    { class: 'mesh-render-set__error' },
                    getWebglError(props.example.id),
                  )
                  : null,
              ]),
              h('figure', { class: 'mesh-render-tile' }, [
                h('svg', {
                  class: 'mesh-render-tile__surface',
                  viewBox: '0 0 100 100',
                  preserveAspectRatio: 'none',
                  role: 'img',
                  'aria-label': `${props.example.label} rendered with SVG`,
                  'data-gradiente-renderer': 'svg',
                  'data-gradiente-input': props.example.input,
                  innerHTML: [
                    state.svgDefs,
                    `<rect width="100%" height="100%" fill="url(#${state.svgId})"></rect>`,
                  ].join(''),
                }),
                renderCaption('SVG pattern'),
              ]),
            ]),
      ])
    }
  },
})

onMounted(() => {
  isMounted = true

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLCanvasElement
        const id = target.dataset.meshPreviewId

        if (id && target instanceof HTMLCanvasElement) {
          drawCanvas2d(id)
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  isMounted = false
  resizeObserver?.disconnect()
  canvas2dRefs.clear()
  webglSurfaceRefs.clear()
  pendingWebglSnapshots.clear()
})
</script>

# Mesh Gradients

A mesh gradient is the most structural gradient kind in gradiente. Linear,
radial, diamond, and conic gradients describe a continuous color ramp with a stop
list. A mesh gradient describes a colored surface made from vertices and
patches.

Each vertex has an id, an x/y position, and a color. Each patch connects four
vertices into one surface cell. The renderer samples colors inside those cells
and fills the final rectangle.

```css
mesh-gradient(grid 4 4 method bicubic in oklab, vertex v00 0% 0% hsl(89, 96%, 40%), vertex v10 30.04% 0% #67e8f9, vertex v20 71.53% 0.08% hsl(285, 73%, 66%), vertex v30 100% 1.84% #f472b6, vertex v01 0.62% 38.7% #0f172a, vertex v11 28.18% 35.3% hsl(120, 69%, 63%), vertex v21 66.51% 23.4% #9333ea, vertex v31 100% 37.76% #06b6d4, vertex v02 0% 72.36% #9333ea, vertex v12 30.67% 66.72% hsl(237, 62%, 41%), vertex v22 67.1% 73.74% hsl(111, 79%, 43%), vertex v32 100% 75.98% hsl(240, 95%, 47%), vertex v03 0% 100% #ec4899, vertex v13 26.77% 98.53% #06b6d4, vertex v23 62.17% 99.27% #7c3aed, vertex v33 99.93% 100% #0f172a, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p20 v20 v30 v31 v21, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12, patch p21 v21 v31 v32 v22, patch p02 v02 v12 v13 v03, patch p12 v12 v22 v23 v13, patch p22 v22 v32 v33 v23)
```

<div class="mesh-preview-block" v-for="example in [examples.hero]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

`mesh-gradient(...)` is not a native CSS gradient function. gradiente turns the
same internal mesh model into CSS, Canvas 2D, Canvas WebGL, and SVG output. The
CSS target is a generated SVG data URL. The SVG target is a pattern payload. The
Canvas targets render the sampled mesh directly.

Mesh previews on this page are lazy. A preview does not call `parse()` or
`transformTo()` until it approaches the viewport, because mesh rendering is much
heavier than serializing a normal stop-based gradient.

## What A Mesh Gradient Contains

The mesh gradient model has four required parts and one optional patch detail:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>Function name</strong>
    <span>`mesh-gradient(...)`. `repeating-mesh-gradient(...)` is intentionally not supported.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Grid config</strong>
    <span>`grid rows columns`, plus optional `method` and `in color-space` interpolation settings.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Vertices</strong>
    <span>Named points with x/y positions and colors: `vertex v00 0% 0% red`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Patches</strong>
    <span>Four vertex references that define one cell: `patch p00 v00 v10 v11 v01`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>Handles</strong>
    <span>Optional cubic edge metadata attached to patch sides and preserved in the model.</span>
  </div>
</div>

The resolved config looks like this:

```ts
type GradientMeshConfig = {
  rows: number
  columns: number
  method: 'bilinear' | 'bicubic'
  interpolation: {
    colorSpace: GradientColorSpace
    hue?: GradientHueInterpolation
  }
}
```

The data model is not a stop list. A mesh has explicit vertices and explicit
patches:

```ts
type GradientMeshVertex = {
  id: string
  x: GradientLengthPercentage
  y: GradientLengthPercentage
  color: string
}

type GradientMeshPatch = {
  id: string
  topLeft: string
  topRight: string
  bottomRight: string
  bottomLeft: string
  handles?: GradientMeshPatchHandles
}
```

## What gradiente Does

For `mesh-gradient`, gradiente handles the work that native CSS cannot:

- Parses mesh strings into a `GradientMesh` instance.
- Infers grid size from regular vertex ids or counts when possible.
- Validates vertex ids, patch ids, colors, coordinates, and topology.
- Stores vertices and patches as the internal source of truth.
- Supports `bilinear` and `bicubic` color sampling.
- Supports color interpolation through Culori-compatible spaces.
- Preserves optional patch handles in string and JSON serialization.
- Samples colors through `samplePatchColor(patchId, u, v)`.
- Transforms the same model to CSS, Canvas 2D, Canvas WebGL, and SVG.
- Covers the outer render area with edge triangles when vertices do not sit exactly on the rectangle edges.

## Anatomy

The full syntax is a comma-separated list of mesh records:

```css
mesh-gradient(
  grid <rows> <columns> [method bilinear|bicubic] [in color-space [hue-mode hue]],
  vertex <id> <x> <y> <color>,
  vertex <id> <x> <y> <color>,
  ...,
  patch <id> <top-left> <top-right> <bottom-right> <bottom-left>,
  ...,
  handle <patch-id> <side> <from-x> <from-y> <to-x> <to-y>
)
```

A minimal explicit mesh has a `2 x 2` vertex grid and one patch:

```css
mesh-gradient(grid 2 2 method bilinear, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.anatomy]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

That example contains:

- `grid 2 2`: two rows and two columns of vertices.
- `method bilinear`: each patch is sampled by bilinear interpolation.
- `vertex v00 0% 0% red`: the top-left vertex is red.
- `vertex v10 100% 0% blue`: the top-right vertex is blue.
- `vertex v01 0% 100% yellow`: the bottom-left vertex is yellow.
- `vertex v11 100% 100% green`: the bottom-right vertex is green.
- `patch p00 v00 v10 v11 v01`: one patch connects the four vertices.

## Defaults And Inference

The class defaults are:

```txt
rows: 2
columns: 2
method: "bilinear"
interpolation.colorSpace: "srgb"
```

`grid` is still serialized by `toString()` because mesh topology is too
important to hide in canonical output. If the input omits `grid`, gradiente tries
to infer it from vertex ids or counts:

```css
mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.inferredGrid]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

The canonical string for that input includes the inferred `grid 2 2 method
bilinear` config.

## Grid Topology

`rows` and `columns` describe topology, not visual alignment. A `3 x 3` grid has
nine vertices and four patches:

```txt
vertices: rows * columns
patches: (rows - 1) * (columns - 1)
```

For example:

```css
mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.grid3x3]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

The ids `v00`, `v10`, `v20`, `v01`, and so on are not random. gradiente reads
them as `v<column><row>`. That regular id scheme lets the model validate patch
adjacency and lets bicubic sampling find neighboring vertices.

## Vertices

A vertex record has four parts:

```css
vertex <id> <x> <y> <color>
```

The id must be stable because patches reference it. The x/y values are
length-percentage values. The color can be any Culori-readable color string.

Vertices do not have to be visually aligned with the grid. The grid is
topological; the actual surface can be distorted by moving vertex positions:

```css
mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.distorted]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

When vertices do not fully cover the paint rectangle, the built-in renderers add
outer edge triangles. That keeps the whole output filled instead of leaving
transparent gaps around the mesh.

## Patches

A patch record has six parts:

```css
patch <id> <top-left> <top-right> <bottom-right> <bottom-left>
```

The four vertex references must be unique and must exist. For regular ids,
patches must describe adjacent grid cells. A `2 x 2` grid needs one patch. A
`3 x 3` grid needs four patches. A `4 x 4` grid needs nine patches.

Patch order matters semantically. Write references clockwise from the top-left
corner:

```txt
top-left -> top-right -> bottom-right -> bottom-left
```

That order gives renderers a predictable surface orientation and makes the
serialized DSL readable.

## Sampling Method

`method` controls how colors are sampled inside each patch.

`bilinear` is the default. It blends the top edge, blends the bottom edge, then
blends between those two intermediate colors. It is fast, predictable, and good
for simple surfaces:

```css
mesh-gradient(grid 3 3 method bilinear in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.bilinear]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

`bicubic` samples a smoother surface by looking at neighboring vertices in the
regular grid. It is more expensive, but it can remove the visibly planar feel of
large bilinear patches:

```css
mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)
```

<div class="mesh-preview-block" v-for="example in [examples.bicubic]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Use regular vertex ids for bicubic meshes. If the sampler cannot build a regular
vertex grid, it cannot know which neighboring colors belong around a patch.

## Color Interpolation

Mesh colors use the same interpolation vocabulary as the other gradient kinds:

```css
grid 2 2 method bilinear in oklab
grid 2 2 method bicubic in oklch longer hue
grid 2 2 method bilinear in hsl decreasing hue
```

The interpolation clause belongs to `grid`, not to individual vertices or
patches. Every patch in the mesh uses the same color interpolation settings.

Polar color spaces can use hue interpolation modes. This is visible when hue
wraps around the color wheel:

```css
mesh-gradient(grid 2 2 method bilinear in hsl longer hue, vertex v00 0% 0% hsl(10, 100%, 50%), vertex v10 100% 0% hsl(350, 100%, 50%), vertex v01 0% 100% hsl(10, 100%, 50%), vertex v11 100% 100% hsl(350, 100%, 50%), patch p00 v00 v10 v11 v01)
```

<div class="mesh-preview-block" v-for="example in [examples.hue]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Supported color spaces are:

```txt
oklab
lch
oklch
hsl
hwb
lab
srgb
srgb-linear
xyz
display-p3
a98-rgb
prophoto-rgb
rec2020
```

Hue modes are meaningful only for polar color spaces. If a hue mode is supplied
for a rectangular space such as `oklab`, gradiente keeps the color space and
serializes the gradient without the hue mode.

## Patch Handles

Handles are optional records attached to a patch side:

```css
handle <patch-id> <side> <from-x> <from-y> <to-x> <to-y>
```

`side` can be `top`, `right`, `bottom`, or `left`.

```css
mesh-gradient(grid 2 2 method bicubic in oklch longer hue, vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% yellow, vertex v11 100% 100% green, patch p00 v00 v10 v11 v01, handle p00 top 25% 0% 75% 0%, handle p00 right 100% 25% 100% 75%)
```

<div class="mesh-preview-block" v-for="example in [examples.handles]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Handles are part of the mesh model, JSON representation, parser, validation, and
serializer. The built-in raster renderers sample color from vertices and patches;
tools can still use handles to preserve editor-side cubic edge metadata or pass
that metadata to a custom renderer.

## Programmatic Construction

Most users should start with `parse()` because it keeps authoring close to the
DSL. When you need to build a mesh directly, use `GradientMesh`.

The constructor takes three parameters:

```txt
new GradientMesh(vertices, patches, config?)
```

`vertices` and `patches` are required. `config` is optional. Missing config
values are inferred when possible, then resolved from class defaults.

```ts
import { GradientMesh } from 'gradiente'

const gradient = new GradientMesh(
  [
    {
      id: 'v00',
      x: { kind: 'percent', value: 0 },
      y: { kind: 'percent', value: 0 },
      color: 'red',
    },
    {
      id: 'v10',
      x: { kind: 'percent', value: 100 },
      y: { kind: 'percent', value: 0 },
      color: 'blue',
    },
    {
      id: 'v01',
      x: { kind: 'percent', value: 0 },
      y: { kind: 'percent', value: 100 },
      color: 'yellow',
    },
    {
      id: 'v11',
      x: { kind: 'percent', value: 100 },
      y: { kind: 'percent', value: 100 },
      color: 'green',
    },
  ],
  [
    {
      id: 'p00',
      topLeft: 'v00',
      topRight: 'v10',
      bottomRight: 'v11',
      bottomLeft: 'v01',
    },
  ],
  {
    method: 'bilinear',
    interpolation: {
      colorSpace: 'srgb',
    },
  },
)
```

<div class="mesh-preview-block" v-for="example in [examples.constructor]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

## Sampling A Patch

`GradientMesh` can sample a color inside a patch without rendering the whole
gradient. Use `samplePatchColor(patchId, u, v)`.

`u` and `v` are local patch coordinates from `0` to `1`:

```txt
u: 0 left edge, 1 right edge
v: 0 top edge, 1 bottom edge
```

```ts
import { GradientMesh } from 'gradiente'

const gradient = GradientMesh.fromString(
  'mesh-gradient(grid 2 2 method bilinear in oklab, vertex v00 0% 8% #ff74f6, vertex v10 100% 0% #405de6, vertex v01 12% 100% #fb7655, vertex v11 92% 88% #0f172a, patch p00 v00 v10 v11 v01)'
)

const center = gradient.samplePatchColor('p00', 0.5, 0.5)
```

<div class="mesh-preview-block" v-for="example in [examples.sampling]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

Sampling is useful for editors, color pickers, generated design tokens, tests,
and any workflow that needs to inspect the mesh without painting it.

## Transforming A Mesh Gradient

Every renderer target receives the same source model. That is the main point of
the Core API: parse once, transform many times.

```ts
import { parse, transformTo } from 'gradiente'

const gradient = parse(
  'mesh-gradient(grid 3 3 method bicubic in oklab, vertex v00 0% 0% #ff00aa, vertex v10 46% 8% #faff00, vertex v20 100% 0% #7c00ff, vertex v01 7% 45% #00c2ff, vertex v11 55% 42% #fff7cc, vertex v21 94% 56% #ff4fd8, vertex v02 0% 100% #00ff7f, vertex v12 48% 93% #00f0ff, vertex v22 100% 100% #005eff, patch p00 v00 v10 v11 v01, patch p10 v10 v20 v21 v11, patch p01 v01 v11 v12 v02, patch p11 v11 v21 v22 v12)'
)

const css = transformTo('css', gradient)
const canvas2d = transformTo('canvas-2d', gradient)
const webgl = transformTo('canvas-webgl', gradient)
const svg = transformTo('svg', gradient)
```

<div class="mesh-preview-block" v-for="example in [examples.transform]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

The transformer outputs have different shapes:

<div class="gradient-kind-table">
  <div class="gradient-kind-row">
    <strong>`css`</strong>
    <span>A CSS background string. For mesh gradients it is a generated SVG data URL because CSS has no native `mesh-gradient()` function.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-2d`</strong>
    <span>A paint object with `draw(ctx, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`canvas-webgl`</strong>
    <span>A paint object with `draw(canvas, width, height)`.</span>
  </div>
  <div class="gradient-kind-row">
    <strong>`svg`</strong>
    <span>An SVG pattern payload with `defs`, `url`, and serialized SVG data.</span>
  </div>
</div>

## Normalization

Use `format()` before storing user input. It parses the string into the internal
model and serializes it back to the canonical gradiente string.

```ts
import { format } from 'gradiente'

const input = 'mesh-gradient(vertex v00 0% 0% red, vertex v10 100% 0% blue, vertex v01 0% 100% red, vertex v11 100% 100% blue, patch p00 v00 v10 v11 v01)'
const normalized = format(input)
```

<div class="mesh-preview-block" v-for="example in [examples.format]" :key="example.id">
  <MeshPreviewContent :example="example" />
</div>

For mesh gradients, normalization is especially useful because it makes inferred
config explicit. That gives editors, snapshots, and stored user input a stable
shape.

## Validation Rules

Mesh gradients have stricter validation than stop-based gradients:

- `rows` and `columns` must be integers greater than or equal to `2`.
- Vertex count must equal `rows * columns`.
- Patch count must equal `(rows - 1) * (columns - 1)`.
- Vertex ids and patch ids must be unique.
- Patch references must point to existing vertices.
- Each patch must use four unique vertices.
- Recognized regular ids such as `v00` and `v10` must stay inside the declared grid.
- Recognized regular patches must match adjacent grid cells.
- Vertex colors must be readable by Culori.
- `repeating-mesh-gradient(...)` is rejected.

These rules are strict on purpose. A mesh gradient is closer to geometry than to
a simple color list, so invalid topology quickly becomes renderer-specific
undefined behavior if it is not caught early.

## Performance Notes

Mesh rendering is more expensive than normal gradient rendering. The cost depends
on the number of patches, the sampling method, and the target.

Use this practical order:

1. Start with the smallest grid that can express the surface.
2. Use `bilinear` when the shape is simple or interactive.
3. Use `bicubic` when smoothness matters more than raw generation cost.
4. Prefer Canvas 2D or Canvas WebGL for live editors.
5. Use CSS or SVG output when you need a portable serialized asset.
6. Cache generated CSS/SVG output if the mesh does not change often.
7. Use `format()` before storing user-authored mesh strings.

## Practical Checklist

Use this order when building or validating a mesh gradient:

1. Decide the topology: `2 x 2`, `3 x 3`, `4 x 4`, or larger.
2. Name vertices with regular ids such as `v00`, `v10`, `v01`, `v11`.
3. Place every vertex with x/y length-percentage coordinates.
4. Give every vertex a valid Culori-readable color.
5. Create one patch per grid cell.
6. Write patch references clockwise from top-left.
7. Choose `bilinear` for speed or `bicubic` for smoother surfaces.
8. Choose interpolation: `srgb` for simple parity, `oklab` or `oklch` for smoother ramps.
9. Add handles only when your editor or custom renderer needs that metadata.
10. Use `format()` before storing user input.
11. Use `transformTo()` for renderer output instead of hand-converting the string.

<style scoped>
.mesh-preview-block {
  margin: 18px 0 34px;
}

:deep(.mesh-render-set) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.14);
}

:deep(.mesh-render-set__header) {
  display: grid;
  gap: 8px;
  height: 118px;
  overflow: hidden;
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent),
      transparent 34%
    ),
    linear-gradient(
      45deg,
      transparent,
      color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent) 55%,
      transparent
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent),
      color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
    );
}

:deep(.mesh-render-set__eyebrow) {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

:deep(.mesh-render-set__label) {
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

:deep(.mesh-render-set__syntax) {
  width: 100%;
  overflow: hidden;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-code-bg);
  color: var(--vp-c-text-1);
  display: -webkit-box;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
}

:deep(.mesh-render-grid) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

:deep(.mesh-render-tile) {
  min-width: 0;
  margin: 0;
  border-right: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-rows: auto 42px;
}

:deep(.mesh-render-tile:last-child) {
  border-right: 0;
}

:deep(.mesh-render-tile__surface) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--vp-c-bg-soft);
  display: block;
}

:deep(.mesh-render-lazy) {
  min-height: 190px;
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 13px;
  place-items: center;
}

:deep(.mesh-render-tile__image) {
  object-fit: fill;
}

:deep(.mesh-render-tile__placeholder) {
  color: var(--vp-c-text-2);
  display: grid;
  font-size: 12px;
  place-items: center;
}

:deep(.mesh-render-tile__caption) {
  min-height: 42px;
  padding: 8px 10px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  display: grid;
  place-items: center start;
}

:deep(.mesh-render-tile__caption-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.mesh-render-set__error) {
  margin: 0;
  padding: 12px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

@media (max-width: 620px) {
  :deep(.mesh-render-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.mesh-render-tile:nth-child(2n)) {
    border-right: 0;
  }

  :deep(.mesh-render-tile:nth-child(n + 3)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 420px) {
  :deep(.mesh-render-grid) {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.mesh-render-tile) {
    border-right: 0;
  }

  :deep(.mesh-render-tile + .mesh-render-tile) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
