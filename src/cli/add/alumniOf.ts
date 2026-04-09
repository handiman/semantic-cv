import Prompt, { IPrompt } from "../prompt.js";
import sort from "../../core/sort.js";

function addAlumniOf(
  person: any,
  values: {
    name: string | undefined;
    description: string | undefined;
    location: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
  },
) {
  const { name, description, location, startDate, endDate } = values;
  const { alumniOf } = person;
  return {
    ...person,
    alumniOf: sort.dateDescending("endDate")([
      ...(alumniOf ?? []),
      {
        "@type": "Role",
        name,
        description,
        startDate,
        endDate,
        alumniOf: {
          "@type": "EducationalOrganization",
          name,
          location,
        },
      },
    ]),
  };
}

/** https://schema.org/alumniOf */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    return addAlumniOf(person, {
      name: await prompt.ask("School"),
      description: await prompt.ask("Description"),
      location: await prompt.ask("Location"),
      startDate: await prompt.ask("Start date"),
      endDate: await prompt.ask("End date"),
    });
  } finally {
    prompt.close();
  }
}
