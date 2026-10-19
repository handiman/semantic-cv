import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

const bin = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cli");

describe("A file that can't be used", () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-missing-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  /** Runs the CLI as a separate process in the throwaway directory; stdin is closed. */
  const run = (...args) =>
    spawnSync(process.execPath, [bin, ...args], { cwd: dir, encoding: "utf8", input: "" });

  describe("that does not exist", () => {
    for (const args of [
      ["analyze", "missing.cv.json"],
      ["watch", "missing.cv.json"],
      ["normalize", "missing.cv.json"],
      ["set", "name", "Yoda", "missing.cv.json"],
      ["add", "skills", "missing.cv.json"],
      ["render", "minimal", "missing.cv.json"]
    ]) {
      it(`is reported by "${args[0]}" as a message, not as an unexpected error`, () => {
        const { status, stdout, stderr } = run(...args);

        assert.strictEqual(status, 1);
        assert.strictEqual(stdout, "");
        assert.strictEqual(stderr.trim(), "missing.cv.json not found");
      });
    }

    it("is reported for the default cv.json too", () => {
      const { status, stderr } = run("normalize");

      assert.strictEqual(status, 1);
      assert.strictEqual(stderr.trim(), "cv.json not found");
    });
  });

  describe("that is not valid JSON", () => {
    for (const args of [
      ["normalize"],
      ["set", "name", "Yoda"],
      ["add", "skills"],
      ["render", "minimal"]
    ]) {
      it(`is reported by "${args[0]}" and left untouched`, () => {
        const file = path.join(dir, "cv.json");
        const broken = '{ "name": "Yoda", ';
        fs.writeFileSync(file, broken);

        const { status, stderr } = run(...args);

        assert.strictEqual(status, 1);
        assert.match(stderr, /^cv\.json is not valid JSON: /);
        assert.doesNotMatch(stderr, /\n\s+at /);
        assert.strictEqual(fs.readFileSync(file, "utf8"), broken);
      });
    }
  });
});
