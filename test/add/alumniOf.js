import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import addAlumniOf from "../../dist/cli/add/alumniOf.js";
import FakePrompt from "../prompt.js";

export default () => {
  const values = {
    name: "LHS",
    description: "Livets hårda skola",
    location: "Stockholm",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
  };

  describe("alumniOf", () => {
    let prompt;
    let person;

    beforeEach(async () => {
      prompt = new FakePrompt(Object.values(values));
      person = await addAlumniOf({}, prompt);
    });

    describe("wrapper", () => {
      test("@type", () =>
        assert.strictEqual(person.alumniOf[0]["@type"], "Role"));
      test("description", () =>
        assert.strictEqual(person.alumniOf[0].description, values.description));
      test("startDate", () => person.alumniOf[0].startDate, values.startDate);
      test("endDate", () => person.alumniOf[0].endDate, values.endDate);
    });

    describe("inner", () => {
      test("@type", () =>
        assert.strictEqual(
          person.alumniOf[0].alumniOf["@type"],
          "EducationalOrganization",
        ));
      test("name", () =>
        assert.strictEqual(person.alumniOf[0].alumniOf.name, values.name));
      test("location", () =>
        assert.strictEqual(
          person.alumniOf[0].alumniOf.location,
          values.location,
        ));
    });

    test("sorted by endDate descending", async () => {
      const person = await addAlumniOf(
        {
          alumniOf: [
            {
              startDate: "2025-01-01",
              endDate: "2026-01-01",
              alumniOf: {
                name: "My new school",
              },
            },
          ],
        },
        new FakePrompt([
          values.name,
          values.description,
          values.location,
          values.test,
          values.endDate,
        ]),
      );
      assert.strictEqual(person.alumniOf[0].alumniOf.name, "My new school");
      assert.strictEqual(person.alumniOf[1].alumniOf.name, values.name);
    });
  });
};
