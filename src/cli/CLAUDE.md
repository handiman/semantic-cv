# CLI

One file per command (`init`, `add`, `set`, `analyze`, `normalize`, `render`, `watch`, `convert`, `version`, `help`).
[bin/cli](../../bin/cli) imports the compiled `dist/cli/<command>.js` and dispatches on the first argument, so a new
command needs three things: the module here, a `case` in `bin/cli`, and an entry in [help.ts](help.ts) (and the
README's usage list).

## Command shape

- Each module default-exports an async function taking `args: string[]` (`args[0]` is the command name).
- Logic that a test should reach is exported separately from the default export (`setProperty` in `set.ts`,
  `renderFile`/`loadAsset` in `render.ts`) — the default export only does argument handling and I/O.
- Load → transform → save goes through `pipe`, `loadFromFile` and `saveToFile` from [../index.ts](../index.ts).
  Normalization is the last step before saving, so the file on disk is always normalized.
- Imports of `../core/...` and `../themes/...` are the **submodules** — see the root CLAUDE.md. Fix renderer or theme
  bugs in their own repositories.

## Errors

- Throw `KnownError` ([error.ts](error.ts)) for anything the user can fix: missing file, unknown property, bad
  argument. `handleError` prints just the message. Anything else prints as "Unexpected error" with the full object.
- **Throw before writing.** `set` validates the property name first so an unknown property can never overwrite the CV
  with a broken value. Keep that order in new commands.
- `bin/cli` exits with code 1 on any error; don't call `process.exit` inside commands.

## Prompts

- Interactive input goes through `IPrompt` ([prompt.ts](prompt.ts)): `ask(question, defaultValue?)` and `close()`.
  Commands take an `IPrompt` parameter defaulting to `new Prompt()`, and `close()` in a `finally`.
- Never read `process.stdin` directly; tests inject `FakePrompt` (see [../../test/CLAUDE.md](../../test/CLAUDE.md)).

## `add/`

One file per schema.org property the user can add (`worksFor`, `alumniOf`, `skills`, `knowsAbout`, `sameAs`, …), named
after the property, with a `/** https://schema.org/<property> */` doc comment. Each exports
`(person, prompt?) => Promise<person>` and returns a **new** object — never mutate `person`. An empty answer returns
`person` unchanged. Register a new one in `add.ts` and add a test in `test/add/`.

## `convert/`

`convert.ts` imports a [JSON Resume](https://jsonresume.org) file (path or URL) into a schema.org Person; the mapping
is one file per section in `convert/jsonResume/`. Map to existing schema.org properties; don't invent fields to hold
data that has no schema.org equivalent — drop it instead.

## `render`

Writes `<file>.html` and `<file>.txt` (ATS-friendly) next to the CV. The theme comes from the argument, otherwise
`person.theme`, otherwise the default. Writes are awaited so a failed write is reported. `NodeTransformer` adapts
`html-rewriter-wasm` to the `HTMLTransformer` interface that the shared core also uses on Cloudflare Workers — keep
it free of Node-only assumptions beyond what `render.ts` already does.
