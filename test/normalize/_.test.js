import assert from "node:assert";
import { describe, test } from "node:test";
import {
  toSingle,
  toArray,
  removeUndefined,
  removeNull,
  removeEmpty,
} from "../../dist/core/normalize.js";
import arrayValues from "./arrayValues.js";
import singleValues from "./singleValues.js";
import fixesType from "./fixType.js";
import fixesCasing from "./fixCasing.js";
import sorting from "./sorting.js";
import {
  fixesInvalidContext,
  removesRedundantContexts,
  addsMissingContext,
} from "./fixContext.js";

describe("semantic-cv doctor", () => {
  fixesCasing();
  fixesType();
  fixesInvalidContext();
  removesRedundantContexts();
  addsMissingContext();
  arrayValues();
  singleValues();
  sorting();
  describe("internals", () => {
    test("removeUndefined", () => {
      assert.deepStrictEqual(
        removeUndefined({
          name: "Henrik",
          jobTitle: undefined,
        }),
        {
          name: "Henrik",
        },
      );
    });
    test("removeNull", () => {
      assert.deepStrictEqual(
        removeNull({
          name: "Henrik",
          jobTitle: null,
        }),
        {
          name: "Henrik",
        },
      );
    });
    test("removeEmpty", () => {
      assert.deepStrictEqual(
        removeEmpty({
          name: "Henrik",
          jobTitle: "",
        }),
        {
          name: "Henrik",
        },
      );
    });
    describe("toSingle", () => {
      test("string", () => {
        const single = toSingle(["Hello", "World!"]);
        assert.strictEqual(single, "Hello");
      });
      test("object", () => {
        const single = toSingle([
          { "@type": "Person", name: "Henrik" },
          { "@type": "Person", name: "Becker" },
        ]);
        assert.deepStrictEqual(single, { "@type": "Person", name: "Henrik" });
      });
    });
    describe("toArray", () => {
      test("string", () => {
        assert.deepStrictEqual(toArray("Henrik"), ["Henrik"]);
      });
      test("object", () => {
        assert.deepStrictEqual(toArray({ name: "Henrik " }), [
          { name: "Henrik " },
        ]);
      });
    });
  });
});
