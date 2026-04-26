import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/node_modules/**',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,

  {
    files: [
      'packages/gradiente/src/**/*.ts',
      'packages/gradiente/tests/**/*.ts',
    ],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
]);