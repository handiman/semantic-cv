import Prompt from "./prompt.js";
import { defaults, loadFromFile, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import pipe from "../core/pipe.js";

/**
 * Map a property name to a mutation on the Person object.
 *
 * Only a small set of scalar fields can be updated via `set`. Unknown
 * property names are ignored with a console message.
 */
const setProperty = (propertyName: string, value: any) => (person: any) => {
  switch (propertyName) {
    case "@theme":
    case "name":
    case "description":
    case "workLocation":
    case "image":
    case "email":
    case "nationality":
      person[propertyName] = value;
      break;
    case "url":
    case "website":
      person["url"] = value;
      break;
    case "phone":
    case "telephone":
      person["telephone"] = value;
      break;
    case "title":
    case "jobTitle":
      person["jobTitle"] = value;
      break;
    default:
      console.info(`${propertyName} ignored`);
      return;
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
