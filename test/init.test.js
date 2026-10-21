import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import init from "../dist/cli/init.js";
import FakePrompt from "./prompt.js";

/** Answers for the seven profile questions, in the order `init` asks them. */
const profile = [
  "Yoda",
  "Jedi Master",
  "yoda@example.com",
  "",
  "https://example.com",
  "",
  "Small, green and wise"
];

describe("Init", () => {
  let dir;
  let file;

  beforeEach((t) => {
    // `init` prints a "next steps" guide; keep it out of the test output.
    t.mock.method(console, "log", () => {});
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-init-"));
    file = path.join(dir, "cv.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("writes a normalized Person to the given file", async () => {
    await init(["init", file], new FakePrompt([...profile]));

    const person = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.strictEqual([person["@context"]].flat()[0], "https://schema.org");
    assert.strictEqual(person["@type"], "Person");
    assert.strictEqual(person.name, "Yoda");
    assert.strictEqual(person.jobTitle, "Jedi Master");
    assert.strictEqual(person.description, "Small, green and wise");
  });

  it("leaves out the questions that were left unanswered", async () => {
    await init(["init", file], new FakePrompt([...profile]));

    const person = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.strictEqual("telephone" in person, false);
    assert.strictEqual("image" in person, false);
    assert.strictEqual("worksFor" in person, false);
  });

  it("asks where to write when no file name is given", async () => {
    await init(["init"], new FakePrompt([file, ...profile]));

    assert.strictEqual(JSON.parse(fs.readFileSync(file, "utf8")).name, "Yoda");
  });

  it("keeps an existing file when the user does not confirm the overwrite", async () => {
    fs.writeFileSync(file, '{"name":"Original"}');

    await init(["init", file], new FakePrompt(["n", ...profile]));

    assert.strictEqual(fs.readFileSync(file, "utf8"), '{"name":"Original"}');
  });

  it("asks about the overwrite before the profile questions", async () => {
    fs.writeFileSync(file, '{"name":"Original"}');
    const asked = [];
    const prompt = new FakePrompt(["n"]);
    const ask = prompt.ask.bind(prompt);
    prompt.ask = (question, defaultValue) => {
      asked.push(question);
      return ask(question, defaultValue);
    };

    await init(["init", file], prompt);

    assert.deepStrictEqual(asked, [`${file} already exists. Overwrite it? (y/n)`]);
  });

  it("overwrites an existing file when the user confirms", async () => {
    fs.writeFileSync(file, '{"name":"Original"}');

    await init(["init", file], new FakePrompt(["y", ...profile]));

    assert.strictEqual(JSON.parse(fs.readFileSync(file, "utf8")).name, "Yoda");
  });

  it("closes the prompt", async () => {
    const prompt = new FakePrompt([...profile]);
    let closed = false;
    prompt.close = () => {
      closed = true;
    };

    await init(["init", file], prompt);

    assert.strictEqual(closed, true);
  });
});
