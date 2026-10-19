import assert from "assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { set, setProperty } from "../dist/cli/set.js";

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

describe("Set command", () => {
  let dir;
  let file;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-set-"));
    file = path.join(dir, "cv.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const read = () => JSON.parse(fs.readFileSync(file, "utf8"));

  it("sets the property and keeps the rest of the file", async () => {
    fs.writeFileSync(file, JSON.stringify({ name: "Henrik", jobTitle: "Developer" }));

    await set(["set", "jobTitle", "Architect", file]);

    assert.strictEqual(read().jobTitle, "Architect");
    assert.strictEqual(read().name, "Henrik");
  });

  it("writes an alias to the field it stands for", async () => {
    fs.writeFileSync(file, JSON.stringify({ name: "Henrik" }));

    await set(["set", "website", "https://example.com", file]);

    assert.strictEqual(read().url, "https://example.com");
    assert.strictEqual("website" in read(), false);
  });

  it("leaves the file untouched for an unknown property", async () => {
    const original = JSON.stringify({ name: "Henrik" });
    fs.writeFileSync(file, original);

    await assert.rejects(set(["set", "nickname", "Henke", file]), { name: "KnownError" });

    assert.strictEqual(fs.readFileSync(file, "utf8"), original);
  });

  it("does not create a file that does not exist", async () => {
    await assert.rejects(set(["set", "name", "Henrik", file]));

    assert.strictEqual(fs.existsSync(file), false);
  });
});
