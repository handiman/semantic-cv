import fs from "node:fs";
import path from "node:path";
import { analyzeDirectory, analyzeFile } from "../core/analyze.js";
import { defaults } from "../index.js";

/**
 * CLI command for continuously validating a Semantic‑CV file or directory.
 *
 * The command:
 *   - watches a single file or an entire directory tree
 *   - triggers `analyzeFile` whenever a `*.cv.json` file changes
 *   - debounces rapid successive events to avoid duplicate analysis
 *   - performs an initial analysis before watching
 *
 * Directory mode:
 *   - recursively watches all subdirectories
 *   - automatically begins watching newly created subdirectories
 *
 * File mode:
 *   - watches only the specified file
 *
 * @param args CLI arguments: `[node, script, path?]`.
 *             If omitted, the default CV file is used.
 */
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

/**
 * Wrap a callback so it only fires once per 100ms per filename.
 */
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

/**
 * Recursively watch a directory tree for changes to *.cv.json files.
 */
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

/**
 * Watch a single file for changes.
 */
function watchFile(filename: string) {
  const trigger = createDebouncedWatcher(analyzeFile);
  analyzeFile(filename);
  fs.watch(filename, { persistent: true }, (eventType) => {
    if (eventType === "change") {
      trigger(filename);
    }
  });
}
