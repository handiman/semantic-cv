import { existsSync, statSync } from "node:fs";
import { readdir, rmdir, rm } from "node:fs/promises";
import { resolve, join } from "node:path";

async function removeFile(fullPath) {
  await rm(fullPath, {
    force: true
  });
}

async function removeDir(fullPath) {
  const entries = await readdir(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await removeDir(join(fullPath, entry.name));
    } else {
      await removeFile(join(fullPath, entry.name));
    }
  }
  await rmdir(fullPath);
}

const directoriesToClean = ["dist/core", "dist/themes"];
const pathsToRemove = [
  "dist",
  ".git",
  ".gitignore",
  ".github",
  ".prettierignore",
  ".prettierrc",
  "LICENSE",
  "README.md"
];

for (const directory of directoriesToClean) {
  for (const path of pathsToRemove) {
    const fullPath = resolve(directory, path);
    if (existsSync(fullPath)) {
      if (statSync(fullPath).isDirectory()) {
        await removeDir(fullPath);
      } else {
        await removeFile(fullPath);
      }
    }
  }
}
