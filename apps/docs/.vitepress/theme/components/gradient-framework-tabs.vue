<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue'
import { EditorState, type Range } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'

type FrameworkKey = 'react' | 'vanilla' | 'vue' | 'svelte'

type FrameworkTab = {
  id: FrameworkKey
  label: string
}

type FrameworkExample = FrameworkTab & {
  filename: string
  code: string
}

type GradientSourceCode = {
  prelude: string
  expression: string
}

type HighlightRule = {
  pattern: RegExp
  className: string
}

const props = withDefaults(defineProps<{
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  gradient: string
  gradientKind?: string
  previewAriaLabel?: string
  tabsAriaLabel?: string
  codeLabelSuffix?: string
  componentName?: string
}>(), {
  id: 'gradient-framework-tabs',
  eyebrow: 'gradiente integration',
  title: 'Use this gradient in your framework',
  description: 'Every tab parses the same gradiente string and transforms it into a CSS background image that can be mounted by the framework.',
  gradientKind: 'gradient',
  previewAriaLabel: '',
  tabsAriaLabel: 'Framework examples',
  codeLabelSuffix: 'code example',
  componentName: 'GradientPreview',
})

const frameworkTabs = [
  { id: 'react', label: 'React' },
  { id: 'vanilla', label: 'Vanilla JS' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
] as const satisfies readonly FrameworkTab[]

const activeFramework = ref<FrameworkKey>('react')
const scriptClose = '</' + 'script>'

const highlightRules: HighlightRule[] = [
  { pattern: /\/\/.*/g, className: 'cm-gradiente-comment' },
  { pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/g, className: 'cm-gradiente-string' },
  { pattern: /<\/?[A-Za-z][\w:-]*/g, className: 'cm-gradiente-tag' },
  { pattern: /\b(?:import|from|export|function|const|return|if|instanceof)\b/g, className: 'cm-gradiente-keyword' },
  { pattern: /\b(?:parse|transformTo|useMemo|computed|querySelector)\b/g, className: 'cm-gradiente-function' },
  { pattern: /\b(?:document|HTMLElement|backgroundImage|previewStyle|preview|gradient|source)\b/g, className: 'cm-gradiente-variable' },
  { pattern: /\b(?:aria-label|style|data-gradiente-preview|style:background-image|style:min-height|style:border-radius)\b/g, className: 'cm-gradiente-attribute' },
  { pattern: /\b\d+(?:px)?\b/g, className: 'cm-gradiente-number' },
  { pattern: /[{}()[\],.:/]/g, className: 'cm-gradiente-punctuation' },
]

const codeEditorTheme = EditorView.theme({
  '&': {
    width: '100%',
    minHeight: '430px',
    maxHeight: '560px',
    background: 'var(--vp-code-block-bg)',
    color: 'var(--vp-code-block-color)',
    fontSize: '12px',
    lineHeight: '1.65',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    maxHeight: '560px',
    overflow: 'auto',
    fontFamily: 'var(--vp-font-family-mono)',
  },
  '.cm-content': {
    minWidth: 'max-content',
    padding: '16px',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-cursor': {
    display: 'none',
  },
  '.cm-selectionBackground': {
    background: 'color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent) !important',
  },
  '.cm-gradiente-keyword': {
    color: '#ff7b72',
    fontWeight: '700',
  },
  '.cm-gradiente-function': {
    color: '#d2a8ff',
    fontWeight: '700',
  },
  '.cm-gradiente-variable': {
    color: '#ffa657',
  },
  '.cm-gradiente-string': {
    color: '#a5d6ff',
  },
  '.cm-gradiente-tag': {
    color: '#7ee787',
    fontWeight: '700',
  },
  '.cm-gradiente-attribute': {
    color: '#79c0ff',
  },
  '.cm-gradiente-number': {
    color: '#f2cc60',
  },
  '.cm-gradiente-comment': {
    color: '#8b949e',
    fontStyle: 'italic',
  },
  '.cm-gradiente-punctuation': {
    color: '#c9d1d9',
  },
})

function hasUsedRange(usedRanges: boolean[], from: number, to: number) {
  for (let index = from; index < to; index += 1) {
    if (usedRanges[index]) {
      return true
    }
  }

  return false
}

function markUsedRange(usedRanges: boolean[], from: number, to: number) {
  for (let index = from; index < to; index += 1) {
    usedRanges[index] = true
  }
}

function buildCodeDecorations(text: string) {
  const usedRanges = Array<boolean>(text.length).fill(false)
  const decorations: Range<Decoration>[] = []

  for (const rule of highlightRules) {
    rule.pattern.lastIndex = 0

    let match: RegExpExecArray | null

    while ((match = rule.pattern.exec(text))) {
      const from = match.index
      const to = from + match[0].length

      if (from === to || hasUsedRange(usedRanges, from, to)) {
        continue
      }

      markUsedRange(usedRanges, from, to)
      decorations.push(
        Decoration.mark({
          class: rule.className,
        }).range(from, to),
      )
    }
  }

  return Decoration.set(decorations, true)
}

const codeHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildCodeDecorations(view.state.doc.toString())
    }

    update(update: ViewUpdate) {
      if (!update.docChanged) {
        return
      }

      this.decorations = buildCodeDecorations(update.view.state.doc.toString())
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
)

function createGradientSourceCode(gradient: string): GradientSourceCode {
  if (gradient.length < 180) {
    return {
      prelude: '',
      expression: JSON.stringify(gradient),
    }
  }

  const parts = gradient.split(/,\s(?=(?:vertex|patch|handle)\b)/)

  if (parts.length < 2) {
    return {
      prelude: '',
      expression: JSON.stringify(gradient),
    }
  }

  return {
    prelude: [
      'const source = [',
      ...parts.map((part, index) =>
        `  ${JSON.stringify(index === 0 ? part : `, ${part}`)},`,
      ),
      "].join('')",
    ].join('\n'),
    expression: 'source',
  }
}

function indentCodeBlock(code: string, indent: string) {
  return code
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n')
}

function createGradientParseBlock(source: GradientSourceCode, indent = '') {
  const lines: string[] = []

  if (source.prelude) {
    lines.push(indentCodeBlock(source.prelude, indent))
  }

  lines.push(`${indent}const gradient = parse(${source.expression})`)

  return lines.join('\n\n')
}

const CodeMirrorCode = defineComponent({
  name: 'GradientFrameworkCodeMirror',
  props: {
    code: {
      type: String,
      required: true,
    },
    label: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(componentProps) {
    const editorRef = ref<HTMLDivElement | null>(null)
    const view = shallowRef<EditorView | null>(null)

    onMounted(() => {
      if (!editorRef.value) {
        return
      }

      view.value = new EditorView({
        parent: editorRef.value,
        state: EditorState.create({
          doc: componentProps.code,
          extensions: [
            EditorState.readOnly.of(true),
            EditorState.tabSize.of(2),
            EditorView.editable.of(false),
            EditorView.lineWrapping,
            codeEditorTheme,
            codeHighlight,
          ],
        }),
      })
    })

    watch(
      () => componentProps.code,
      (code) => {
        if (!view.value) {
          return
        }

        const currentCode = view.value.state.doc.toString()

        if (code === currentCode) {
          return
        }

        view.value.dispatch({
          changes: {
            from: 0,
            to: currentCode.length,
            insert: code,
          },
        })
      },
    )

    onBeforeUnmount(() => {
      view.value?.destroy()
      view.value = null
    })

    return () => h('div', {
      ref: editorRef,
      class: 'gradient-framework-tabs__code',
      role: 'region',
      'aria-label': componentProps.label,
    })
  },
})

const frameworkExamples = computed<Record<FrameworkKey, FrameworkExample>>(() => {
  const source = createGradientSourceCode(props.gradient)
  const ariaLabel = props.previewAriaLabel || `${props.gradientKind} preview`

  return {
    react: {
      id: 'react',
      label: 'React',
      filename: `${props.componentName}.tsx`,
      code: `import { useMemo } from 'react'
import { parse, transformTo } from 'gradiente'

export function ${props.componentName}() {
  const backgroundImage = useMemo(() => {
${createGradientParseBlock(source, '    ')}

    return transformTo('css', gradient)
  }, [])

  return (
    <div
      aria-label="${ariaLabel}"
      style={{
        backgroundImage,
        minHeight: 240,
        borderRadius: 8,
      }}
    />
  )
}`,
    },
    vanilla: {
      id: 'vanilla',
      label: 'Vanilla JS',
      filename: 'main.js',
      code: `import { parse, transformTo } from 'gradiente'

const preview = document.querySelector('[data-gradiente-preview]')

if (preview instanceof HTMLElement) {
${createGradientParseBlock(source, '  ')}

  preview.style.backgroundImage = transformTo('css', gradient)
  preview.style.minHeight = '240px'
  preview.style.borderRadius = '8px'
}`,
    },
    vue: {
      id: 'vue',
      label: 'Vue',
      filename: `${props.componentName}.vue`,
      code: `<script setup>
import { computed } from 'vue'
import { parse, transformTo } from 'gradiente'

const previewStyle = computed(() => {
${createGradientParseBlock(source, '  ')}

  return {
    backgroundImage: transformTo('css', gradient),
    minHeight: '240px',
    borderRadius: '8px',
  }
})
${scriptClose}

<template>
  <div
    aria-label="${ariaLabel}"
    :style="previewStyle"
  />
</template>`,
    },
    svelte: {
      id: 'svelte',
      label: 'Svelte',
      filename: `${props.componentName}.svelte`,
      code: `<script>
  import { parse, transformTo } from 'gradiente'

${createGradientParseBlock(source, '  ')}
  const backgroundImage = transformTo('css', gradient)
${scriptClose}

<div
  aria-label="${ariaLabel}"
  style:background-image={backgroundImage}
  style:min-height="240px"
  style:border-radius="8px"
></div>`,
    },
  }
})

const activeExample = computed(() => frameworkExamples.value[activeFramework.value])

function getTabId(id: FrameworkKey) {
  return `${props.id}-${id}-tab`
}

function getPanelId(id: FrameworkKey) {
  return `${props.id}-${id}-panel`
}

async function activateFramework(id: FrameworkKey) {
  activeFramework.value = id

  await nextTick()
  document.getElementById(getTabId(id))?.focus()
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  let nextIndex = index

  if (event.key === 'ArrowLeft') {
    nextIndex = index === 0 ? frameworkTabs.length - 1 : index - 1
  } else if (event.key === 'ArrowRight') {
    nextIndex = index === frameworkTabs.length - 1 ? 0 : index + 1
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = frameworkTabs.length - 1
  } else {
    return
  }

  event.preventDefault()
  void activateFramework(frameworkTabs[nextIndex].id)
}
</script>

<template>
  <section class="gradient-framework-tabs" :aria-labelledby="`${id}-title`">
    <div class="gradient-framework-tabs__header">
      <span class="gradient-framework-tabs__eyebrow">{{ eyebrow }}</span>
      <h2 :id="`${id}-title`" class="gradient-framework-tabs__title">
        {{ title }}
      </h2>
      <p class="gradient-framework-tabs__description">
        {{ description }}
      </p>
    </div>

    <div class="gradient-framework-tabs__tabs" role="tablist" :aria-label="tabsAriaLabel">
      <button
        v-for="(tab, index) in frameworkTabs"
        :id="getTabId(tab.id)"
        :key="tab.id"
        class="gradient-framework-tabs__tab"
        :class="{ 'gradient-framework-tabs__tab--active': activeFramework === tab.id }"
        type="button"
        role="tab"
        :aria-selected="activeFramework === tab.id"
        :aria-controls="getPanelId(tab.id)"
        :tabindex="activeFramework === tab.id ? 0 : -1"
        @click="activeFramework = tab.id"
        @keydown="onTabKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      :id="getPanelId(activeExample.id)"
      class="gradient-framework-tabs__panel"
      role="tabpanel"
      :aria-labelledby="getTabId(activeExample.id)"
    >
      <div class="gradient-framework-tabs__meta">
        <span>{{ activeExample.label }}</span>
        <code>{{ activeExample.filename }}</code>
      </div>
      <CodeMirrorCode
        :code="activeExample.code"
        :label="`${activeExample.label} ${activeExample.filename} ${codeLabelSuffix}`"
      />
    </div>
  </section>
</template>

<style scoped>
.gradient-framework-tabs {
  margin: 28px 0 42px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--vp-c-bg-soft));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.14);
}

.gradient-framework-tabs__header {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--vp-c-bg-soft) 76%, transparent),
    color-mix(in srgb, var(--vp-c-bg) 96%, transparent)
  );
}

.gradient-framework-tabs__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.gradient-framework-tabs__title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.gradient-framework-tabs__description {
  max-width: 760px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.65;
}

.gradient-framework-tabs__tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--vp-c-divider);
}

.gradient-framework-tabs__tab {
  min-width: 0;
  min-height: 44px;
  border: 0;
  border-right: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 52%, transparent);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
}

.gradient-framework-tabs__tab:last-child {
  border-right: 0;
}

.gradient-framework-tabs__tab:hover,
.gradient-framework-tabs__tab:focus-visible {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg-soft));
  outline: none;
}

.gradient-framework-tabs__tab--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: inset 0 -2px 0 var(--vp-c-brand-1);
}

.gradient-framework-tabs__panel {
  display: grid;
  gap: 0;
}

.gradient-framework-tabs__meta {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.gradient-framework-tabs__meta span,
.gradient-framework-tabs__meta code {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gradient-framework-tabs__meta code {
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--vp-code-bg);
  color: var(--vp-c-text-1);
}

.gradient-framework-tabs__code {
  min-height: 430px;
  max-height: 560px;
  overflow: auto;
  background: var(--vp-code-block-bg);
}

@media (max-width: 620px) {
  .gradient-framework-tabs__tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gradient-framework-tabs__tab:nth-child(2n) {
    border-right: 0;
  }

  .gradient-framework-tabs__tab:nth-child(n + 3) {
    border-top: 1px solid var(--vp-c-divider);
  }

  .gradient-framework-tabs__code {
    min-height: 360px;
  }
}
</style>
