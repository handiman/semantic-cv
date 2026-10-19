import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import addPrompt, { add } from "../dist/cli/add.js";
import FakePrompt from "./prompt.js";

/** Every name `add` accepts and the property it adds to. */
const aliases = [
  ["sameAs", "sameAs"],
  ["skill", "skills"],
  ["skills", "skills"],
  ["competence", "knowsAbout"],
  ["knowsAbout", "knowsAbout"],
  ["language", "knowsLanguage"],
  ["knowsLanguage", "knowsLanguage"],
  ["cert", "hasCertification"],
  ["certification", "hasCertification"],
  ["hasCertification", "hasCertification"],
  ["credential", "hasCredential"],
  ["hasCredential", "hasCredential"],
  ["employer", "worksFor"],
  ["employment", "worksFor"],
  ["work", "worksFor"],
  ["worksFor", "worksFor"],
  ["education", "alumniOf"],
  ["school", "alumniOf"],
  ["alumniOf", "alumniOf"],
  ["lifeEvent", "lifeEvent"],
  ["project", "worksFor"]
];

/** One list of answers that every `add` flow accepts: a URL, text, two dates, then more text. */
const answers = () =>
  new FakePrompt([
    "https://example.com",
    "two",
    "2026-01-01",
    "3036-01-01",
    "five",
    "six",
    "seven"
  ]);

describe("Add dispatch", () => {
  for (const [name, property] of aliases) {
    it(`"${name}" adds to ${property}`, async () => {
      const person = await add(name, answers())({});

      assert.ok(person[property], `expected ${property} to be set`);
      assert.deepStrictEqual(Object.keys(person), [property]);
    });
  }

  it("ignores an unknown property and returns the person unchanged", (t) => {
    const info = t.mock.method(console, "info", () => {});
    const person = { name: "Henrik" };

    assert.strictEqual(add("nickname")(person), person);
    assert.strictEqual(info.mock.calls[0].arguments[0], "nickname ignored.");
  });
});

describe("Add command", () => {
  let dir;
  let file;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-add-"));
    file = path.join(dir, "cv.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("keeps the data in the file when the property is unknown", async (t) => {
    t.mock.method(console, "info", () => {});
    fs.writeFileSync(file, JSON.stringify({ name: "Henrik", jobTitle: "Developer" }));

    await addPrompt(["add", "nickname", file]);

    const person = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.strictEqual(person.name, "Henrik");
    assert.strictEqual(person.jobTitle, "Developer");
  });
});
