import assert from "node:assert";
import { describe, test } from "node:test";
import Prompt from "../dist/cli/prompt.js";

class FakeReadline {
  constructor(answers = []) {
    this.answers = answers;
    this.questions = [];
    this.closed = false;
  }

  async question(prompt) {
    this.questions.push(prompt);
    return this.answers.shift() ?? "";
  }

  close() {
    this.closed = true;
  }
}

describe("Prompt", () => {
  test("ask returns trimmed answer", async () => {
    const rl = new FakeReadline(["  Hogwarts  "]);
    const prompt = new Prompt(rl);

    const result = await prompt.ask("School");

    assert.equal(result, "Hogwarts");
    assert.deepEqual(rl.questions, ["School: "]);
  });

  test("ask returns default value when user enters empty string", async () => {
    const rl = new FakeReadline([""]);
    const prompt = new Prompt(rl);

    const result = await prompt.ask("School", "Default School");

    assert.equal(result, "Default School");
    assert.deepEqual(rl.questions, ["School (Default School): "]);
  });

  test("ask returns undefined when empty and no default", async () => {
    const rl = new FakeReadline([""]);
    const prompt = new Prompt(rl);

    const result = await prompt.ask("School");

    assert.equal(result, undefined);
  });

  test("close calls underlying readline.close()", () => {
    const rl = new FakeReadline();
    const prompt = new Prompt(rl);

    prompt.close();

    assert.equal(rl.closed, true);
  });
});
