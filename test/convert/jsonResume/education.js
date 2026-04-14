import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () =>
  describe("education           ->  alumniOf", () => {
    let person;
    beforeEach(async () => {
      person = await convertHelper();
      assert.notStrictEqual(person.alumniOf.length, 0);
    });
    test("@type", () => {
      for (var i = 0; i < person.alumniOf.length; i++) {
        assert.strictEqual(person.alumniOf[i]["@type"], "Role");
        assert.strictEqual(person.alumniOf[i].alumniOf["@type"], "EducationalOrganization");
      }
    });
    test("institution       ->  alumniOf.name", () => {
      for (var i = 0; i < jsonresume.education.length; i++) {
        assert.strictEqual(person.alumniOf[i].alumniOf.name, jsonresume.education[i].institution);
      }
    });
    test("area              ->  description", () => {
      for (var i = 0; i < jsonresume.education.length; i++) {
        assert.strictEqual(person.alumniOf[i].description, jsonresume.education[i].area);
      }
    });
    test("startDate         ->  startDate", () => {
      for (var i = 0; i < jsonresume.education.length; i++) {
        if (jsonresume.education[i].startDate || jsonresume.education[i].endDate) {
          assert.strictEqual(person.alumniOf[i].startDate, jsonresume.education[i].startDate);
        } else {
          assert.strictEqual(person.alumniOf[i].startDate, undefined);
        }
      }
    });
    test("endDate           ->  endDate", () => {
      for (var i = 0; i < jsonresume.education.length; i++) {
        if (jsonresume.education[i].startDate || jsonresume.education[i].endDate) {
          assert.strictEqual(person.alumniOf[i].endDate, jsonresume.education[i].endDate);
        } else {
          assert.strictEqual(person.alumniOf[i].endDate, undefined);
        }
      }
    });
    test("location          ->  worksFor.location", () => {
      for (var i = 0; i < jsonresume.education.length; i++) {
        assert.strictEqual(person.alumniOf[i].alumniOf.location, jsonresume.education[i].location);
      }
    });

    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const { alumniOf } = await convertHelper({
          ...jsonresume,
          education: undefined
        });
        assert.strictEqual(alumniOf.length, 0);
      });
    }
  });
