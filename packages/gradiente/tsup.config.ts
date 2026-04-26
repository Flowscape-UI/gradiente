import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs', 'iife'],
    dts: true,
    clean: true,
    globalName: 'Gradiente',
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
    minify: false
})