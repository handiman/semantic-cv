import assert from "assert";
import { describe, it } from "node:test";
import { setProperty } from "../dist/cli/set.js";

describe("Set", () => {
  const themeId = "lena";

  /* Keeping support for @theme for backwards compatibility */
  for (const supportedFieldName of ["theme", "@theme"]) {
    it(supportedFieldName, async () => {
      const person = await setProperty(supportedFieldName, themeId)({});
      assert.deepStrictEqual(person["theme"], {
        "@type": "Theme",
        name: themeId
      });
    });
    it("Removes obsole @theme field", async () => {
      const person = await setProperty(supportedFieldName, themeId)({ "@theme": themeId });
      assert.strictEqual(person["@theme"], undefined);
    });
  }
});
