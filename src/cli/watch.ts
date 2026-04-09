import fs from "node:fs";
import path from "node:path";
import { analyzeDirectory, analyzeFile } from "../core/analyze.js";
import { defaults } from "../index.js";

function createDebouncedWatcher(callback: (filename: string) => void) {
  const debounceMap = new Map<string, NodeJS.Timeout>();

  return (filename: string) => {
    if (debounceMap.has(filename)) {
      clearTimeout(debounceMap.get(filename)!);
    }

    const timer = setTimeout(() => {
      callback(filename);
      debounceMap.delete(filename);
    }, 100);

    debounceMap.set(filename, timer);
  };
}

async function watchDirectory(dir: string) {
  const trigger = createDebouncedWatcher(analyzeFile);

  const watchDir = (dir: string) => {
    fs.watch(dir, { persistent: true }, (eventType, basename) => {
      if (!basename) {
        return;
      }

      const fullPath = path.join(dir, basename);

      // New directory
      if (eventType === "rename") {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
          watchRecursively(fullPath);
          return;
        }
      }

      if (!basename.endsWith("cv.json")) {
        return;
      }

      trigger(fullPath);
    });
  };

  const watchRecursively = (dir: string) => {
    watchDir(dir);

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        watchRecursively(path.join(dir, entry.name));
      }
    }
  };

  await analyzeDirectory(dir);
  watchRecursively(dir);
}

function watchFile(filename: string) {
  const trigger = createDebouncedWatcher(analyzeFile);
  analyzeFile(filename);
  fs.watch(filename, { persistent: true }, (eventType) => {
    if (eventType === "change") {
      trigger(filename);
    }
  });
}

export async function watch(args: Array<string>) {
  const [, file] = args;
  const fullPath = path.join(process.cwd(), file ?? defaults.fileName);
  if (fs.statSync(fullPath).isDirectory()) {
    await watchDirectory(fullPath);
  } else {
    watchFile(fullPath);
  }
}

export default watch;
