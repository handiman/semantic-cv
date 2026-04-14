import Prompt, { IPrompt } from "../prompt.js";

function addSkills(person: any, skill: string | undefined) {
  if (null === skill || undefined === skill) {
    return person;
  }

  const trimmedSkill = skill.trim();
  if (0 === trimmedSkill.length) {
    return person;
  }

  const skills = person.skills ?? [];
  return {
    ...person,
    skills: [...skills, trimmedSkill]
  };
}

/** https://schema.org/skills */
export default async function (person: any, prompt: IPrompt = new Prompt()) {
  try {
    const skill = await prompt.ask("Enter skill");
    return addSkills(person, skill);
  } finally {
    prompt.close();
  }
}
