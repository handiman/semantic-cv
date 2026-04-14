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

type Hook = {
  selector: string;
  hooks: { element: (el: any) => void };
};

class NodeTransformer implements HTMLTransformer {
  private hooks: Array<Hook> = [];

  async transform(html: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const rewriter = new HTMLRewriter(
      (chunk: Uint8Array) =>
        (result += decoder.decode(chunk, { stream: true })),
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
      hooks,
    });
    return this;
  }
}

const resolveThemeRoot = () => {
  for (const potentialPath of [
    "themes", // normal case
    "src/themes", // when debugging
  ]) {
    const fullPath = path.join(process.cwd(), potentialPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return "";
};

const loadAsset = (assetName: string) => {
  const themeRoot = resolveThemeRoot();
  const themeName = path.parse(assetName).name;
  const assetPath = path.join(themeRoot, themeName, assetName);
  const asset = fs.readFileSync(assetPath).toString();
  return Promise.resolve(asset);
};

const loadPerson = (fileName: string) => {
  if (fs.existsSync(fileName)) {
    return pipe(loadFromFile(fileName), normalize)();
  }
  throw new Error(`${path.basename(fileName)} not found`);
};

export async function renderFile(args: Array<string>) {
  const [, themeName, file] = args;
  const fileName = file ?? defaults.fileName;
  const person = loadPerson(file ?? defaults.fileName);
  const html = async () => {
    const transformer = new NodeTransformer();
    const loader = new ThemeLoader(transformer, loadAsset);
    const theme = loader.loadTheme(themeName);
    const writer = fs.createWriteStream(`${fileName}.html`);
    writer.write(
      await renderHTML({
        person,
        theme,
        transformer,
      }),
    );
    writer.close();
  };
  const ats = async () =>
    renderATS(person, Writable.toWeb(fs.createWriteStream(`${fileName}.txt`)));

  await html();
  await ats();
}
export default renderFile;
