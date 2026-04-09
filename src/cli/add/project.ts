import sort from "../../core/sort.js";
import Prompt, { IPrompt } from "../prompt.js";

function addProject(
  person: any,
  values: {
    name: string | undefined;
    description: string | undefined;
    location: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
    roleName: string | undefined;
  },
) {
  const { name, description, location, startDate, endDate, roleName } = values;
  const { worksFor } = person;
  return {
    ...person,
    worksFor: sort.dateDescending("endDate")([
      ...(worksFor ?? []),
      {
        ["@type"]: "Role",
        description,
        startDate,
        endDate,
        roleName,
        worksFor: {
          ["@type"]: "Project",
          name,
          location,
        },
      },
    ]),
  };
}

/** https://schema.org/worksFor */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    return addProject(person, {
      name: await prompt.ask("Project"),
      description: await prompt.ask("Description"),
      location: await prompt.ask("Location"),
      startDate: await prompt.ask("Start date"),
      endDate: await prompt.ask("End date"),
      roleName: await prompt.ask("Role"),
    });
  } finally {
    prompt.close();
  }
}
