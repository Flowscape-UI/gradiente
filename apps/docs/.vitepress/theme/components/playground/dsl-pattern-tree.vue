<script setup lang="ts">
import { computed, defineComponent, h, ref, type CSSProperties } from "vue";

const props = defineProps<{ pattern: string }>();

const tokenTheme = {
  entity: { color: "#0284c7", background: "rgba(2,132,199,0.16)" },
  operator: { color: "#ca8a04", background: "rgba(202,138,4,0.16)" },
  group: { color: "#9333ea", background: "rgba(147,51,234,0.16)" },
  sequence: { color: "#e11d48", background: "rgba(225,29,72,0.16)" },
  separator: { color: "#64748b", background: "rgba(100,116,139,0.16)" },
  unknown: { color: "#dc2626", background: "rgba(220,38,38,0.18)" },
} as const;

type NodeType = keyof typeof tokenTheme;

type StructureNode = {
  id: string;
  type: NodeType;
  title: string;
  symbol: string;
  description: string;
  pairId?: string;
  branchId?: string;
  branchPair?: string[];
  collapsible?: boolean;
  children?: StructureNode[];
};

const selectedPairId = ref<string | null>(null);
const selectedBranchIds = ref<string[]>([]);
const collapsedIds = ref<Set<string>>(new Set());

const tokenRegex = /config|color-stop|color-hint|[\^\.\|\~\!\&\(\)\[\],]/g;

function createNode(value: string, id: string): StructureNode {
  if (value === "config")
    return {
      id,
      type: "entity",
      title: "CONFIG",
      symbol: value,
      description: "Gradient configuration input.",
    };
  if (value === "color-stop")
    return {
      id,
      type: "entity",
      title: "COLOR STOP",
      symbol: value,
      description: "Gradient color stop input.",
    };
  if (value === "color-hint")
    return {
      id,
      type: "entity",
      title: "COLOR HINT",
      symbol: value,
      description: "Interpolation hint between color stops.",
    };

  const map: Record<string, Omit<StructureNode, "id">> = {
    "^": {
      type: "operator",
      title: "BEGIN",
      symbol: "^",
      description: "Pattern starts here.",
    },
    ".": {
      type: "operator",
      title: "END",
      symbol: ".",
      description: "Pattern ends here.",
    },
    "[": {
      type: "sequence",
      title: "SEQUENCE",
      symbol: "[",
      description: "Ordered list of expressions.",
      children: [],
      collapsible: true,
    },
    "]": {
      type: "sequence",
      title: "SEQUENCE CLOSE",
      symbol: "]",
      description: "Closes the current sequence.",
    },
    "(": {
      type: "group",
      title: "GROUP",
      symbol: "(",
      description: "Grouped expression or alternatives.",
      children: [],
      collapsible: true,
    },
    ")": {
      type: "group",
      title: "GROUP CLOSE",
      symbol: ")",
      description: "Closes the current group.",
    },
    "|": {
      type: "operator",
      title: "OR",
      symbol: "|",
      description: "Splits the current group into alternative branches.",
    },
    "~": {
      type: "operator",
      title: "REPEAT",
      symbol: "~",
      description: "Repeats the next expression zero or more times.",
    },
    ",": {
      type: "separator",
      title: "SEPARATOR",
      symbol: ",",
      description: "Separates sequence items.",
    },
    "!": {
      type: "operator",
      title: "NOT",
      symbol: "!",
      description: "Reserved logical NOT operator.",
    },
    "&": {
      type: "operator",
      title: "AND",
      symbol: "&",
      description: "Reserved logical AND operator.",
    },
  };

  return {
    id,
    ...(map[value] ?? {
      type: "unknown",
      title: "UNKNOWN",
      symbol: value,
      description: "Unknown token.",
    }),
  };
}

function parsePattern(input: string): StructureNode {
  let idCounter = 0;
  let pairCounter = 0;

  const root: StructureNode = {
    id: `node-${idCounter++}`,
    type: "operator",
    title: "PATTERN",
    symbol: input,
    description: "Full Gradiente DSL pattern.",
    children: [],
    collapsible: true,
  };

  type Frame = {
    node: StructureNode;
    pairId?: string;
    kind: "root" | "group" | "sequence";
    branchIndex: number;
  };

  const stack: Frame[] = [{ node: root, kind: "root", branchIndex: 0 }];
  const pairStack: string[] = [];

  const tokens = [...input.matchAll(tokenRegex)].map((m) => m[0]);

  for (const value of tokens) {
    const current = stack[stack.length - 1];
    const node = createNode(value, `node-${idCounter++}`);

    const activeGroup = [...stack].reverse().find((x) => x.kind === "group");
    if (activeGroup) {
      node.branchId = `${activeGroup.node.id}-branch-${activeGroup.branchIndex}`;
    }

    current.node.children ??= [];

    if (value === "^" || value === ".") {
      node.pairId = "pattern-root";
      current.node.children.push(node);
      continue;
    }

    if (value === "[" || value === "(") {
      const pairId = `pair-${pairCounter++}`;
      node.pairId = pairId;
      pairStack.push(pairId);

      current.node.children.push(node);

      stack.push({
        node,
        pairId,
        kind: value === "(" ? "group" : "sequence",
        branchIndex: 0,
      });

      continue;
    }

    if (value === "|") {
      if (current.kind === "group") {
        node.branchPair = [
          `${current.node.id}-branch-${current.branchIndex}`,
          `${current.node.id}-branch-${current.branchIndex + 1}`,
        ];
        current.node.children.push(node);
        current.branchIndex++;
        continue;
      }

      current.node.children.push(node);
      continue;
    }

    if (value === "]" || value === ")") {
      const pairId = pairStack.pop();
      node.pairId = pairId;

      if (stack.length > 1) stack.pop();

      const parent = stack[stack.length - 1];
      parent.node.children ??= [];
      parent.node.children.push(node);
      continue;
    }

    current.node.children.push(node);
  }

  return root;
}

const tree = computed(() => parsePattern(props.pattern));

function explainNode(node: StructureNode, depth = 0): string[] {
  const pad = "  ".repeat(depth);

  const line =
    node.title === "PATTERN"
      ? `${pad}Pattern`
      : `${pad}${node.title} "${node.symbol}" - ${node.description}`;

  const children =
    node.children?.flatMap((child) => explainNode(child, depth + 1)) ?? [];
  return [line, ...children];
}

const explanation = computed(() => explainNode(tree.value).join("\n"));

function toggleCollapse(id: string) {
  const next = new Set(collapsedIds.value);

  if (next.has(id)) next.delete(id);
  else next.add(id);

  collapsedIds.value = next;
}

const TreeNodeView = defineComponent({
  name: "TreeNodeView",
  props: {
    node: { type: Object as () => StructureNode, required: true },
    depth: { type: Number, default: 0 },
    selectedPairId: { type: String, default: null },
    selectedBranchIds: { type: Array as () => string[], default: () => [] },
    collapsedIds: { type: Object as () => Set<string>, required: true },
    onSelectPair: {
      type: Function as unknown as () => (id: string) => void,
      required: true,
    },
    onSelectBranches: {
      type: Function as unknown as () => (ids: string[]) => void,
      required: true,
    },
    onToggleCollapse: {
      type: Function as unknown as () => (id: string) => void,
      required: true,
    },
  },

  setup(props) {
    return () => {
      const theme = tokenTheme[props.node.type];
      const isPairSelected =
        props.node.pairId && props.node.pairId === props.selectedPairId;
      const isBranchSelected =
        props.node.branchId &&
        props.selectedBranchIds.includes(props.node.branchId);
      const isCollapsed = props.collapsedIds.has(props.node.id);
      const hasChildren = !!props.node.children?.length;

      const typeStyle: CSSProperties = {
        color: theme.color,
        background: theme.background,
        borderRightColor: theme.color,
      };

      return h("div", { class: "nodeGroup" }, [
        h(
          "div",
          {
            class: [
              "node",
              isPairSelected ? "selectedPair" : "",
              isBranchSelected ? "selectedBranch" : "",
            ],
            style: { marginLeft: `${props.depth * 30}px` },
            onClick: (event: MouseEvent) => {
              event.stopPropagation();

              if (props.node.branchPair) {
                props.onSelectBranches(props.node.branchPair);
                return;
              }

              if (props.node.pairId) {
                props.onSelectPair(props.node.pairId);
              }
            },
          },
          [
            hasChildren
              ? h(
                "button",
                {
                  class: "collapseButton",
                  onClick: (event: MouseEvent) => {
                    event.stopPropagation();
                    props.onToggleCollapse(props.node.id);
                  },
                },
                isCollapsed ? "+" : "-",
              )
              : h("span", { class: "collapseSpacer" }),

            h(
              "div",
              { class: "type", style: typeStyle },
              `${props.node.title} = "${props.node.symbol}"`,
            ),
            h("div", { class: "description" }, props.node.description),
          ],
        ),

        !isCollapsed && hasChildren
          ? props.node.children!.map((child, index) =>
            h(TreeNodeView, {
              key: index,
              node: child,
              depth: props.depth + 1,
              selectedPairId: props.selectedPairId,
              selectedBranchIds: props.selectedBranchIds,
              collapsedIds: props.collapsedIds,
              onSelectPair: props.onSelectPair,
              onSelectBranches: props.onSelectBranches,
              onToggleCollapse: props.onToggleCollapse,
            }),
          )
          : null,
      ]);
    };
  },
});
</script>

<template>
  <section class="treeCard" @click="
    selectedPairId = null;
  selectedBranchIds = [];
  ">
    <TreeNodeView :node="tree" :depth="0" :selected-pair-id="selectedPairId" :selected-branch-ids="selectedBranchIds"
      :collapsed-ids="collapsedIds" :on-select-pair="(id: string) => {
          selectedPairId = id;
          selectedBranchIds = [];
        }
        " :on-select-branches="(ids: string[]) => {
          selectedBranchIds = ids;
          selectedPairId = null;
        }
        " :on-toggle-collapse="toggleCollapse" />

    <details class="explain">
      <summary>Explain pattern</summary>
      <pre>{{ explanation }}</pre>
    </details>
  </section>
</template>

<style scoped>
.treeCard {
  background: white;
  border-top: 4px solid rgba(2, 132, 199, 1);
  padding: 12px 0;
  overflow-x: auto;
}

:deep(.nodeGroup) {
  display: block;
}

:deep(.node) {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 2px;
  cursor: pointer;
}

:deep(.collapseButton),
:deep(.collapseSpacer) {
  width: 24px;
  min-width: 24px;
  border: 0;
  background: #f1f5f9;
  color: #111;
  font-weight: 900;
  cursor: pointer;
}

:deep(.collapseSpacer) {
  background: transparent;
}

:deep(.type) {
  padding: 2px 12px;
  font-family: "Source Code Pro", monospace;
  font-size: 18px;
  font-weight: 800;
  border-right: 4px solid;
  white-space: nowrap;
}

:deep(.description) {
  color: black;
  font-family: "Source Code Pro", monospace;
  font-size: 17px;
  font-weight: 600;
  padding: 2px 12px;
  white-space: nowrap;
}

:deep(.node.selectedPair .type) {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

:deep(.node.selectedPair .description) {
  background: rgba(0, 0, 0, 0.06);
}

:deep(.node.selectedBranch .type),
:deep(.node.selectedBranch .description) {
  background: rgba(250, 204, 21, 0.24);
}

.explain {
  margin: 16px 16px 0;
  color: black;
  font-family: "Source Code Pro", monospace;
}

.explain summary {
  cursor: pointer;
  font-weight: 900;
}

.explain pre {
  margin-top: 10px;
  padding: 12px;
  background: #f8fafc;
  color: black;
  overflow-x: auto;
}
</style>
