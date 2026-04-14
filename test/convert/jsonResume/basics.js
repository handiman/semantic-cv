import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () => {
  describe("basics             ->  .", () => {
    let person;
    beforeEach(async () => {
      person = await convertHelper();
    });

    test("name              ->  name", () => {
      assert.notStrictEqual(person.name, undefined);
      assert.strictEqual(person.name, jsonresume.basics.name);
    });

    test("label             ->  jobTitle", () => {
      assert.notStrictEqual(person.jobTitle, undefined);
      assert.strictEqual(person.jobTitle, jsonresume.basics.label);
    });

    test("image             ->  image", () => {
      assert.notStrictEqual(person.image, undefined);
      assert.strictEqual(person.image, jsonresume.basics.image);
    });

    test("url               ->  url", () => {
      assert.notStrictEqual(person.url, undefined);
      assert.strictEqual(person.url, jsonresume.basics.url);
    });

    test("phone             ->  telephone", () => {
      assert.notStrictEqual(person.telephone, undefined);
      assert.strictEqual(person.telephone, jsonresume.basics.phone);
    });

    test("email             ->  email", () => {
      assert.notStrictEqual(person.email, undefined);
      assert.strictEqual(person.email, jsonresume.basics.email);
    });

    test("summary           ->  description", () => {
      assert.notStrictEqual(person.description, undefined);
      assert.strictEqual(person.description, jsonresume.basics.summary);
    });

    test("profiles          ->  sameAs", () => {
      assert.deepStrictEqual(
        person.sameAs,
        jsonresume.basics.profiles.map((p) => p.url)
      );
      assert.notStrictEqual(person.sameAs, undefined);
      assert.notStrictEqual(person.sameAs.length, 0);
    });

    for (const value of [null, undefined]) {
      test(`handles ${value} profiles`, async () => {
        const { sameAs } = await convertHelper({
          ...jsonresume,
          basics: {
            ...jsonresume.basics,
            profiles: undefined
          }
        });
        assert.strictEqual(sameAs.length, 0);
      });
    }
  });
};
