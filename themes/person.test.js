import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { parseTemplate } from "./theme.test.js";

describe("Person", () => {
  let Person;

  function singleItem(name) {
    describe(name, () => {
      it(`returns the first item if person.${name} is an array`, () => {
        const person = new Person({
          [name]: ["Value 1", "Value 2"],
        });
        assert.strictEqual(person[name], "Value 1");
      });
      it(`returns the value if person.${name} is a string`, () => {
        const person = new Person({
          [name]: "Single Value",
        });
        assert.strictEqual(person[name], "Single Value");
      });
    });
  }

  function array(name) {
    describe(name, () => {
      it(`returns the value if person.${name} is an array`, () => {
        const expected = ["Value 1", "Value 2"];
        const person = new Person({
          [name]: ["Value 1", "Value 2"],
        });
        assert.deepStrictEqual(person[name], expected);
      });
      it(`returns an array with one item of person.${name} is not an array`, () => {
        const person = new Person({
          [name]: "Single Value",
        });
        assert.strictEqual(person[name].length, 1);
        assert.deepStrictEqual(person[name][0], "Single Value");
      });
    });
  }

  beforeEach(() => {
    Person = parseTemplate().window.Person;
  });

  describe(singleItem("name"));
  describe(singleItem("jobTitle"));
  describe(singleItem("description"));
  describe(singleItem("image"));
  describe(singleItem("url"));
  describe(singleItem("email"));
  describe(singleItem("telephone"));
  describe(array("sameAs"));
  describe(array("alumniOf"));
  describe(array("worksFor"));
  describe(array("hasCertification"));
  describe(array("hasCredential"));
  describe(array("knowsLanguage"));
  describe(array("knowsAbout"));
  describe(array("skills"));
  describe(array("lifeEvent"));
});
