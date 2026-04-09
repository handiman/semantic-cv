import Prompt, { IPrompt } from "../prompt.js";

function addKnowsAbout(person: any, competence: string | undefined) {
  if (null === competence || undefined === competence) {
    return person;
  }

  const trimmedCompetence = competence.trim();
  if (0 === trimmedCompetence.length) {
    return person;
  }

  const knowsAbout = person.knowsAbout ?? [];
  return {
    ...person,
    knowsAbout: [...knowsAbout, trimmedCompetence],
  };
}

/** https://schema.org/knowsAbout */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    const competence = await prompt.ask("Enter competence");
    return addKnowsAbout(person, competence);
  } finally {
    prompt.close();
  }
}
