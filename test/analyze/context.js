import assert from "node:assert";
import { it } from "node:test";
import analyze, { Success } from "../../dist/core/analyze.js";

export default function () {
  const fieldName = "@context";

  it("must be present", () => {
    const results = analyze(JSON.stringify({}));
    assert.notDeepStrictEqual(results[fieldName], Success);
  });

  it('must be "https://schema.org"', () => {
    const results = analyze(
      JSON.stringify({
        "@context": "https://schema.org"
      })
    );
    assert.deepStrictEqual(results[fieldName], Success);
  });

  it('must not be anything but "https://schema.org"', () => {
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
  });
}
