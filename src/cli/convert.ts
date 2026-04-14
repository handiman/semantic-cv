import { pipe, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import convertJsonResume from "./convert/jsonResume.js";
import Prompt from "./prompt.js";

/**
 * CLI command for converting external résumé formats into Semantic‑CV.
 *
 * The command:
 *   1. Prompts for a source (file path or URL) if not provided.
 *   2. Prompts for an output filename if not provided.
 *   3. Attempts to convert the source using supported converters
 *      (currently JSON Resume).
 *   4. Normalizes the resulting Person object.
 *   5. Saves the output to disk.
 *
 * If the source format is not recognized, a message is printed and no
 * file is written.
 *
 * @param args CLI arguments: `[node, script, source?, output?]`.
 */
export async function convert(args: Array<string>) {
  const prompt = new Prompt();
  try {
    let [, source, filename] = args;
    source = source ?? (await prompt.ask("Source (filename/URL)"));
    filename = filename ?? (await prompt.ask("Output (filename)"));
    const callback = pipe(normalize, saveToFile(filename));
    if (await convertJsonResume(source, callback)) {
      return;
    }
    console.info(`Unsupported format`);
  } finally {
    prompt.close();
  }
}

export default convert;
