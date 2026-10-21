import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import normalize from "../dist/core/normalize.js";
import { renderHTML } from "../dist/core/render/html.js";
import ThemeLoader from "../dist/themes/themeLoader.js";
import renderFile, { NodeTransformer, loadAsset } from "../dist/cli/render.js";

describe("Render", () => {
  it(`Removes SemanticCV vocab from <script type="application/ld+json">`, async () => {
    const transformer = new NodeTransformer();
    const loader = new ThemeLoader(transformer, loadAsset);
    const person = normalize({
      name: "Yoda",
      theme: "minimal"
    });
    const theme = loader.loadTheme(person.theme);
    const html = await renderHTML({
      person,
      theme,
      transformer
    });
    const { window } = new JSDOM(html, {
      runScripts: "outside-only",
      resources: "usable",
      pretendToBeVisual: false
    });
    const { document } = window;
    const script = document.querySelector(`script[type="application/ld+json"]`);
    assert.deepStrictEqual(JSON.parse(script.textContent), {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Yoda"
    });
  });
});

describe("Render command", () => {
  let dir;
  let file;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "semantic-cv-render-"));
    file = path.join(dir, "cv.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const writeCv = (person) =>
    fs.writeFileSync(file, JSON.stringify({ name: "Yoda", jobTitle: "Jedi Master", ...person }));

  it("writes an HTML file and an ATS text file next to the CV", async () => {
    writeCv({});

    await renderFile(["render", "minimal", file]);

    assert.ok(fs.readFileSync(`${file}.html`, "utf8").includes("Yoda"));
    assert.ok(fs.readFileSync(`${file}.txt`, "utf8").includes("Yoda"));
  });

  it("links the HTML to the text file", async () => {
    writeCv({});

    await renderFile(["render", "minimal", file]);

    const html = fs.readFileSync(`${file}.html`, "utf8");
    assert.ok(
      html.includes(
        `<link rel="alternate" type="text/plain" title="ATS-Friendly CV" href="${file}.txt" />`
      )
    );
  });

  it("uses the theme named in the CV when none is given", async () => {
    writeCv({ theme: "typewriter" });

    await renderFile(["render", undefined, file]);

    const html = fs.readFileSync(`${file}.html`, "utf8");
    assert.ok(html.includes('<meta name="semanticcv:theme" content="typewriter"'));
  });

  it("prefers the theme argument over the one in the CV", async () => {
    writeCv({ theme: "typewriter" });

    await renderFile(["render", "minimal", file]);

    const html = fs.readFileSync(`${file}.html`, "utf8");
    assert.ok(html.includes('<meta name="semanticcv:theme" content="minimal"'));
  });

  it("reports a missing CV without writing anything", async () => {
    await assert.rejects(renderFile(["render", "minimal", file]), { name: "KnownError" });

    assert.deepStrictEqual(fs.readdirSync(dir), []);
  });

  it("warns about an unknown theme, lists the available ones and renders with minimal", async (t) => {
    writeCv({});
    const warn = t.mock.method(console, "warn", () => {});

    await renderFile(["render", "henrik.cv.json", file]);

    assert.match(
      warn.mock.calls[0].arguments[0],
      /Unknown theme "henrik.cv.json", using "minimal". Available themes: .*typewriter/
    );
    const html = fs.readFileSync(`${file}.html`, "utf8");
    assert.ok(html.includes('<meta name="semanticcv:theme" content="minimal"'));
  });

  it("warns about an unknown theme named in the CV", async (t) => {
    writeCv({ theme: "nonexistent" });
    const warn = t.mock.method(console, "warn", () => {});

    await renderFile(["render", undefined, file]);

    assert.match(warn.mock.calls[0].arguments[0], /Unknown theme "nonexistent"/);
  });

  it("does not warn about a known theme", async (t) => {
    writeCv({ theme: "typewriter" });
    const warn = t.mock.method(console, "warn", () => {});

    await renderFile(["render", undefined, file]);

    assert.strictEqual(warn.mock.callCount(), 0);
  });
});
