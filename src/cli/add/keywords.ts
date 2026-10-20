import { toArray } from "../../core/normalize.js";
import { KnownError } from "../error.js";
import Prompt, { IPrompt } from "../prompt.js";

const describeRole = (role: any, index: number) => {
  const text = [role.roleName, role.worksFor?.name].filter(Boolean).join(" at ");
  return `${index + 1}. ${text || "Role"}`;
};

async function chooseRole(roles: Array<any>, prompt: IPrompt) {
  if (1 === roles.length) {
    return 0;
  }

  console.info(roles.map(describeRole).join("\n"));
  const answer = (await prompt.ask("Role number", "1")) ?? "1";
  const index = Number(answer) - 1;
  if (!/^\d+$/.test(answer) || index < 0 || index >= roles.length) {
    throw new KnownError(`"${answer}" is not one of the roles 1-${roles.length}.`);
  }

  return index;
}

async function askForKeywords(prompt: IPrompt) {
  const answer = await prompt.ask("Keywords (comma separated)");
  return (answer ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

function addKeywords(person: any, roleIndex: number, keywords: Array<string>) {
  if (0 === keywords.length) {
    return person;
  }

  return {
    ...person,
    worksFor: toArray(person.worksFor).map((role: any, index: number) =>
      index !== roleIndex
        ? role
        : {
            ...role,
            keywords: [
              ...(toArray(role.keywords) ?? []),
              ...keywords.map((name) => ({ "@type": "DefinedTerm", name }))
            ]
          }
    )
  };
}

/** https://schema.org/keywords, on a role in worksFor */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    const roles = toArray(person.worksFor) ?? [];
    if (0 === roles.length) {
      throw new KnownError("There is no work to add keywords to. Add one with `add work` first.");
    }

    const roleIndex = await chooseRole(roles, prompt);
    return addKeywords(person, roleIndex, await askForKeywords(prompt));
  } finally {
    prompt.close();
  }
}
