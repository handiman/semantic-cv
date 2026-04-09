import fs from "node:fs";
import path from "node:path";

export { default as pipe } from "./core/pipe.js";

export const loadFromFile =
  (...paths: string[]) =>
  () => {
    const jsonld = fs.readFileSync(path.join(...paths)).toString();
    return JSON.parse(jsonld);
  };

export const saveToFile = (fullPath: string) => (person: any) => {
  const jsonld = JSON.stringify(person, null, 2);
  fs.writeFileSync(fullPath, jsonld, {
    flag: "w",
  });
  return person;
};

export const defaults = {
  theme: "minimal",
  fileName: "cv.json",
};
