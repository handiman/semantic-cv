import Prompt, { IPrompt } from "../prompt.js";

function addKnowsLanguage(person: any, language: string | undefined) {
  if (null === language || undefined === language) {
    return person;
  }

  const trimmedLanguage = language.trim();
  if (trimmedLanguage.length === 0) {
    return person;
  }

  const knowsLanguage = person.knowsLanguage ?? [];
  return {
    ...person,
    knowsLanguage: [...knowsLanguage, trimmedLanguage],
  };
}

/** https://schema.org/knowsLanguage */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    const language = await prompt.ask("Enter language");
    return addKnowsLanguage(person, language);
  } finally {
    prompt.close();
  }
}
