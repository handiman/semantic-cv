import sort from "../../core/sort.js";
import Prompt, { IPrompt } from "../prompt.js";

function addLifeEvent(
  person: any,
  values: {
    name: string | undefined;
    description: string | undefined;
    date: string | undefined;
  }
) {
  const { name, description, date } = values;
  const { lifeEvent } = person;
  return {
    ...person,
    lifeEvent: sort.dateDescending("startDate")([
      ...(lifeEvent ?? []),
      {
        ["@type"]: "Event",
        name,
        description,
        startDate: date
      }
    ])
  };
}

/** https://schema.org/lifeEvent */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    return addLifeEvent(person, {
      name: await prompt.ask("Name"),
      description: await prompt.ask("Description"),
      date: await prompt.ask("Date")
    });
  } finally {
    prompt.close();
  }
}
