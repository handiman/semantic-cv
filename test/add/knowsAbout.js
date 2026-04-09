import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addKnowsAbout from "../../dist/cli/add/knowsAbout.js";

export default () =>
  describe("knowsAbout", () => {
    let person;

    beforeEach(async () => {
      person = await addKnowsAbout(
        {
          knowsAbout: [".Not"],
        },
        new FakePrompt([".Net"]),
      );
      assert.strictEqual(person.knowsAbout.length, 2);
    });

    for (const value of [null, undefined, "", " ", "\n", "\r", "\t"]) {
      test(`ignores ${"string" === typeof value ? JSON.stringify(value) : value}`, async () => {
        const { knowsAbout } = await addKnowsAbout(
          {},
          new FakePrompt([value]),
        );
        assert.strictEqual(knowsAbout, undefined);
      });
    }

    test("item is appended", () => {
      const { knowsAbout } = person;
      assert.strictEqual(person.knowsAbout[knowsAbout.length - 1], ".Net");
    });

    test("items are not sorted", () => {
      const { knowsAbout } = person;
      assert.strictEqual(knowsAbout[0], ".Not");
      assert.strictEqual(knowsAbout[1], ".Net");
    });
  });
