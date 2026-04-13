import fs from "node:fs";
import path from "node:path";
import { loadFromFile, defaults } from "../index.js";
import { renderATS } from "../core/render/ats.js";
import { renderHTML, renderHTMLNew } from "../core/render/html.js";
import { Writable } from "node:stream";
import { HTMLTransformer } from "../core/transform.js";
import { HTMLRewriter } from "html-rewriter-wasm";
import { BoilingDieselTheme } from "../themes/boiling-diesel/index.js";
import { Person, Theme, ThemeLoader } from "../themes/index.js";

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

const tryNewWay = async (
  person: any,
  template: string,
  transformer: HTMLTransformer,
) => {
  transformer
    .on(`head script[type="module"]`, {
      element(script: any) {
        script.replace(`<script type="module">${themeJS}</script>`, {
          html: true,
        });
      },
    })
    .on(`head style`, {
      element(style: any) {
        style.replace(`<style type="text/css">${themeCSS}</style>`, {
          html: true,
        });
      },
    })
    .on(`body`, {
      element(body: any) {
        body.prepend(
          `\n\t<semantic-cv-theme-${theme.name}></semantic-cv-theme-${theme.name}>`,
          { html: true },
        );
        body.prepend(themeHTML, { html: true });
      },
    });
  const theme = new BoilingDieselTheme(transformer, loadAsset);
  const themeHTML = await theme.renderHTML(person);
  const themeCSS = await theme.renderCSS(person);
  const themeJS = await theme.renderJS(person);
  return await transformer.transform(template);
};

export async function renderFile_old(args: Array<string>) {
  const [, theme, file] = args;
  const fileName = file ?? defaults.fileName;
  const themeRoot = resolveThemeRoot();
  const themeFolder = path.join(themeRoot, theme ?? defaults.theme);
  const htmlPath = path.join(themeRoot, `template.html`);
  const cssPath = path.join(themeFolder, `${theme}.css`);
  const jsPath = path.join(themeFolder, `${theme}.js`);

  if (!fs.existsSync(themeFolder)) {
    throw new Error(`Theme not found: ${theme}`);
  }
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`${path.basename(htmlPath)} not found`);
  }
  if (!fs.existsSync(cssPath)) {
    throw new Error(`${path.basename(cssPath)} not found`);
  }
  if (!fs.existsSync(jsPath)) {
    throw new Error(`${path.basename(jsPath)} not found`);
  }

  const template = fs.readFileSync(htmlPath).toString();
  const person = loadFromFile(fileName)();

  await renderATS(
    person,
    Writable.toWeb(fs.createWriteStream(`${fileName}.txt`)),
  );

  const transformer = new NodeTransformer().on("body", {
    element(body: any) {
      body.prepend(`<semantic-cv-theme-${theme}</semantic-cv-theme-${theme}>`, {
        html: true,
      });
    },
  });

  const writer = fs.createWriteStream(`${fileName}.html`);

  if ("boiling-diesel" === theme) {
    writer.write(
      await renderHTMLNew({
        person,
        template,
        theme: new BoilingDieselTheme(transformer, loadAsset),
        transformer,
      }),
    );
  } else {
    writer.write(
      await renderHTML({
        transformer,
        person,
        template,
        theme: undefined,
        legacy_theme: {
          name: theme,
          html: template,
          css: fs.readFileSync(cssPath).toString(),
          js: fs.readFileSync(jsPath).toString(),
        },
      }),
    );
  }
  writer.close();
}

const loadTemplate = () => {
  const themeRoot = resolveThemeRoot();
  const templatePath = path.join(themeRoot, "template.html");
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath).toString();
  }
  throw new Error(`${path.basename(templatePath)} not found`);
};

const loadPerson = (fileName: string) => {
  if (fs.existsSync(fileName)) {
    return new Person(loadFromFile(fileName)());
  }
  throw new Error(`${path.basename(fileName)} not found`);
};

export async function renderFile(args: Array<string>) {
  const [, themeName, file] = args;
  const fileName = file ?? defaults.fileName;
  const person = loadPerson(file ?? defaults.fileName);
  const renderHtml = async () => {
    const template = loadTemplate();
    const transformer = new NodeTransformer().on("body", {
      element(body: any) {
        body.prepend(
          `<semantic-cv-theme-${theme}</semantic-cv-theme-${theme}>`,
          {
            html: true,
          },
        );
      },
    });
    const loader = new ThemeLoader(transformer, loadAsset);
    const theme = loader.loadTheme(themeName);
    const writer = fs.createWriteStream(`${fileName}.html`);
    writer.write(
      await renderHTMLNew({
        person,
        template,
        theme,
        transformer,
      }),
    );
    writer.close();
  };

  await renderHtml();
  await renderATS(
    person,
    Writable.toWeb(fs.createWriteStream(`${fileName}.txt`)),
  );
}
export default renderFile;
