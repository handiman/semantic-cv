export default `semantic-cv — Create, edit, analyze and render semantic CVs (JSON‑LD)

Usage:
  semantic-cv <command> [options]

Commands:
  init [filename]
      Create a new Semantic‑CV file using interactive prompts.

  set <property> [value=prompt] [filename=cv.json]
      Set a single-value property on a CV file. 

  add <section> [filename=cv.json]
      Add a structured item (e.g. work, education) using interactive prompts.

  convert <input-file-or-url> [output-file=prompt]
      Convert a JSON Resume file into a Semantic‑CV JSON‑LD file.

  analyze [path=cv.json]
      Analyze CVs and report structural issues, missing fields and semantic inconsistencies.
      Path can be a file name or directory. Defaults to cv.json if omitted.

  doctor [filename=cv.json]
      Automatically repair structural and semantic issues in a CV file.
      Fixes casing, normalizes arrays, adds missing @context/@type,
      removes invalid values and sorts keys deterministically.

  watch [path=cv.json]
      Continually watch CVs and report structural issues. Useful while editing.
      Path can be a file name or directory. Defaults to cv.json if omitted.

  render <theme> [filename=cv.json]
      Render a CV to HTML using the specified theme.
      Also generates an ATS‑friendly version.

  help, -h --help
      Show this help text.

Examples:
  semantic-cv init henrik.cv.json
  semantic-cv set name henrik.cv.json "Henrik Becker"
  semantic-cv add work henrik.cv.json
  semantic-cv convert https://www.henrikbecker.net/assets/henrik-becker.resume.json henrik.cv.json
  semantic-cv doctor henrik.cv.json
  semantic-cv render classic henrik.cv.json
  semantic-cv analyze
  semantic-cv watch
`;
