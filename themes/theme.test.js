import fs from "node:fs";
import path from "node:path";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";

function findTemplate() {
  for (const potentialPath of [
    path.join(process.cwd(), "template.html"),
    path.join(process.cwd(), "themes/template.html"),
    path.join(process.cwd(), "src/themes/template.html"),
  ]) {
    if (fs.existsSync(potentialPath)) {
      return potentialPath;
    }
  }
}

export function parseTemplate() {
  const template = fs
    .readFileSync(findTemplate())
    .toString()
    .replaceAll("{{js}}", "")
    .replaceAll("{{css}}", "");
  const dom = new JSDOM(template, {
    runScripts: "dangerously",
    resources: "usable",
  });
  const document = dom.window.document;
  const module = document.querySelector('script[type="module"]');
  dom.window.eval(module.innerHTML);
  return dom;
}

describe("SemanticCvTheme", () => {
  let sut;

  beforeEach(() => {
    const { window } = parseTemplate();
    window.customElements.define("semantic-cv-theme", window.SemanticCvTheme);
    sut = new window.SemanticCvTheme();
    sut.person = {
      url: "https://www.henrikbecker.net",
    };
  });

  describe("faIcon", () => {
    for (const [key, expectedClass] of Object.entries({
      ["https://www.henrikbecker.net"]: "fas fa-globe",
      ["mailto:spam@henrikbecker.se"]: "fas fa-envelope",
      ["tel:+46123456789"]: "fas fa-phone",
      ["https://github.com/handiman"]: "fab fa-github",
      ["https://www.linkedin.com/prettygoodprogrammer"]: "fab fa-linkedin",
      ["https://www.microsoft.com"]: "fab fa-windows",
      ["https://www.apple.com"]: "fab fa-apple",
      ["https://www.pinterest.com"]: "fab fa-pinterest",
      ["https://www.flickr.com"]: "fab fa-flickr",
      ["https://www.facebook.com"]: "fab fa-facebook",
      ["https://www.twitter.com"]: "fab fa-twitter",
      ["https://www.x.com"]: "fab fa-twitter",
      ["https://x.com"]: "fab fa-twitter",
    })) {
      it(`${key} should yield ${expectedClass}`, () => {
        assert.strictEqual(sut.faIcon(key), `<i class="${expectedClass}"></i>`);
      });
    }
  });

  describe("normalizeArray", () => {
    it("removes empty items", () => {
      const actualValue = sut.normalizeArray(
        ["https://www.henrikbecker.net"],
        "",
        null,
        undefined,
      );
      assert.strictEqual(actualValue.length, 1);
      assert.strictEqual(actualValue[0], "https://www.henrikbecker.net");
    });
  });
});
