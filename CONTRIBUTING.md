# Contributing to Semantic-CV

Thanks for taking an interest. Bug reports, ideas and pull requests are all welcome.

## Before you start

- **Found a bug or have an idea?** Open an [issue](https://github.com/handiman/semantic-cv/issues). The templates ask for what's needed.
- **Planning a larger change?** Open an issue first, so we can agree on the approach before you put time into it.
- **Found a security problem?** Don't open a public issue. Email [security@semantic.cv](mailto:security@semantic.cv) instead.

## How the code is organized

The CLI lives in this repository. Two parts of it live in their own repositories and are included here as Git submodules:

| Path         | Repository                                                           | What it is                           |
| ------------ | -------------------------------------------------------------------- | ------------------------------------ |
| `src/core`   | [semantic-cv-core](https://github.com/handiman/semantic-cv-core)     | Normalizing, analyzing and rendering |
| `src/themes` | [semantic-cv-themes](https://github.com/handiman/semantic-cv-themes) | The themes                           |

Changes to the renderer or the themes go to those repositories. They are shared with [semantic.cv](https://semantic.cv).

## Getting set up

You need Node.js 20 or later (CI runs Node 25).

```sh
git clone --recurse-submodules https://github.com/handiman/semantic-cv.git
cd semantic-cv
npm ci
npm --prefix src/core ci
npm --prefix src/themes ci
npm test
```

`npm test` builds the CLI and runs the tests for the CLI, core and themes.

## Making a change

1. Branch from `master`, named after the kind of change: `fix/…`, `feat/…`, `docs/…`, `refactor/…`, `ci/…`.
2. Add or update tests for what you change.
3. Run `npm test` and `npm run lint`. CI runs both and must pass before a merge.
4. Write commit messages as `type(Scope): Subject`, for example `fix(CLI): Don't overwrite the CV on unknown properties`. The type decides the next version number (`fix` is a patch, `feat` is a minor, `!` or `BREAKING CHANGE:` is a major).
5. Open a pull request against `master`. Say what it changes and why, and link the issue it closes (`Closes #123`).

## Code of conduct

Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
