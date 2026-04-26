<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  placeholder,
  Decoration,
  type DecorationSet,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { analyzePattern } from "./helpers";

const model = defineModel<string>({ required: true });

const editorRef = ref<HTMLDivElement | null>(null);
let view: EditorView | null = null;

const tokenTheme = {
  entity: { color: "#0284c7", background: "rgba(2,132,199,0.16)" },
  operator: { color: "#ca8a04", background: "rgba(202,138,4,0.16)" },
  group: { color: "#9333ea", background: "rgba(147,51,234,0.16)" },
  sequence: { color: "#e11d48", background: "rgba(225,29,72,0.16)" },
  separator: { color: "#64748b", background: "rgba(100,116,139,0.16)" },
  unknown: { color: "#dc2626", background: "rgba(220,38,38,0.18)" },
} as const;

function getTokenType(value: string): keyof typeof tokenTheme {
  if (value === "config" || value === "color-stop" || value === "color-hint") {
    return "entity";
  }

  if (
    value === "^" ||
    value === "." ||
    value === "|" ||
    value === "~" ||
    value === "!" ||
    value === "&"
  ) {
    return "operator";
  }

  if (value === "(" || value === ")") return "group";
  if (value === "[" || value === "]") return "sequence";
  if (value === ",") return "separator";

  return "unknown";
}

function createHighlightPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.build(update.view);
        }
      }

      build(view: EditorView): DecorationSet {
        const text = view.state.doc.toString();
        const re = /config|color-stop|color-hint|[\^\.\|\~\!\&\(\)\[\],]/g;

        const decorations = [];
        let match: RegExpExecArray | null;

        while ((match = re.exec(text))) {
          const value = match[0];
          const type = getTokenType(value);
          const theme = tokenTheme[type];

          decorations.push(
            Decoration.mark({
              attributes: {
                style: [
                  `color: ${theme.color}`,
                  `background: ${theme.background}`,
                  "border-radius: 5px",
                  "padding: 1px 2px",
                ].join(";"),
              },
            }).range(match.index, match.index + value.length),
          );
        }

        return Decoration.set(decorations, true);
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}

function createErrorPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.build(update.view);
        }
      }

      build(view: EditorView): DecorationSet {
        const text = view.state.doc.toString();
        const result = analyzePattern(text);

        if (result.valid || text.length === 0) {
          return Decoration.none;
        }

        const decorations = result.diagnostics.map((diagnostic) => {
          const from = Math.max(0, diagnostic.start);
          const to = Math.max(from + 1, Math.min(text.length, diagnostic.end));

          return Decoration.mark({
            attributes: {
              title: diagnostic.message,
              style: [
                "text-decoration-line: underline",
                "text-decoration-style: wavy",
                "text-decoration-color: #ef4444",
                "text-decoration-thickness: 2px",
                "text-underline-offset: 4px",
              ].join(";"),
            },
          }).range(from, to);
        });

        return Decoration.set(decorations, true);
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}

const dslHighlight = createHighlightPlugin();
const dslErrors = createErrorPlugin();

onMounted(() => {
  if (!editorRef.value) return;

  view = new EditorView({
    parent: editorRef.value,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        bracketMatching(),
        keymap.of(defaultKeymap),
        placeholder(
          "^[([config,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)]....",
        ),
        dslHighlight,
        dslErrors,

        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          model.value = update.state.doc.toString();
        }),

        EditorView.theme({
          "&": {
            width: "100%",
            padding: "24px 16px",
            fontFamily: '"Source Code Pro", monospace',
            fontSize: "20px",
            fontWeight: "bold",
            background: "white",
            color: "black",
            border: "none",
          },

          ".cm-content": {
            padding: "0",
            caretColor: "black",
          },

          ".cm-line": {
            padding: "0",
          },

          ".cm-scroller": {
            overflow: "hidden",
            fontFamily: "inherit",
          },

          ".cm-focused": {
            outline: "none",
          },

          ".cm-placeholder": {
            color: "#888",
          },
        }),
      ],
    }),
  });
});

watch(model, (value) => {
  if (!view) return;

  const current = view.state.doc.toString();
  if (value === current) return;

  view.dispatch({
    changes: {
      from: 0,
      to: current.length,
      insert: value,
    },
  });
});

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});
</script>

<template>
  <div ref="editorRef" class="input" />
</template>

<style scoped>
.input {
  width: 100%;
}
</style>
