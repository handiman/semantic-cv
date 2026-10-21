import fs from "node:fs";

/**
 * CLI command for printing the installed version of semantic-cv.
 *
 * Reads the version from the package.json that ships with the package, so
 * it can't drift from what was published.
 */
export async function version() {
  const packageJson = new URL("../../package.json", import.meta.url);
  console.log(JSON.parse(fs.readFileSync(packageJson, "utf8")).version);
}

export default version;
