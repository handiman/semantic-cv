import fs from "node:fs";
import path from "node:path";
import { pipe, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import convertJsonResume from "./convert/jsonResume.js";
import Prompt, { IPrompt } from "./prompt.js";
import { KnownError } from "./error.js";

/**
 * CLI command for converting external résumé formats into Semantic‑CV.
 *
 * The command:
 *   1. Prompts for a source (file path or URL) if not provided.
 *   2. Prompts for an output filename if not provided.
 *   3. Attempts to convert the source using supported converters
 *      (currently JSON Resume).
 *   4. Asks before overwriting an existing output file, like `init`.
 *   5. Normalizes the resulting Person object and saves it to disk.
 *
 * If the source format is not recognized, a `KnownError` is thrown and no
 * file is written.
 *
 * @param args CLI arguments: `[node, script, source?, output?]`.
 * @param prompt Source of the answers; injectable so tests need no terminal.
 */
export async function convert(args: Array<string>, prompt: IPrompt = new Prompt()) {
  try {
    let [, source, filename] = args;
    source = source ?? (await prompt.ask("Source (filename/URL)"));
    filename = filename ?? (await prompt.ask("Output (filename)"));
    let converted: any;
    if (!(await convertJsonResume(source, (person) => (converted = person)))) {
      throw new KnownError("Unsupported format");
    }
    if (
      fs.existsSync(filename) &&
      "y" !== (await prompt.ask(`${path.basename(filename)} already exists. Overwrite it? (y/n)`))
    ) {
      console.log("Aborted. File was not overwritten");
      return;
    }
    pipe(normalize, saveToFile(filename))(converted);
  } finally {
    prompt.close();
  }
}

export default convert;
