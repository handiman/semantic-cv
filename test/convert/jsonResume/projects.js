import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { convertHelper } from "./jsonResume.js";
import jsonresume from "./jsonResume.json" with { type: "json" };

const filterProjects = (item) => item.worksFor["@type"] === "Project";

export default () => {
  describe("projects            ->  worksFor", () => {
    let projects;

    beforeEach(async () => {
      const person = await convertHelper();
      projects = person.worksFor.filter(filterProjects);
      assert.notStrictEqual(projects.length, 0);
    });

    test("@type", () => {
      for (var i = 0; i < projects.length; i++) {
        assert.strictEqual(projects[i]["@type"], "Role");
      }
    });

    test("name", () => {
      for (var i = 0; i < projects.length; i++) {
        assert.strictEqual(projects[i].worksFor.name, jsonresume.projects[i].name);
      }
    });

    test("startDate", () => {
      for (var i = 0; i < projects.length; i++) {
        assert.strictEqual(projects[i].startDate, jsonresume.projects[i].startDate);
      }
    });

    test("endDate", () => {
      for (var i = 0; i < projects.length; i++) {
        assert.strictEqual(projects[i].endDate, jsonresume.projects[i].endDate);
      }
    });

    test("description       ->  description", () => {
      for (var i = 0; i < jsonresume.projects.length; i++) {
        if (jsonresume.projects[i].description) {
          assert.notStrictEqual(
            projects[i].description.indexOf(jsonresume.woprojectsk[i].description),
            -1
          );
        }
      }
    });

    test("highlights        ->  description", () => {
      for (var i = 0; i < jsonresume.projects.length; i++) {
        if (jsonresume.projects[i].highlights) {
          assert.notStrictEqual(
            projects[i].description.indexOf(jsonresume.projects[i].highlights.join("\n")),
            -1
          );
        }
      }
    });

    test("url", () => {
      for (var i = 0; i < projects.length; i++) {
        assert.strictEqual(projects[i].worksFor.url, jsonresume.projects[i].url);
      }
    });

    for (const value of [null, undefined]) {
      test(`handles ${value}`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          projects: value
        });
        const projects = person.worksFor.filter(filterProjects);
        assert.strictEqual(projects.length, 0);
      });

      test(`handles ${value} highlights`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          projects: [
            {
              description: "Hi",
              highlights: undefined
            }
          ]
        });
        const projects = person.worksFor.filter(filterProjects);
        assert.strictEqual(projects[0].description, "Hi");
      });

      test(`handles ${value} description`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          projects: [
            {
              description: value,
              highlights: ["Hi"]
            }
          ]
        });
        const projects = person.worksFor.filter(filterProjects);
        assert.strictEqual(projects[0].description, "Hi");
      });

      test(`handles ${value} description and hightlights`, async () => {
        const person = await convertHelper({
          ...jsonresume,
          projects: [
            {
              description: value,
              highlights: value
            }
          ]
        });
        const projects = person.worksFor.filter(filterProjects);
        assert.strictEqual(projects[0].description, "");
      });
    }
  });
};
