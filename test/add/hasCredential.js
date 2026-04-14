import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addHasCredential from "../../dist/cli/add/hasCredential.js";

export default () =>
  describe("hasCredential", () => {
    const values = {
      name: "New Credential",
      description: "Description",
      datePublished: "2026-01-01",
      expires: "3036-01-01",
      image: "Logo"
    };
    let person;

    beforeEach(async () => {
      person = await addHasCredential(
        {
          hasCredential: [
            {
              name: "Old Credential",
              datePublished: "2025-01-01"
            }
          ]
        },
        new FakePrompt(Object.values(values))
      );
    });

    for (const [key, value] of Object.entries(values)) {
      test(`${key}`, () => {
        const { hasCredential } = person;
        assert.strictEqual(hasCredential[0][key], value);
      });

      for (const empty of [null, undefined, "", " ", "\n", "\r", "\t"]) {
        test(`ignores ${JSON.stringify(empty)}`, async () => {
          const { hasCredential } = await addHasCredential(
            {
              hasCredential: []
            },
            new FakePrompt(Object.values(values).map((_) => empty))
          );
          assert.strictEqual(hasCredential.length, 1);
          assert.strictEqual(hasCredential[0][key], undefined);
        });
      }
    }

    test("sorted by datePublished descending", () => {
      const { hasCredential } = person;
      assert.strictEqual(hasCredential[0].name, "New Credential");
      assert.strictEqual(hasCredential[1].name, "Old Credential");
    });
  });
