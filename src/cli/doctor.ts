import {
  defaults,
  loadFromFile,
  saveToFile,
  pipe,
} from "../index.js";
import normalize from "../core/normalize.js";

export default async function (args: Array<string>) {
  const [, file] = args;
  const fileName = file ?? defaults.fileName;
  pipe(
    loadFromFile(fileName), 
    normalize, 
    saveToFile(fileName)
  )();
}
