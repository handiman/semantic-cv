import fs from "node:fs";
import path from "node:path";
import { analyzeDirectory, analyzeFile } from "../core/analyze.js";
import { defaults } from "../index.js";

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
