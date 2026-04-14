import fs from "node:fs";
import path from "node:path";
import { analyzeDirectory, analyzeFile } from "../core/analyze.js";
import { defaults } from "../index.js";

/**
 * CLI command for analyzing a Semantic‑CV file or an entire directory.
 *
 * The command resolves the provided path (or the default CV file) and:
 *   - runs `analyzeFile` if the path points to a single JSON‑LD file
 *   - runs `analyzeDirectory` if the path is a directory
 *
 * Directory analysis recursively processes all JSON‑LD files and prints
 * structural issues, warnings, and normalization hints.
 *
 * @param args CLI arguments: `[node, script, path?]`.
 *             If omitted, the default CV file name is used.
 */
export async function analyze(args: Array<string>) {
  const [, baseName] = args;
  const fullPath = path.join(process.cwd(), baseName ?? defaults.fileName);
  if (fs.statSync(fullPath).isDirectory()) {
    await analyzeDirectory(fullPath);
  } else {
    await analyzeFile(fullPath);
  }
}

export default analyze;
