import fs from "node:fs";
import path from "node:path";
import { analyzeDirectory, analyzeFile } from "../core/analyzeFiles.js";
import { defaults } from "../index.js";
import { assertExists } from "./file.js";
import { KnownError } from "./error.js";

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
 * Warnings alone are fine. If any file has errors, the command throws a
 * `KnownError` after reporting them, so the process exits with code 1 and
 * `analyze` can gate a CI job.
 *
 * @param args CLI arguments: `[node, script, path?]`.
 *             If omitted, the default CV file name is used.
 */
export async function analyze(args: Array<string>) {
  const [, baseName] = args;
  const fullPath = path.join(process.cwd(), baseName ?? defaults.fileName);
  assertExists(fullPath);
  const errorCount = fs.statSync(fullPath).isDirectory()
    ? await analyzeDirectory(fullPath)
    : await analyzeFile(fullPath);
  if (errorCount > 0) {
    throw new KnownError(`Found ${errorCount} ${errorCount === 1 ? "error" : "errors"}`);
  }
}

export default analyze;
