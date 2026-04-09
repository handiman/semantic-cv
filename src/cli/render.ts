import fs from "node:fs";
import path from "node:path";
import { loadFromFile, defaults } from "../index.js";
import { renderATS } from "../core/render/ats.js";
import { renderHTML } from "../core/render/html.js";
import { Writable } from "node:stream";

export async function renderFile(args: Array<string>) {
  const [, theme, file] = args;
  const fileName = file ?? defaults.fileName;
  const themeRoot = path.resolve(process.cwd(), "themes");
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

  const person = loadFromFile(fileName)();
  await renderATS(
    person,
    Writable.toWeb(fs.createWriteStream(`${fileName}.txt`)),
  );
  await renderHTML(
    {
      person,
      theme: {
        name: theme,
        html: fs.readFileSync(htmlPath).toString(),
        css: fs.readFileSync(cssPath).toString(),
        js: fs.readFileSync(jsPath).toString(),
      },
    },
    Writable.toWeb(fs.createWriteStream(`${fileName}.html`)),
  );
}

export default renderFile;
