import { execSync } from "node:child_process";
import fs from "node:fs";

const bump = process.argv[2];
const allowedBumps = new Set(["patch", "minor", "major"]);

if (!allowedBumps.has(bump)) {
    console.error("Usage: node scripts/release-gradiente.mjs <patch|minor|major>");
    process.exit(1);
}

function run(command) {
    console.log(`\n> ${command}`);
    execSync(command, {
        stdio: "inherit",
        shell: true,
    });
}

function readJson(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

run(`npm version ${bump} --prefix packages/gradiente --no-git-tag-version`);

const pkg = readJson("packages/gradiente/package.json");
const version = pkg.version;
const tag = `v${version}`;

run("pnpm install --lockfile-only");

run("git add packages/gradiente/package.json pnpm-lock.yaml");
run(`git commit -m "chore(release): gradiente ${tag}"`);
run(`git tag ${tag}`);

console.log(`\nRelease prepared: ${tag}`);
console.log("\nNext commands:");
console.log("git push");
console.log(`git push origin ${tag}`);