import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import addLifeEvent from "../../dist/cli/add/lifeEvent.js";
import FakePrompt from "../prompt.js";

export default () =>
  describe("lifeEvent", () => {
    const values = {
      name: "Married",
      description: ":)",
      startDate: "2023-06-10",
    };
    let person;
    beforeEach(async () => {
      person = await addLifeEvent(
        {
          lifeEvent: [
            {
              ["@type"]: "Event",
              name: "Born",
              startDate: "1969-06-23",
              description: "Whaaaa!",
            },
          ],
        },
        new FakePrompt(Object.values(values)),
      );
    });

    test("@type is set to \"Event\"", () => {
      const { lifeEvent } = person;
      for (const event of lifeEvent) {
        assert.strictEqual(event["@type"], "Event");
      }
    });

    for (const [key, value] of Object.entries(values)) {
      test(`${key}`, () => {
        const { lifeEvent } = person;
        assert.strictEqual(lifeEvent[0][key], value);
      });

      for (const nullOrUndefined of [null, undefined]) {
        test(`${key}: ${nullOrUndefined} becomes ${undefined}`, async () => {
          const { lifeEvent } = await addLifeEvent(
            {},
            new FakePrompt([nullOrUndefined, nullOrUndefined, nullOrUndefined]),
          );
          assert.strictEqual(lifeEvent[0][key], undefined);
        });
      }
    }

    test("sorted by startDate descending", () => {
      const { lifeEvent } = person;
      assert.strictEqual(lifeEvent[0].name, "Married");
      assert.strictEqual(lifeEvent[1].name, "Born");
    });
  });
