import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import FakePrompt from "../prompt.js";
import addHasCertification from "../../dist/cli/add/hasCertification.js";

export default () =>
  describe("hasCertification", () => {
    const values = {
      name: "New Cert",
      description: "Cert Description",
      issuedBy: "Issuer",
      validFrom: "2026-01-01",
      expires: "3036-01-01",
      logo: "https://www.example.com",
      certificationIdentification: "00:123:456",
    };
    let person;

    beforeEach(async () => {
      person = await addHasCertification(
        {
          hasCertification: [
            {
              name: "Old Cert",
              validFrom: "2025-01-01",
            },
          ],
        },
        new FakePrompt(Object.values(values)),
      );
    });

    for (const [key, value] of Object.entries(values)) {
      test(`${key}`, () => {
        const { hasCertification } = person;
        assert.strictEqual(hasCertification[0][key], value);
      });

      for (const empty of [null, undefined, "", " ", "\n", "\r", "\t"]) {
        test(`ignores ${JSON.stringify(empty)}`, async () => {
          const { hasCertification } = await addHasCertification(
            {
              hasCertification: [],
            },
            new FakePrompt(Object.values(values).map((_) => empty)),
          );
          assert.strictEqual(hasCertification.length, 1);
          assert.strictEqual(hasCertification[0][key], undefined);
        });
      }
    }

    test("sorted by validFrom descending", () => {
      assert.strictEqual(person.hasCertification[0].name, "New Cert");
      assert.strictEqual(person.hasCertification[1].name, "Old Cert");
    });
  });
