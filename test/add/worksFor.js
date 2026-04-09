import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import addWorksFor from "../../dist/cli/add/worksFor.js";
import FakePrompt from "../prompt.js";

export default () =>
  describe("worksFor", () => {
    const values = {
      name: "Acme Inc.",
      description: "Lorem ipsum dolor sit amet",
      location: "Fantasyland",
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      roleName: "Developer",
    };
    let person;

    beforeEach(async () => {
      person = await addWorksFor({}, new FakePrompt(Object.values(values)));
    });

    describe("wrapper", () => {
      test("@type", () =>
        assert.strictEqual(person.worksFor[0]["@type"], "Role"));
      test("description", () =>
        assert.strictEqual(person.worksFor[0].description, values.description));
      test("roleName", () =>
        assert.strictEqual(person.worksFor[0].roleName, values.roleName));
      test("startDate", () => person.worksFor[0].startDate, values.startDate);
      test("endDate", () => person.worksFor[0].endDate, values.endDate);
    });

    describe("inner", () => {
      test("@type", () =>
        assert.strictEqual(
          person.worksFor[0].worksFor["@type"],
          "Organization",
        ));
      test("name", () =>
        assert.strictEqual(person.worksFor[0].worksFor.name, values.name));
      test("location", () =>
        assert.strictEqual(
          person.worksFor[0].worksFor.location,
          values.location,
        ));
    });

    test("sorted by endDate descending", async () => {
      const person = await addWorksFor(
        {
          worksFor: [
            {
              endDate: "2026-01-01",
              worksFor: {
                name: "My new job",
              },
            },
          ],
        },
        new FakePrompt(Object.values(values)),
      );
      assert.strictEqual(person.worksFor[0].worksFor.name, "My new job");
      assert.strictEqual(person.worksFor[1].worksFor.name, values.name);
    });
  });
