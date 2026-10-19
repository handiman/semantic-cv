import fs from "node:fs";
import path from "node:path";
import { KnownError } from "./cli/error.js";

export { default as pipe } from "./core/pipe.js";

/**
 * Load and parse a JSON-LD file. A missing file or invalid JSON is something the
 * user can fix, so it is reported as a KnownError.
 */
export const loadFromFile =
  (...paths: string[]) =>
  () => {
    const fullPath = path.join(...paths);
    const name = path.basename(fullPath);
    let jsonld: string;
    try {
      jsonld = fs.readFileSync(fullPath).toString();
    } catch (err: any) {
      if ("ENOENT" === err?.code) {
        throw new KnownError(`${name} not found`);
      }
      throw err;
    }
    try {
      return JSON.parse(jsonld);
    } catch (err: any) {
      throw new KnownError(`${name} is not valid JSON: ${err.message}`);
    }
  };

export const saveToFile = (fullPath: string) => (person: any) => {
  const jsonld = JSON.stringify(person, null, 2);
  fs.writeFileSync(fullPath, jsonld, {
    flag: "w"
  });
  return person;
};

export const defaults = {
  theme: "minimal",
  fileName: "cv.json"
};
