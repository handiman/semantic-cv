import { defaults, loadFromFile, saveToFile, pipe } from "../index.js";
import normalize from "../core/normalize.js";

/**
 * CLI command for normalizing a Semantic‑CV file in place.
 *
 * The command:
 *   - loads the specified CV file (or the default file if omitted)
 *   - runs the normalization pipeline
 *   - writes the normalized result back to the same file
 *
 * This is useful after manual edits or when converting external data
 * into a clean, canonical Person structure.
 *
 * @param args CLI arguments: `[node, script, fileName?]`.
 */
export default async function (args: Array<string>) {
  const [, file] = args;
  const fileName = file ?? defaults.fileName;
  await pipe(loadFromFile(fileName), normalize, saveToFile(fileName))();
}
