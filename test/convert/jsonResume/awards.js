import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

export default () =>
  describe("awards              ->  lifeEvent", () => {
    let person;

    beforeEach(async () => {
      person = await convertHelper();
      assert.notStrictEqual(person.lifeEvent.length, 0);
    });
    
    test("@type", () => {
      for (var i = 0; i < jsonresume.awards.length; i++) {
        assert.strictEqual(person.lifeEvent[i]["@type"], "Event");
      }
    });
    
    test("title             ->  name", () => {
      for (var i = 0; i < jsonresume.awards.length; i++) {
        assert.strictEqual(
          person.lifeEvent[i].name,
          jsonresume.awards[i].title,
        );
      }
    });
    
    test("date              ->  startDate", () => {
      for (var i = 0; i < jsonresume.awards.length; i++) {
        assert.strictEqual(
          person.lifeEvent[i].startDate,
          jsonresume.awards[i].date,
        );
      }
    });
    
    test("summary           ->  description", () => {
      for (var i = 0; i < jsonresume.awards.length; i++) {
        assert.strictEqual(
          person.lifeEvent[i].description,
          jsonresume.awards[i].summary,
        );
      }
    });
    
    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const { lifeEvent } = await convertHelper({
          ...jsonresume,
          awards: undefined,
        });
        assert.strictEqual(lifeEvent.length, 0);
      });
    }
  });
