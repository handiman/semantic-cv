import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

const bin = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cli");

const valid = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yoda",
  jobTitle: "Jedi Master",
  description: "Small, green and wise"
};

describe("Analyze command", () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-analyze-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const write = (name, person) => {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(person));
  };

  /** Runs `analyze` as a separate process in the throwaway directory. */
  const analyze = (...args) =>
    spawnSync(process.execPath, [bin, "analyze", ...args], { cwd: dir, encoding: "utf8" });

  it("analyzes cv.json in the working directory by default", () => {
    write("cv.json", valid);

    const { status, stdout } = analyze();

    assert.strictEqual(status, 0);
    assert.match(stdout, /cv\.json\r?\n {2}✔/);
  });

  it("reports the fields that are missing", () => {
    write("cv.json", { "@type": "Person", name: "Yoda" });

    const { stdout } = analyze();

    assert.match(stdout, /"jobTitle":\r?\n {4}- Field is mandatory/);
    assert.match(stdout, /"description":\r?\n {4}- Field is mandatory/);
    assert.doesNotMatch(stdout, /"name":/);
  });

  it("analyzes a single file given by name", () => {
    write("henrik.cv.json", valid);

    const { stdout } = analyze("henrik.cv.json");

    assert.match(stdout, /henrik\.cv\.json\r?\n {2}✔/);
  });

  it("analyzes every *.cv.json below a directory and nothing else", () => {
    write("cvs/a.cv.json", valid);
    write("cvs/deeper/b.cv.json", valid);
    write("cvs/notes.json", {});

    const { stdout } = analyze("cvs");

    assert.match(stdout, /a\.cv\.json/);
    assert.match(stdout, /b\.cv\.json/);
    assert.doesNotMatch(stdout, /notes\.json/);
  });
});
