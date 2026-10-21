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

  it("reports an unknown command and exits with 1 instead of printing the help", () => {
    const { status, stdout, stderr } = run("frobnicate");

    assert.strictEqual(status, 1);
    assert.strictEqual(stdout, "");
    assert.match(stderr, /Unknown command "frobnicate". Run "semantic-cv help"/);
  });

  for (const flag of ["-v", "--version"]) {
    it(`prints the version from package.json and exits with 0 for "${flag}"`, () => {
      const { version } = JSON.parse(
        fs.readFileSync(path.join(bin, "..", "..", "package.json"), "utf8")
      );

      const { status, stdout } = run(flag);

      assert.strictEqual(status, 0);
      assert.strictEqual(stdout.trim(), version);
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
    // A directory where a CV file should be is not something the user is told how to fix.
    const { status, stderr } = run("normalize", ".");

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
