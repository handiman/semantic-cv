import { defaults, loadFromFile, pipe, saveToFile } from "../index.js";
import { IPrompt } from "./prompt.js";
import normalize from "../core/normalize.js";
import addSameAs from "./add/sameAs.js";
import addSkills from "./add/skills.js";
import addKnowsAbout from "./add/knowsAbout.js";
import addKnowsLanguage from "./add/knowsLanguage.js";
import addHasCertification from "./add/hasCertification.js";
import addWorksFor from "./add/worksFor.js";
import addAlumniOf from "./add/alumniOf.js";
import addLifeEvent from "./add/lifeEvent.js";
import addProject from "./add/project.js";
import addHasCredential from "./add/hasCredential.js";

/**
 * CLI command for interactively adding a property to a Semantic‑CV document.
 *
 * The command:
 *   1. Loads the Person JSON‑LD file.
 *   2. Prompts the user for the value of the requested property.
 *   3. Applies the appropriate `add*` helper based on the property name.
 *   4. Normalizes the updated Person object.
 *   5. Saves the result back to disk.
 *
 * Supported property names include:
 *   - sameAs
 *   - skills / skill
 *   - knowsAbout / competence
 *   - knowsLanguage / language
 *   - hasCertification / certification / cert
 *   - hasCredential / credential
 *   - worksFor / work / employer / employment
 *   - alumniOf / education / school
 *   - lifeEvent
 *   - project
 *
 * Unknown property names are ignored with a console message.
 *
 * @param propertyName Property (or alias) to add.
 * @param prompt Source of the answers; defaults to asking on the terminal.
 */
export const add = (propertyName: string, prompt?: IPrompt) => (person: any) => {
  switch (propertyName) {
    case "sameAs":
      return addSameAs(person, prompt);
    case "skill":
    case "skills":
      return addSkills(person, prompt);
    case "competence":
    case "knowsAbout":
      return addKnowsAbout(person, prompt);
    case "language":
    case "knowsLanguage":
      return addKnowsLanguage(person, prompt);
    case "cert":
    case "certification":
    case "hasCertification":
      return addHasCertification(person, prompt);
    case "credential":
    case "hasCredential":
      return addHasCredential(person, prompt);
    case "employer":
    case "employment":
    case "work":
    case "worksFor":
      return addWorksFor(person, prompt);
    case "education":
    case "school":
    case "alumniOf":
      return addAlumniOf(person, prompt);
    case "lifeEvent":
      return addLifeEvent(person, prompt);
    case "project":
      return addProject(person, prompt);
    default:
      console.info(`${propertyName} ignored.`);
      return person;
  }
};

/**
 * Entry point for the `semantic-cv add` CLI command.
 *
 * @param args CLI arguments: `[node, script, propertyName, fileName?]`.
 *             If no file name is provided, the default CV file is used.
 */
export async function addPrompt(args: Array<string>) {
  const [, propertyName, file] = args;
  const fileName = file ?? defaults.fileName;
  const person = await pipe(loadFromFile(fileName), add(propertyName))();
  pipe(normalize, saveToFile(fileName))(person);
}

export default addPrompt;
