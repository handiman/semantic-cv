import { defaults, loadFromFile, pipe, saveToFile } from "../index.js";
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

const add = (propertyName: string) => (person: any) => {
  switch (propertyName) {
    case "sameAs":
      return addSameAs(person);
    case "skill":
    case "skills":
      return addSkills(person);
    case "competence":
    case "knowsAbout":
      return addKnowsAbout(person);
    case "language":
    case "knowsLanguage":
      return addKnowsLanguage(person);
    case "cert":
    case "certification":
    case "hasCertification":
      return addHasCertification(person);
    case "credential":
      return addHasCredential(person);
    case "employer":
    case "employment":
    case "work":
    case "worksFor":
      return addWorksFor(person);
    case "education":
    case "school":
    case "alumniOf":
      return addAlumniOf(person);
    case "lifeEvent":
      return addLifeEvent(person);
    case "project":
      return addProject(person);
    default:
      console.info(`${propertyName} ignored.`);
      return person;
  }
};

export async function addPrompt(args: Array<string>) {
  const [, propertyName, file] = args;
  const fileName = file ?? defaults.fileName;
  const person = await pipe(loadFromFile(fileName), add(propertyName))();
  pipe(normalize, saveToFile(fileName))(person);
}

export default addPrompt;
