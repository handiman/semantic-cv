import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { convert } from "../../dist/cli/convert.js";

const jsonResumePath = "test/convert/jsonResume/jsonResume.json";
const notJsonResumePath = "test/convert/notJsonResume.json";

export default () => {
  describe("command", () => {
    let dir;

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-convert-"));
    });

    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it("writes a normalized Person to the output file", async () => {
      const output = path.join(dir, "cv.json");

      await convert(["convert", jsonResumePath, output]);

      const person = JSON.parse(fs.readFileSync(output, "utf8"));
      assert.strictEqual(person["@type"], "Person");
      assert.strictEqual(person.name, "Henrik Becker");
    });

    it("says the format is unsupported and writes no file for a source that is not JSON Resume", async (t) => {
      const output = path.join(dir, "cv.json");
      const info = t.mock.method(console, "info", () => {});

      await convert(["convert", notJsonResumePath, output]);

      assert.deepStrictEqual(info.mock.calls[0].arguments, ["Unsupported format"]);
      assert.strictEqual(fs.existsSync(output), false);
    });
  });
};
