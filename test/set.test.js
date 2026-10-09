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
    it("Removes obsolete @theme field", async () => {
      const person = await setProperty(supportedFieldName, themeId)({ "@theme": themeId });
      assert.strictEqual(person["@theme"], undefined);
    });
  }
});

describe("Set unknown property", () => {
  it("throws instead of returning a value that would overwrite the CV", () => {
    const person = { name: "Henrik" };
    assert.throws(() => setProperty("nickname", "Henke")(person), { name: "KnownError" });
    assert.deepStrictEqual(person, { name: "Henrik" });
  });

  for (const [alias, field] of [
    ["website", "url"],
    ["phone", "telephone"],
    ["title", "jobTitle"],
    ["name", "name"]
  ]) {
    it(`${alias} sets ${field}`, () => {
      const person = setProperty(alias, "value")({});
      assert.strictEqual(person[field], "value");
    });
  }
});
