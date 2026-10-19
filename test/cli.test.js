import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";
import help from "../dist/cli/help.js";

const bin = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cli");

describe("bin/cli", () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-cli-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  /** Runs the CLI as a separate process in the throwaway directory; stdin is closed. */
  const run = (...args) =>
    spawnSync(process.execPath, [bin, ...args], { cwd: dir, encoding: "utf8", input: "" });

  for (const args of [[], ["help"], ["-h"], ["--help"]]) {
    it(`prints the help and exits with 0 for "${args.join(" ")}"`, () => {
      const { status, stdout } = run(...args);

      assert.strictEqual(status, 0);
      assert.strictEqual(stdout.trim(), help.trim());
    });
  }

  it("prints only the message of a KnownError and exits with 1", () => {
    const { status, stdout, stderr } = run("set", "nickname", "Henke");

    assert.strictEqual(status, 1);
    assert.strictEqual(stdout, "");
    assert.match(stderr, /^Unknown property "nickname"\. Supported properties: /);
    assert.doesNotMatch(stderr, /\n\s+at /);
  });

  it("exits with 1 for an unexpected error", () => {
    const { status, stderr } = run("normalize", "missing.cv.json");

    assert.strictEqual(status, 1);
    assert.match(stderr, /^Unexpected error:/);
  });

  it("runs a command against the working directory", () => {
    const file = path.join(dir, "cv.json");
    fs.writeFileSync(file, JSON.stringify({ name: "Yoda", jobTitle: "Jedi Master" }));

    const { status } = run("set", "jobTitle", "Grand Master");

    assert.strictEqual(status, 0);
    assert.strictEqual(JSON.parse(fs.readFileSync(file, "utf8")).jobTitle, "Grand Master");
  });
});
