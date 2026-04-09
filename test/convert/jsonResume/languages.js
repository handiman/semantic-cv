import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () => {
  describe("languages           ->  .", () => {
    let person;
    beforeEach(async () => {
      person = await convertHelper();
    });

    test("languages         ->  knowsLanguage", () => {
      assert.deepStrictEqual(
        person.knowsLanguage,
        jsonresume.languages.map((language) => language.language),
      );
      assert.notStrictEqual(person.knowsLanguage, undefined);
      assert.notStrictEqual(person.knowsLanguage.length, 0);
    });

    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const { knowsLanguage } = await convertHelper({
          ...jsonresume,
          languages: undefined,
        });
        assert.strictEqual(knowsLanguage.length, 0);
      });
    }
  });
};
