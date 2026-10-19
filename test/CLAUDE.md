# CLI tests

Plain JavaScript on `node:test` and `node:assert`. Tests import from the **compiled** output
(`../dist/cli/...`), so `npm run build` must have run first; `npm test` does that. The core and themes submodules have
their own tests (`npm run test:core`, `npm run test:themes`) — don't duplicate them here.

## Layout

- `<command>.test.js` — one per CLI command (`add`, `set`, `render`, `convert`, `prompt`).
- `add/`, `convert/` — helpers and fixtures for the larger suites; their `*.js` files are not tests (only
  `*.test.js` is picked up by `npm run test:cli`).
- [prompt.js](prompt.js) — `FakePrompt`.

## Conventions

- Test the exported function, not the process: call `setProperty(...)`, an `add` function with a `FakePrompt`, etc.
  Don't spawn `bin/cli` unless the test is specifically about dispatch or exit codes.
- `new FakePrompt([...answers])` hands out answers in order; once they run out, `ask` returns the question's
  `defaultValue`. Pass answers in the order the command asks.
- Assert that failures are `KnownError` by name (`{ name: "KnownError" }`), and that the input object is unchanged
  after a rejected call (see `set.test.js`).
- Never touch the user's real `cv.json`; use in-memory objects. `render.test.js` renders to a string with `renderHTML`
  and inspects it with JSDOM instead of writing files.
- No network in tests. `convert` is tested against the local fixture `convert/jsonResume/jsonResume.json`, not URLs.
- A new command or a new `add` section comes with a test in the same PR.
