import fs from "node:fs";
import path from "node:path";
import { KnownError } from "./error.js";

/**
 * Throw a KnownError if `fullPath` doesn't exist, so a mistyped file name is
 * reported as a message instead of an "Unexpected error" with a stack trace.
 */
export const assertExists = (fullPath: string) => {
  if (!fs.existsSync(fullPath)) {
    throw new KnownError(`${path.basename(fullPath)} not found`);
  }
};
