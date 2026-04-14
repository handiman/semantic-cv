import sort from "../../core/sort.js";
import Prompt, { IPrompt } from "../prompt.js";

function trim(value: string | null | undefined) {
  if (null === value || undefined === value) {
    return undefined;
  }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function addHasCredential(
  person: any,
  values: {
    name: string | undefined;
    description: string | undefined;
    datePublished: string | undefined;
    expires: string | undefined;
    image: string | undefined;
  }
) {
  const { name, description, datePublished, expires, image } = values;
  const hasCredential = person.hasCredential ?? [];
  return {
    ...person,
    hasCredential: sort.dateDescending("datePublished")([
      ...hasCredential,
      {
        ["@type"]: "EducationalOccupationalCredential",
        name: trim(name),
        description: trim(description),
        datePublished: trim(datePublished),
        expires: trim(expires),
        image: trim(image)
      }
    ])
  };
}

/** https://schema.org/hasCredential */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    return addHasCredential(person, {
      name: await prompt.ask("Name"),
      description: await prompt.ask("Description"),
      datePublished: await prompt.ask("Date published"),
      expires: await prompt.ask("Expires"),
      image: await prompt.ask("Logo")
    });
  } finally {
    prompt.close();
  }
}
