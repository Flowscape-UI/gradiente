import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
    base: "/gradiente/playground",
    resolve: {
        alias: {
            gradiente: resolve(rootDir, "packages/gradiente/src/index.ts"),
        },
    },
});
