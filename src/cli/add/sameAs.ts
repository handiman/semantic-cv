import Prompt, { IPrompt } from "../prompt.js";

function addSameAs(person: any, url: string | undefined) {
  if (!url || !URL.canParse(url)) {
    return person;
  }
  const sameAs = person.sameAs ?? [];
  return {
    ...person,
    sameAs: [...sameAs, url.trim()],
  };
}

/** https://schema.org/sameAs */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    const url = await prompt.ask("URL");
    return addSameAs(person, url);
  } finally {
    prompt.close();
  }
}
