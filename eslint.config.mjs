import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist/**', 'docs/.vitepress/cache/**', 'docs/.vitepress/dist/**'],
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    {
        files: ['src/**/*.ts', 'tests/**/*.ts'],
        rules: {
            'no-console': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
]);