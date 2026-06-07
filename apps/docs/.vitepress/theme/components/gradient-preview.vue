<script setup lang="ts">
import { computed } from 'vue'
import { parse, transformTo } from 'gradiente'

const props = withDefaults(defineProps<{
  title: string
  gradient: string
  syntax?: string
  caption?: string
  tone?: 'dark' | 'light'
}>(), {
  syntax: '',
  caption: '',
  tone: 'dark'
})

const previewState = computed(() => {
  try {
    const gradient = parse(props.gradient)

    return {
      backgroundImage: transformTo<string>('css', gradient),
      error: '',
      normalized: gradient.toString(),
    }
  } catch (value) {
    return {
      backgroundImage: '',
      error: value instanceof Error ? value.message : 'Failed to render gradient.',
      normalized: props.syntax || props.gradient,
    }
  }
})

const normalizedGradient = computed(() => {
  return previewState.value.normalized
})

const error = computed(() => {
  return previewState.value.error
})
</script>

<template>
  <figure class="gradient-preview" :class="`gradient-preview--${tone}`">
    <div
      class="gradient-preview__visual"
      :style="{ backgroundImage: previewState.backgroundImage }"
      :data-gradiente-input="gradient"
      :data-gradiente-normalized="normalizedGradient"
      data-gradiente-renderer="css"
      :aria-label="`${title} gradient preview`"
    />
    <figcaption class="gradient-preview__body">
      <span class="gradient-preview__title">{{ title }}</span>
      <code class="gradient-preview__syntax">{{ syntax || normalizedGradient }}</code>
      <p v-if="caption" class="gradient-preview__caption">{{ caption }}</p>
      <p v-if="error" class="gradient-preview__error">{{ error }}</p>
    </figcaption>
  </figure>
</template>
