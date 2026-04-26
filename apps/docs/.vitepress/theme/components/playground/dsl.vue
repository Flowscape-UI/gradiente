<script setup lang="ts">
import { ref } from 'vue'
import DslPatternEditor from './dsl-pattern-editor.vue'
import DslPatternTree from './dsl-pattern-tree.vue'

const pattern = ref(
    '^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].'
)
</script>

<template>
    <DslPatternEditor v-model="pattern" />
    <DslPatternTree :pattern="pattern" />
</template>