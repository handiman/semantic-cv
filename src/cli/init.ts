import fs from "node:fs";
import path from "node:path";
import Prompt, { IPrompt } from "./prompt.js";
import { defaults, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import pipe from "../core/pipe.js";

/**
 * CLI command for creating a new Semantic‑CV Person file.
 *
 * The command interactively prompts the user for the core Person fields
 * (name, job title, contact info, description, etc.) and writes a
 * minimal, valid schema.org/Person JSON‑LD document to disk.
 *
 * Behavior:
 *   - Uses the provided filename or asks for one if omitted.
 *   - If the file exists, asks for confirmation before overwriting, before
 *     any other question, so declining costs the user nothing.
 *   - Prompts for all primary Person fields.
 *   - Normalizes the resulting Person object and writes the file.
 *
 * After creation, a short “next steps” guide is printed to help users
 * validate, render, or watch their new CV.
 *
 * @param args CLI arguments: `[node, script, fileName?]`.
 * @param prompt Source of the answers; injectable so tests need no terminal.
 */
export async function init(args: Array<string>, prompt: IPrompt = new Prompt()) {
  const ask = (question: string, defaultValue?: string) => prompt.ask(question, defaultValue);
  const [, file] = args;
  const fileName = file ?? (await ask("Write output to", defaults.fileName)) ?? "untitled";
  const filePath = path.resolve(fileName);
  if (
    fs.existsSync(filePath) &&
    "y" !== (await ask(`${fileName} already exists. Overwrite it? (y/n)`))
  ) {
    console.log("Aborted. File was not overwritten");
    prompt.close();
    return;
  }

  const name = await ask("Your name");
  const jobTitle = await ask("Job title");
  const email = await ask("Email");
  const telephone = await ask("Phone number");
  const url = await ask("Web site url");
  const image = await ask("Image url");
  const description = await ask("Short description");

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    description,
    email,
    telephone,
    image,
    url,
    workLocation: "",
    sameAs: [],
    worksFor: [],
    alumniOf: [],
    knowsAbout: [],
    skills: [],
    knowsLanguage: [],
    hasCertification: [],
    hasCredential: [],
    lifeEvent: []
  };

  pipe(normalize, saveToFile(filePath))(person);

  prompt.close();

  console.log(`
Your CV file was created successfully.

Next steps:
  • Validate the structure:
      semantic-cv analyze

  • Render your CV using a theme (example: “minimal”):
      semantic-cv render minimal ${fileName}

  • Continuously validate while editing:
      semantic-cv watch
      
  • Or see the help file for available command:
      semantic-cv help
`);
}

export default init;
