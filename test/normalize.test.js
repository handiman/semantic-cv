import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import normalize from "../dist/cli/normalize.js";

describe("Normalize command", () => {
  let dir;
  let file;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-normalize-"));
    file = path.join(dir, "cv.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("normalizes the file in place", async () => {
    fs.writeFileSync(
      file,
      JSON.stringify({ "@type": "person", name: "Yoda", jobTitle: "Jedi Master", skills: [] })
    );

    await normalize(["normalize", file]);

    const person = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.strictEqual(person["@type"], "Person");
    assert.strictEqual(person.name, "Yoda");
    assert.strictEqual("skills" in person, false);
  });

  it("trims surrounding whitespace from strings", async () => {
    fs.writeFileSync(
      file,
      JSON.stringify({ name: "  Yoda  ", jobTitle: "Jedi Master\n", skills: [" The Force "] })
    );

    await normalize(["normalize", file]);

    const person = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.strictEqual(person.name, "Yoda");
    assert.strictEqual(person.jobTitle, "Jedi Master");
    assert.deepStrictEqual(person.skills, ["The Force"]);
  });

  it("is idempotent", async () => {
    fs.writeFileSync(file, JSON.stringify({ name: "Yoda", jobTitle: "Jedi Master" }));

    await normalize(["normalize", file]);
    const once = fs.readFileSync(file, "utf8");
    await normalize(["normalize", file]);

    assert.strictEqual(fs.readFileSync(file, "utf8"), once);
  });

  it("leaves a file that is not valid JSON untouched", async () => {
    const broken = '{ "name": "Yoda", ';
    fs.writeFileSync(file, broken);

    await assert.rejects(normalize(["normalize", file]));

    assert.strictEqual(fs.readFileSync(file, "utf8"), broken);
  });

  it("does not create a file that does not exist", async () => {
    await assert.rejects(normalize(["normalize", file]));

    assert.strictEqual(fs.existsSync(file), false);
  });
});
