import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const playgroundDist = path.join(root, "apps/playground/dist");
const docsDist = path.join(root, "apps/docs/.vitepress/dist");
const playgroundTarget = path.join(docsDist, "playground");

await fs.rm(playgroundTarget, {
    recursive: true,
    force: true,
});

await fs.mkdir(playgroundTarget, {
    recursive: true,
});

await fs.cp(playgroundDist, playgroundTarget, {
    recursive: true,
});

console.log("Playground copied to:");
console.log(playgroundTarget);