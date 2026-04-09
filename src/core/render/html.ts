import analyzer from "../analyze.js";
import normalize from "../normalize.js";
import pipe from "../pipe.js";

const apply = (html: string, values: Record<string, string>) => {
  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
};

const og = (person: any) => {
  const meta = [
    `<meta property="og:site_name" content="${person.name}" />`,
    `<meta property="og:type" content="website" />`,
  ];
  if (person.url) {
    meta.push(`<meta property="og:url" content="${person.url}" />`);
  }
  if (person.image) {
    meta.push(`<meta property="og:image" content="${person.image}" />`);
    meta.push(`<meta property="og:image:alt" content="${person.name}" />`);
  }
  return meta;
};

const twitter = (person: any) => {
  const meta = new Array<string>();
  if (person.image) {
    meta.push(`<meta name="twitter.card" content="summary_large_image" />`);
    meta.push(`<meta property="twitter:image" content="${person.image}" />`);
    meta.push(`<meta name="twitter:image:alt" content="${person.name}" />`);
  } else {
    meta.push(`<meta name="twitter.card" content="summary" />`);
  }
  meta.push(`<meta property="twitter:title" content="${person.name}" />`);
  return meta;
};

const cleananalysisResults = (analysisResults: Record<string, any>) => {
  for (const [key, value] of Object.entries(analysisResults)) {
    if (0 === value.errors.length && 0 === value.warnings.length) {
      delete analysisResults[key];
      continue;
    }
    if (0 === value.errors.length) {
      delete value.errors;
    }
    if (0 === value.warnings.length) {
      delete value.warnings;
    }
  }

  if (0 === Object.keys(analysisResults).length) {
    return "✔ No structural issues";
  } else {
    return JSON.stringify(analysisResults, null, 2);
  }
};

const analyze = (json: string) => cleananalysisResults(analyzer(json));

export type RenderHTMLOptions = {
  person: any;
  theme: {
    name: string;
    html: string;
    css: string;
    js: string;
  };
};

export async function renderHTML(
  options: RenderHTMLOptions,
  writable: WritableStream,
) {
  const saveToStream = (person: any) => {
    const { theme } = options;
    const { css, js } = theme;
    const json = JSON.stringify(person, null, 0);
    const analysisResults = analyze(json);
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const preparedHtml = theme.html
      .replace(
        /(<script\s+type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
        `$1${json}$2`,
      )
      .replace(/(<script\s+type="module">)[\s\S]*?(<\/script>)/, `$1${js}$2`)
      .replace(/(<style\s+type="text\/css">)[\s\S]*?(<\/style>)/, `$1${css}$2`);

    const finalHtml = apply(preparedHtml, {
      ...person,
      theme: theme.name,
      og: og(person).join("\n    "),
      twitter: twitter(person).join("\n    "),
      analysisResults,
    });

    writer.write(encoder.encode(finalHtml));
    writer.close();
  };

  pipe(normalize, saveToStream)(options.person);
}

export default renderHTML;
