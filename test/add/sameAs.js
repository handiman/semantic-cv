import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addSameAs from "../../dist/cli/add/sameAs.js";

export default () =>
  describe("sameAs", () => {
    let person;

    beforeEach(async () => {
      person = await addSameAs(
        {
          sameAs: ["https://b.com"]
        },
        new FakePrompt(["https://a.com"])
      );
      assert.strictEqual(person.sameAs.length, 2);
    });

    for (const value of [null, undefined, "", " ", "\n", "\r", "\t", "https/invalid.url"]) {
      test(`ignores invalid url ${"string" === typeof value ? JSON.stringify(value) : value}`, async () => {
        const { sameAs } = await addSameAs({}, new FakePrompt([value]));
        assert.strictEqual(sameAs, undefined);
      });
    }

    test("url is trimmed", async () => {
      const { sameAs } = await addSameAs(
        {},
        new FakePrompt(["\n\r\t https://www.example.com \n\r\t"])
      );
      assert.strictEqual(sameAs[0], "https://www.example.com");
    });

    test("url is appended", () => {
      assert.strictEqual(person.sameAs[person.sameAs.length - 1], "https://a.com");
    });

    test("urls are not sorted", () => {
      assert.strictEqual(person.sameAs[0], "https://b.com");
      assert.strictEqual(person.sameAs[1], "https://a.com");
    });
  });
