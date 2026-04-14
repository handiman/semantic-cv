import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () => {
  describe("skills              ->  .", () => {
    let person;
    beforeEach(async () => {
      person = await convertHelper();
    });

    test("name              ->  knowsAbout", () => {
      assert.deepStrictEqual(
        person.knowsAbout,
        jsonresume.skills.map((skill) => skill.name)
      );
      assert.notStrictEqual(person.knowsAbout, undefined);
      assert.notStrictEqual(person.knowsAbout.length, 0);
    });

    test("keywords          ->  skills", () => {
      assert.deepStrictEqual(person.skills, [
        ...new Set(jsonresume.skills.flatMap((skill) => skill.keywords ?? []))
      ]);
      assert.notStrictEqual(person.skills, undefined);
      assert.notStrictEqual(person.skills.length, 0);
    });

    for (const value of [null, undefined]) {
      test(`handles ${value} skills`, async () => {
        const { skills, knowsAbout } = await convertHelper({
          ...jsonresume,
          skills: undefined
        });
        assert.strictEqual(skills.length, 0);
        assert.strictEqual(knowsAbout.length, 0);
      });

      test(`handles ${value} keywords`, async () => {
        const { skills, knowsAbout } = await convertHelper({
          ...jsonresume,
          skills: [
            {
              name: "Something"
            }
          ]
        });
        assert.strictEqual(knowsAbout[0], "Something");
        assert.strictEqual(skills.length, 0);
      });
    }
  });
};
