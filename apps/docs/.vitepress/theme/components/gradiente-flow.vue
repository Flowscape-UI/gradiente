<script setup lang="ts">
import { VueFlow, Position } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { h } from 'vue'

const commonStyle = {
    targetPosition: Position.Left,
    sourcePosition: Position.Left,
};

const nodes = [
  {
    ...commonStyle,
    id: "gradiente",
    type: "input",
    data: {
      label: h('div', { class: 'node-content' }, [
        h('img', {
          src: '/gradiente/logo.svg',
          style: {
            width: '48px',
            height: '48px',
            marginBottom: '6px'
          }
        }),
        h('div')
      ])
    },
    position: { x: 40, y: 180 },
    sourcePosition: Position.Right,
  },
  {
    ...commonStyle,
    id: "css",
    data: {
      label: h('div', { class: 'node-content' }, [
        h('img', {
          src: '/gradiente/icons/css.svg',
          style: {
            width: '48px',
            height: '48px',
            marginBottom: '6px'
          }
        }),
        h('div')
      ])
    },
    position: { x: 380, y: 40 },
  },
  {
    ...commonStyle,
    id: "html",
    data: {
      label: h('div', { class: 'node-content' }, [
        h('img', {
          src: '/gradiente/icons/html.svg',
          style: {
            width: '48px',
            height: '48px',
            marginBottom: '6px'
          }
        }),
        h('div')
      ])
    },
    position: { x: 380, y: 140 },
  },
  {
    ...commonStyle,
    id: "webgl",
    data: {
      label: h('div', { class: 'node-content' }, [
        h('img', {
          src: '/gradiente/icons/webgl.svg',
          style: {
            width: '48px',
            height: '48px',
            marginBottom: '6px'
          }
        }),
        h('div')
      ])
    },
    position: { x: 380, y: 240 },
  },
  {
    ...commonStyle,
    id: "flowscape",
    data: {
      label: h('div', { class: 'node-content' }, [
        h('img', {
            src: '/gradiente/icons/flowscape.svg',
            style: {
                width: '48px',
                height: '48px',
                marginBottom: '6px'
            }
        }),
        h('div')
      ])
    },
    position: { x: 380, y: 340 },
  },
];

const commonStylesEdges = {
    animated: true,
    source: "gradiente",
    style: {
        stroke: '#fb7655',
        strokeWidth: 3,
    },
}

const edges = [
    { ...commonStylesEdges, id: 'e1', target: 'css' },
    { ...commonStylesEdges, id: 'e2', target: 'html' },
    { ...commonStylesEdges, id: 'e3', target: 'flowscape' },
    { ...commonStylesEdges, id: 'e4', target: 'webgl' }
]
</script>

<template>
  <div class="gradiente-flow">
    <VueFlow :nodes="nodes" :edges="edges" fit-view-on-init>
      <Background variant="dots" :gap="20" :size="1" />
    </VueFlow>
  </div>
</template>

<style scoped>
.gradiente-flow {
  width: 100%;
  height: 460px;
  border: 1px solid grey;
  border-radius: 16px;
  background: #11100f;
}

:deep(.vue-flow__node-default),
:deep(.vue-flow__node-input) {
  width: 80px;
  height: 80px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #1e1e1e;
  color: grey;

  border: 5px solid grey;
  border-radius: 12px;

  font-weight: 600;
}
</style>
