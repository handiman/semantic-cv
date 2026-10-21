# CLAUDE.md

Guidance for Claude Code in this repository. Deeper notes live in nested `CLAUDE.md` files next to the code — see
"Area documentation" at the bottom; load the relevant one before working in that area.

## What this is

`semantic-cv` — a Node.js CLI that creates, validates, normalizes and renders a CV written as a
[schema.org/Person](https://schema.org/Person) JSON-LD document, for developers. Published to npm; the same core and
themes also power the hosted renderer at [semantic.cv](https://semantic.cv).

## Priorities (in order)

1. **Standards over invention.** Use schema.org/Person fields as they are. Add an extension only when nothing in the
   schema fits, and keep it small.
2. **Deterministic output.** The same input must give byte-identical output. No hidden heuristics, no timestamps or
   randomness in rendered files.
3. **Minimal dependencies.** Runtime has one dependency (`html-rewriter-wasm`). Keep it that way.
4. **Don't destroy the user's CV.** A command that fails must leave `cv.json` untouched (throw before writing).

## Conventions

- Template authors must assume **every field is optional** and null-check it.
- Required fields for a valid CV: `@context`, `@type`, `name`, `description`, `jobTitle`.
- Default theme `minimal`, default file `cv.json` — both in `defaults` in [src/index.ts](src/index.ts).
- `cv.json*`, `dist/`, `test-results.*`, `SYSINFO.*` and `CHANGELOG.*` are git-ignored output. Never commit them.
- Prettier is authoritative (`.prettierrc`: double quotes, no trailing commas, width 100). Run `npm run format`.
- Tests are the spec. Write them as readable sentences so that a doc comment restating what a function does is
  redundant, and leave such comments out.
- Out of scope for now: more commands than the ones in `bin/cli`, plugins, a theme/extension ecosystem.

## Stack

- TypeScript (strict, ESM, `module: node20`) compiled with `tsc` from `src/` to `dist/`. Node >= 20; CI runs Node 25.
- Tests are plain JavaScript on `node:test`, run against the **compiled** `dist/` — build before testing.
- ESLint 10 with typescript-eslint; `jsdom` is used by the theme tests.
- `bin/cli` is the executable: a `switch` that dispatches to `dist/cli/<command>.js`.
- No CLI framework (no commander/yargs) and no test framework beyond `node:test` — deliberate. Don't add one.

### Submodules — `src/core` and `src/themes`

Two **separate repositories**, shared with the hosted site, included as Git submodules:

| Path         | Repository                    | Contents                                        |
| ------------ | ----------------------------- | ----------------------------------------------- |
| `src/core`   | `handiman/semantic-cv-core`   | normalize, analyze, render (HTML + ATS), `pipe` |
| `src/themes` | `handiman/semantic-cv-themes` | theme base classes and the free themes          |

- A change to the renderer or a theme is a commit and PR **in that repository**, not here. Here, only the submodule
  pointer moves (commit it as `fix(Render): Bump core and themes …`).
- `git status` showing ` M src/core` / ` M src/themes` just means the checked-out submodule commit differs from the
  recorded pointer. Don't stage it unless the task is to bump the pointer.
- Each submodule has its own `CLAUDE.md`, committed in its own repository. Edit it there, on a branch of its own, not
  from here.
- `scripts/copy-themes.js` copies the non-`.ts` theme assets (CSS etc.) into `dist/themes` after `tsc`.

## Working with the owner

The owner is a senior .NET/C# developer and solutions architect, also senior in TypeScript/JavaScript.

- Prefer established libraries and official plugins over custom code when they fit.
- Ask before adding a new dependency that isn't obviously needed (see priority 3).

## Commands

- `npm ci && npm --prefix src/core ci && npm --prefix src/themes ci` – install (clone with `--recurse-submodules`)
- `npm run build` – clean, lint, generate sysinfo, `tsc`, copy theme assets, prune `dist`
- `npm test` – build, then CLI + core + themes tests, then the HTML test report (needs `xunit-viewer` globally)
- `npm run test:coverage` – CLI + core + themes tests under c8 (builds core and themes first, so run `npm run build` before it): console table, `coverage/coverage-final.json`, `coverage/index.html` and `coverage/cobertura-coverage.xml`; CI uploads `coverage/` as an artifact and the Cobertura report to GitHub Code Quality, where the ruleset "Restrict code coverage" sets the limit (not in this repo)
- `npm run test:cli` – only the CLI tests in `test/` (after a build)
- `npm run lint` / `npm run lint:fix` – ESLint
- `npm run format` – Prettier
- `node bin/cli <command>` – run the built CLI locally, e.g. `node bin/cli render minimal sample.cv.json`

`npm run lint` + `npm test` are the gate — run both before considering work done. CI (`.github/workflows/ci.yml`)
runs the same on every push.

## Git workflow

Branching, commit messages and pull requests follow [CONTRIBUTING.md](CONTRIBUTING.md): branch from `master` as
`fix/…`, `feat/…`, `docs/…`, `refactor/…` or `ci/…`; commits are `type(Scope): Subject`. **The commit type drives
the release**: `fix` is a patch, `feat` a minor, `!`/`BREAKING CHANGE:` a major — pick it deliberately. Permissions
for you:

- **Pushing a branch and opening a PR needs no confirmation.** (If `gh` can't open the PR:
  `POST /repos/<owner>/<repo>/pulls` via the REST API, owner/repo from `git remote get-url origin`, with the token
  `git credential fill` returns for github.com, and the JSON payload in a file — an emoji or backtick in the body
  breaks shell quoting.)
- **Merging into `master` needs asking, every time.** So does anything that acts on production or ships to users:
  deploying, creating a tag or release, publishing to npm, uploading build artifacts, or triggering the CI/CD
  workflow by hand. **A merge to `master` publishes a release to npm automatically** (`release` job in `ci.yml`).
- **Never rebase or force-push an already-pushed branch.** Ask first if rebasing still seems right for some reason.
- Treat edits to `.github/workflows/ci.yml` with care: it holds the npm publish, the tag push and `SUBMODULE_TOKEN`.
  Third-party actions are pinned by commit SHA — keep them pinned.

## Architectural Decision Records

This repository has no `docs/adr/` yet. If a significant decision comes up (a new dependency, a cross-cutting
pattern), suggest creating one rather than burying the _why_ in this file.

## Area documentation

- [src/cli/CLAUDE.md](src/cli/CLAUDE.md) — CLI commands, prompts, error handling, `add` sections, JSON Resume convert
- [test/CLAUDE.md](test/CLAUDE.md) — CLI tests, `FakePrompt`, testing against `dist/`
- [src/core/CLAUDE.md](src/core/CLAUDE.md) — submodule: normalize, analyze, render, HTML escaping
- [src/themes/CLAUDE.md](src/themes/CLAUDE.md) — submodule: `Theme` base class, adding a theme, the generated registry
