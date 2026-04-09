import Prompt from "./prompt.js";
import { defaults, loadFromFile, saveToFile } from "../index.js";
import normalize from "../core/normalize.js";
import pipe from "../core/pipe.js";

const setProperty = (propertyName: string, value: any) => (person: any) => {
  switch (propertyName) {
    case "@theme":
    case "name":
    case "description":
    case "workLocation":
    case "image":
    case "email":
    case "nationality":
      person[propertyName] = value;
      break;
    case "url":
    case "website":
      person["url"] = value;
      break;
    case "phone":
    case "telephone":
      person["telephone"] = value;
      break;
    case "title":
    case "jobTitle":
      person["jobTitle"] = value;
      break;
    default:
      console.info(`${propertyName} ignored`);
      return;
  }
  return person;
};

export async function set(args: Array<string>) {
  const [, name, val, file] = args;
  const fileName = file ?? defaults.fileName;
  const prompt = async (question: string) => {
    const prompt = new Prompt();
    const anwser = await prompt.ask(question);
    prompt.close();
    return anwser;
  };
  let value = val ?? (await prompt(`Enter a value for ${name}`));

  pipe(
    loadFromFile(fileName),
    setProperty(name, value),
    normalize,
    saveToFile(fileName),
  )();
}

export default set;
