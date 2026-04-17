import fs from "node:fs";
import path from "node:path";
import { loadFromFile, defaults, pipe } from "../index.js";
import { renderATS } from "../core/render/ats.js";
import { renderHTML } from "../core/render/html.js";
import { Writable } from "node:stream";
import { HTMLTransformer } from "../core/transform.js";
import { HTMLRewriter } from "html-rewriter-wasm";
import { ThemeLoader } from "../themes/index.js";
import normalize from "../core/normalize.js";

/**
 * CLI command for rendering a Semantic‑CV file into HTML and ATS‑friendly text.
 *
 * The command:
 *   - loads the Person file (or the default file if omitted)
 *   - loads the requested theme
 *   - renders a full HTML CV using the theme and HTML transformer
 *   - writes the result to <fileName>.html
 *   - renders an ATS‑friendly plain‑text version
 *   - writes the result to <fileName>.txt
 *
 * The HTML output includes a link to the ATS text file via an injected
 * <link rel="alternate"> tag.
 *
 * @param args CLI arguments: `[node, script, themeId, fileName?]`.
 */
export async function renderFile(args: Array<string>) {
  const [, themeId, file] = args;
  const fileName = file ?? defaults.fileName;
  const person = loadPerson(file ?? defaults.fileName);
  const html = async () => {
    const transformer = new NodeTransformer().on("head", {
      element(head: any) {
        head.append(
          `\n<link rel="alternate" type="text/plain" title="ATS-Friendly CV" href="${fileName}.txt" />`,
          { html: true }
        );
      }
    });
    const loader = new ThemeLoader(transformer, loadAsset);
    const theme = loader.loadTheme(themeId);
    const writer = fs.createWriteStream(`${fileName}.html`);
    writer.write(
      await renderHTML({
        person,
        theme,
        transformer
      })
    );
    writer.close();
  };
  const ats = async () =>
    renderATS(person, Writable.toWeb(fs.createWriteStream(`${fileName}.txt`)), true);

  await html();
  await ats();
}

export default renderFile;

type Hook = {
  selector: string;
  hooks: { element: (el: any) => void };
};

/**
 * Node.js implementation of the HTMLTransformer interface.
 *
 * Wraps the html-rewriter-wasm API to provide the same `.on()` and
 * `.transform()` contract used in Workers. Hooks are collected and
 * applied when `transform()` is called.
 */
class NodeTransformer implements HTMLTransformer {
  private hooks: Array<Hook> = [];

  async transform(html: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const rewriter = new HTMLRewriter(
      (chunk: Uint8Array) => (result += decoder.decode(chunk, { stream: true }))
    );

    let result = "";
    for (const hook of this.hooks) {
      rewriter.on(hook.selector, hook.hooks);
    }

    await rewriter.write(encoder.encode(html));
    rewriter.end();

    return result;
  }

  on(selector: string, hooks: { element: (el: any) => void }): HTMLTransformer {
    this.hooks.push({
      selector,
      hooks
    });
    return this;
  }
}

const resolveThemeRoot = () => {
  for (const potentialPath of [
    "themes", // normal case
    "src/themes" // when debugging
  ]) {
    const fullPath = path.join(process.cwd(), potentialPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return "";
};

/**
 * Load a theme asset (HTML/CSS/JS) from the theme directory.
 * Returns an empty string if the asset is missing.
 */
const loadAsset = (assetName: string) => {
  const themeRoot = resolveThemeRoot();
  const themeId = path.parse(assetName).name;
  const assetPath = path.join(themeRoot, themeId, assetName);

  if (fs.existsSync(assetPath)) {
    const asset = fs.readFileSync(assetPath).toString();
    return Promise.resolve(asset);
  }

  return Promise.resolve("");
};

/**
 * Load and normalize a Person file, or throw if it does not exist.
 */
const loadPerson = (fileName: string) => {
  if (fs.existsSync(fileName)) {
    return pipe(loadFromFile(fileName), normalize)();
  }
  throw new Error(`${path.basename(fileName)} not found`);
};

