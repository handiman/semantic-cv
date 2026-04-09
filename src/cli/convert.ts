import { pipe, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import convertJsonResume from "./convert/jsonResume.js";
import Prompt from "./prompt.js";

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
