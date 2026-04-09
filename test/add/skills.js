import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addSkills from "../../dist/cli/add/skills.js";

export default () =>
  describe("skills", () => {
    let person;

    beforeEach(async () => {
      person = await addSkills(
        {
          skills: ["B"],
        },
        new FakePrompt(["A"]),
      );
      assert.strictEqual(person.skills.length, 2);
    });

    for (const value of [null, undefined, "", " ", "\n", "\r", "\t"]) {
      test(`ignores ${"string" === typeof value ? JSON.stringify(value) : value}`, async () => {
        const { skills } = await addSkills({}, new FakePrompt([value]));
        assert.strictEqual(skills, undefined);
      });
    }

    test("skill is appended", () => {
      assert.strictEqual(person.skills[person.skills.length - 1], "A");
    });

    test("skills are not sorted", () => {
      assert.strictEqual(person.skills[0], "B");
      assert.strictEqual(person.skills[1], "A");
    });
  });
