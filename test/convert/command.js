import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { convert } from "../../dist/cli/convert.js";
import FakePrompt from "../prompt.js";

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

    it("rejects a source that is not JSON Resume and writes no file", async () => {
      const output = path.join(dir, "cv.json");

      await assert.rejects(convert(["convert", notJsonResumePath, output]), {
        name: "KnownError",
        message: "Unsupported format"
      });

      assert.strictEqual(fs.existsSync(output), false);
    });

    it("leaves an existing output file alone when the source is not JSON Resume", async () => {
      const output = path.join(dir, "cv.json");
      fs.writeFileSync(output, "mine");

      await assert.rejects(convert(["convert", notJsonResumePath, output], new FakePrompt(["y"])), {
        name: "KnownError"
      });

      assert.strictEqual(fs.readFileSync(output, "utf8"), "mine");
    });

    it("overwrites an existing output file when the answer is y", async () => {
      const output = path.join(dir, "cv.json");
      fs.writeFileSync(output, "mine");

      await convert(["convert", jsonResumePath, output], new FakePrompt(["y"]));

      assert.strictEqual(JSON.parse(fs.readFileSync(output, "utf8")).name, "Henrik Becker");
    });

    it("keeps an existing output file when the answer is not y", async (t) => {
      const output = path.join(dir, "cv.json");
      fs.writeFileSync(output, "mine");
      const log = t.mock.method(console, "log", () => {});

      await convert(["convert", jsonResumePath, output], new FakePrompt(["n"]));

      assert.strictEqual(fs.readFileSync(output, "utf8"), "mine");
      assert.deepStrictEqual(log.mock.calls[0].arguments, ["Aborted. File was not overwritten"]);
    });

    it("asks for the source and the output when they are not given", async () => {
      const output = path.join(dir, "cv.json");

      await convert(["convert"], new FakePrompt([jsonResumePath, output]));

      assert.strictEqual(JSON.parse(fs.readFileSync(output, "utf8")).name, "Henrik Becker");
    });
  });
};
