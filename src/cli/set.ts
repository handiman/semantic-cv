import Prompt from "./prompt.js";
import { defaults, loadFromFile, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import pipe from "../core/pipe.js";
import { KnownError } from "./error.js";

/**
 * Property names accepted by `set`, mapped to the Person field they update.
 */
const PROPERTIES: Record<string, string> = {
  "@theme": "theme",
  theme: "theme",
  name: "name",
  description: "description",
  workLocation: "workLocation",
  image: "image",
  email: "email",
  nationality: "nationality",
  url: "url",
  website: "url",
  phone: "telephone",
  telephone: "telephone",
  title: "jobTitle",
  jobTitle: "jobTitle"
};

const unknownProperty = (propertyName: string | undefined) =>
  new KnownError(
    `Unknown property "${propertyName ?? ""}". Supported properties: ${Object.keys(PROPERTIES).join(", ")}`
  );

/**
 * Map a property name to a mutation on the Person object.
 *
 * Only a small set of scalar fields can be updated via `set`. Unknown
 * property names throw a KnownError, so the file is never rewritten.
 */
export const setProperty = (propertyName: string, value: any) => (person: any) => {
  const field = PROPERTIES[propertyName];
  if (!field) {
    // Throwing (instead of returning nothing) keeps the file untouched.
    throw unknownProperty(propertyName);
  }
  if ("theme" === field) {
    delete person["@theme"];
    person["theme"] = {
      "@type": "Theme",
      name: value
    };
  } else {
    person[field] = value;
  }
  return person;
};

/**
 * CLI command for setting a single scalar field on a Semantic‑CV file.
 *
 * The command:
 *   - takes a property name and value from the CLI
 *   - prompts for the value if it was not provided
 *   - loads the Person file (or the default file)
 *   - applies the update using `setProperty`
 *   - normalizes and saves the result back to disk
 *
 * Only simple scalar fields (name, jobTitle, email, url, etc.) can be
 * updated this way. Array‑based fields should be modified using the
 * `add` command instead.
 *
 * @param args CLI arguments: `[node, script, propertyName, value?, fileName?]`.
 */
export async function set(args: Array<string>) {
  const [, name, val, file] = args;
  if (!PROPERTIES[name]) {
    throw unknownProperty(name);
  }
  const fileName = file ?? defaults.fileName;
  const prompt = async (question: string) => {
    const prompt = new Prompt();
    const anwser = await prompt.ask(question);
    prompt.close();
    return anwser;
  };
  let value = val ?? (await prompt(`Enter a value for ${name}`));

  pipe(loadFromFile(fileName), setProperty(name, value), normalize, saveToFile(fileName))();
}

export default set;
