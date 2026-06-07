import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import './custom.css';

import GradienteFlow from './components/gradiente-flow.vue';
import GradientPreview from './components/gradient-preview.vue';
import DSLPlayground from './components/playground/dsl.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DSLPlayground', DSLPlayground);
    app.component('GradienteFlow', GradienteFlow);
    app.component('GradientPreview', GradientPreview);
  }
} satisfies Theme
