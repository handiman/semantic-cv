import assert from "node:assert";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import normalize from "../dist/core/normalize.js";
import { renderHTML } from "../dist/core/render/html.js";
import ThemeLoader from "../dist/themes/themeLoader.js";
import { NodeTransformer, loadAsset } from "../dist/cli/render.js";

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
