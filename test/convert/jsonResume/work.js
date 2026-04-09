import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

const filterWork = (item) => item.worksFor["@type"] !== "Project";

export default () =>
  describe("work                ->  worksFor", () => {
    let worksFor;

    beforeEach(async () => {
      const person = await convertHelper();
      worksFor = person.worksFor.filter(filterWork);
      assert.notStrictEqual(worksFor.length, 0);
    });

    test("@type", () => {
      for (var i = 0; i < worksFor.length; i++) {
        assert.strictEqual(worksFor[i]["@type"], "Role");
        assert.strictEqual(worksFor[i].worksFor["@type"], "Organization");
      }
    });

    test("name              ->  worksFor.name", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        assert.notStrictEqual(worksFor[i].worksFor.name, undefined);
        assert.strictEqual(worksFor[i].worksFor.name, jsonresume.work[i].name);
      }
    });

    test("description       ->  description", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (jsonresume.work[i].description) {
          assert.notStrictEqual(
            worksFor[i].description.indexOf(jsonresume.work[i].description),
            -1,
          );
        }
      }
    });

    test("summary           ->  description", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (jsonresume.work[i].summary) {
          assert.notStrictEqual(
            worksFor[i].description.indexOf(jsonresume.work[i].summary),
            -1,
          );
        }
      }
    });

    test("highlights        ->  description", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (jsonresume.work[i].highlights) {
          assert.notStrictEqual(
            worksFor[i].description.indexOf(
              jsonresume.work[i].highlights.join("\n"),
            ),
            -1,
          );
        }
      }
    });

    test("position          ->  roleName", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (
          jsonresume.work[i].startDate ||
          jsonresume.work[i].endDate ||
          jsonresume.work[i].position
        ) {
          assert.strictEqual(worksFor[i].roleName, jsonresume.work[i].position);
        } else {
          assert.strictEqual(worksFor[i].roleName, undefined);
        }
      }
    });

    test("startDate         ->  startDate", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (
          jsonresume.work[i].startDate ||
          jsonresume.work[i].endDate ||
          jsonresume.work[i].position
        ) {
          assert.strictEqual(
            worksFor[i].startDate,
            jsonresume.work[i].startDate,
          );
        } else {
          assert.strictEqual(worksFor[i].startDate, undefined);
        }
      }
    });

    test("endDate           ->  endDate", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        if (
          jsonresume.work[i].startDate ||
          jsonresume.work[i].endDate ||
          jsonresume.work[i].position
        ) {
          assert.strictEqual(worksFor[i].endDate, jsonresume.work[i].endDate);
        } else {
          assert.strictEqual(worksFor[i].endDate, undefined);
        }
      }
    });

    test("location          ->  worksFor.location", () => {
      for (var i = 0; i < jsonresume.work.length; i++) {
        assert.strictEqual(
          worksFor[i].worksFor.location,
          jsonresume.work[i].location,
        );
      }
    });

    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          work: undefined,
        });
        const worksFor = person.worksFor.filter(filterWork);
        assert.strictEqual(worksFor.length, 0);
      });

      test(`handles ${value} highlights`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          work: [
            {
              highlights: undefined,
            },
          ],
        });
        const worksFor = person.worksFor.filter(filterWork);
        assert.strictEqual(worksFor[0].description.length, 0);
      });
    }
  });
