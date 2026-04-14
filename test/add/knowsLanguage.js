import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addKnowsLanguage from "../../dist/cli/add/knowsLanguage.js";
import knowsLanguage from "../../dist/cli/add/knowsLanguage.js";

export default () =>
  describe("knowsLanguage", () => {
    let person;
    beforeEach(async () => {
      person = await addKnowsLanguage(
        {
          knowsLanguage: ["B-ish"]
        },
        new FakePrompt(["A-ish"])
      );
      assert.strictEqual(person.knowsLanguage.length, 2);
    });

    for (const value of [null, undefined, "", " ", "\n", "\r", "\t"]) {
      test(`ignores ${"string" === typeof value ? JSON.stringify(value) : value}`, async () => {
        const { knowsLanguage } = await addKnowsLanguage({}, new FakePrompt([value]));
        assert.strictEqual(knowsLanguage, undefined);
      });
    }

    test("language is appended", () => {
      assert.strictEqual(person.knowsLanguage[person.knowsLanguage.length - 1], "A-ish");
    });

    test("languages are not sorted", () => {
      assert.strict(person.knowsLanguage[0], "B-ish");
      assert.strict(person.knowsLanguage[1], "A-ish");
    });
  });
