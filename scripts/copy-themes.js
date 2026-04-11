import fs from "node:fs/promises";
import path from "node:path";

const srcDir = "src/themes";
const destDir = "dist/themes";

async function copyFiltered(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyFiltered(srcPath, destPath);
      continue;
    }

    if (entry.name.endsWith(".ts")) {
      continue;
    }

    await fs.copyFile(srcPath, destPath);
  }
}

await copyFiltered(srcDir, destDir);