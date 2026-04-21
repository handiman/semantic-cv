import assert from "node:assert";
import { it } from "node:test";
import analyze, { Success } from "../../dist/core/analyze.js";

export default function () {
  const fieldName = "@context";

  it("must be present", () => {
    const results = analyze(JSON.stringify({}));
    assert.notDeepStrictEqual(results[fieldName], Success);
  });

  /**
   * Semantic-cv 0.1.* version that didn't have its own vocab.
   */
  it('can be "https://schema.org"', () => {
    const results = analyze(
      JSON.stringify({
        "@context": "https://schema.org"
      })
    );
    assert.deepStrictEqual(results[fieldName], Success);
  });

  for (const version of ["latest", "1.0"]) {
    it(`can be  ["https://schema.org/Person", "https://semantic.cv/${version}.jsonld" ]`, () => {
      const results = analyze(
        JSON.stringify({
          "@context": [`https://schema.org/Person`, `https://semantic.cv/${version}.jsonld`]
        })
      );
      assert.deepStrictEqual(results[fieldName], Success);
    });
  }

  /*it('must not be anything but "https://schema.org"', () => {
    for (const attemptedValue of [
      "",
      "  ",
      null,
      undefined,
      "s",
      " http://schema.org ",
      "HTTP://SCHEMA.ORG",
      "https://schema.or"
    ]) {
      const results = analyze(
        JSON.stringify({
          "@context": attemptedValue
        })
      );
      assert.notDeepStrictEqual(results[fieldName], Success);
    }
  });*/
}
