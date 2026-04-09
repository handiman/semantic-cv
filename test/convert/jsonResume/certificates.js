import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () =>
  describe("certificates        ->  hasCertification", () => {
    let person;

    beforeEach(async () => {
      person = await convertHelper();
      assert.notStrictEqual(person.hasCertification.length, 0);
    });

    test("name              ->  name", () => {
      for (var i = 0; i < jsonresume.certificates.length; i++) {
        assert.strictEqual(
          person.hasCertification[i].name,
          jsonresume.certificates[i].name,
        );
      }
    });

    test("issuer            ->  issuedBy", () => {
      for (var i = 0; i < jsonresume.certificates.length; i++) {
        assert.strictEqual(
          person.hasCertification[i].issuedBy,
          jsonresume.certificates[i].issuer,
        );
      }
    });

    test("date              ->  validFrom", () => {
      for (var i = 0; i < jsonresume.certificates.length; i++) {
        assert.strictEqual(
          person.hasCertification[i].validFrom,
          jsonresume.certificates[i].date,
        );
      }
    });

    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const { hasCertification } = await convertHelper({
          ...jsonresume,
          certificates: undefined,
        });
        assert.strictEqual(hasCertification.length, 0);
      });
    }
  });
