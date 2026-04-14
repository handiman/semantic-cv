import assert from "node:assert";
import { describe, test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import context from "./context.js";
import typ from "./type.js";
import name from "./name.js";
import description from "./description.js";
import jobTitle from "./jobTitle.js";
import sameAs from "./sameAs.js";
import knowsAbout from "./knowsAbout.js";
import skills from "./skills.js";
import url from "./url.js";
import image from "./image.js";
import { analyzeFile, analyzeDirectory } from "../../dist/core/analyze.js";

const readAll = async (reader) => {
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += value;
  }
  return result;
};

const createValidFile = (file) => {
  fs.writeFileSync(
    file,
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Yoda",
      jobTitle: "Jedi Master",
      description: "Judge me by my size?"
    })
  );
};

describe("semantic-cv analyze", () => {
  describe("Mandatory fields", () => {
    describe("@context", context);
    describe("@type", typ);
    describe("name", name);
    describe("description", description);
    describe("jobTitle", jobTitle);
  });

  describe("Optional fields", () => {
    describe("sameAs", sameAs);
    describe("knowsAbout", knowsAbout);
    describe("skills", skills);
    describe("url", url);
    describe("image", image);
  });

  describe("Analyze Directory", async () => {
    test("with valid file", async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "myapp-"));
      const file = path.join(dir, `${crypto.randomUUID()}.cv.json`);
      try {
        createValidFile(file);
        const { writable, readable } = new TransformStream();

        const writer = writable.getWriter();
        await analyzeDirectory(dir, writer);
        writer.close();

        const result = await readAll(readable.getReader());
        assert.strictEqual(result.includes("✔"), true);
      } finally {
        if (fs.existsSync(file)) {
          fs.rmSync(file);
        }
        if (fs.existsSync(dir)) {
          fs.rmdirSync(dir);
        }
      }
    });
  });

  describe("Analyze File", () => {
    test("with valid file", async () => {
      const file = path.join(os.tmpdir(), `${crypto.randomUUID()}.cv.json`);
      try {
        createValidFile(file);
        const { writable, readable } = new TransformStream();

        const writer = writable.getWriter();
        await analyzeFile(file, writer);
        writer.close();

        const result = await readAll(readable.getReader());
        assert.strictEqual(result.includes("✔"), true);
      } finally {
        if (fs.existsSync(file)) {
          fs.rmSync(file);
        }
      }
    });
  });
});
