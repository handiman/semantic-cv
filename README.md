# Semantic-CV - a schema.org/Person based CV Generator

[![semantic.cv security grade from Mozilla HTTP Observatory](https://img.shields.io/mozilla-observatory/grade/semantic.cv?label=semantic.cv%20security)](https://developer.mozilla.org/en-US/observatory/analyze?host=semantic.cv)

<img src="https://assets.semantic.cv/semantikitten-scholar.png" alt="Artistic Semantikitten" height="100" align="right" style="margin-left: 20px;" />

Semantic‑CV is a minimal, idiomatic convention for expressing CV data using the global standard [schema.org/Person](https://schema.org/Person).
It does not introduce a new schema. Instead, it applies existing fields consistently and adds only a few carefully chosen extensions.

The goal is a future‑proof, machine‑readable, deterministic CV format that can be rendered into clean, professional documents — without lock‑in, bloat, or proprietary structures.

## Features

- Analyze JSON‑LD CVs
- Normalize CVs (sort experience, correct types, trim fields, enforce conventions)
- Watch mode for continuous validation
- HTML rendering via templates
- Minimal runtime dependencies
- Deterministic, reproducible output

## Roadmap

- More HTML templates
- Hosted rendering at https://semantic.cv

## Installation

```sh
npm i -g semantic-cv
```

## Usage

```
semantic-cv init
semantic-cv add <section>
semantic-cv set <name> <value>
semantic-cv analyze
semantic-cv watch
semantic-cv normalize
semantic-cv convert <filename|url>
semantic-cv render <theme>
semantic-cv help
```

## Philosophy

Semantic‑CV is built on four principles:

**Use global standards**

- No proprietary schemas
- No reinvention

**Be minimal**

- Only the fields needed to express CV data
- No plugins, no extensions, no ecosystem sprawl
- Minimal dependencies — only essential, stable libraries like semver or HTML rewriting primitives.

**Be deterministic**

- Predictable, reproducible output
- No hidden heuristics

**Be semantically correct**

- Every field carries meaning beyond the CV
- Data should remain valid outside the rendering context

## Base Structure

A Semantic‑CV document is a JSON‑LD object shaped as a [schema.org/Person][person]:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "...": "other Person fields"
}
```

## Minimal Valid semantic-cv Example

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Henrik Becker",
  "jobTitle": "Software Engineer",
  "description": "Henrik Becker is an experienced .Net developer and solution architect dedicated to delivering quality software practicing Agile Processes, Test Driven Development, applying SOLID principles and a healthy dose of dad-jokes."
}
```

## Getting started & adding content

### Examples

```sh
# Prompts for basic info (name, job title, etc.) and creates cv.json
semantic-cv init

# Prompts for adding work experience entries
semantic-cv add worksFor

# Prompts for adding education entries
semantic-cv add alumniOf

# Prompts for adding keywords (skills) to a work or project entry
semantic-cv add keywords

# Adds a project (a role in a Project instead of an Organization)
semantic-cv add project

# Sets a single value
semantic-cv set name Yoda
```

### `add` sections

| Section (and aliases)                        | Adds                                    |
| -------------------------------------------- | --------------------------------------- |
| `worksFor`, `work`, `employer`, `employment` | A job, as a `Role` at an `Organization` |
| `project`                                    | A project, as a `Role` in a `Project`   |
| `keywords`, `keyword`                        | Keywords on a work or project entry     |
| `alumniOf`, `education`, `school`            | Education                               |
| `skills`, `skill`                            | Skills                                  |
| `knowsAbout`, `competence`                   | Knowledge areas                         |
| `knowsLanguage`, `language`                  | Languages                               |
| `sameAs`                                     | A link to a profile elsewhere           |
| `hasCertification`, `certification`, `cert`  | A certification                         |
| `hasCredential`, `credential`                | A credential                            |
| `lifeEvent`                                  | Awards, talks and other milestones      |

Unknown sections are ignored. Every command normalizes the file before it saves it.

### `set`

`semantic-cv set <property> [value] [filename]` prompts for the value if you leave it out. It supports `name`, `jobTitle` (`title`), `description`, `email`, `telephone` (`phone`), `url` (`website`), `image`, `workLocation`, `nationality` and `theme`. Other properties are rejected and the file is left untouched.

### Converting a JSON Resume

```sh
semantic-cv convert <filename|url> [output]
```

Converts a [JSON Resume](https://jsonresume.org) file, given as a path or a URL, to a Semantic‑CV file. It asks before overwriting an existing output file. Data with no schema.org equivalent is dropped. Other formats are rejected with "Unsupported format".

## Analysing JSON‑LD CVs

### One‑off analysis

```sh
semantic-cv analyze <filename>
```

The command exits with code 1 if it finds errors (warnings do not count), so it can gate a CI job.

### Continuous analysis

```sh
semantic-cv watch <filename>
```

Both commands operate recursively on all JSON‑LD files in the current working directory when no filename is provided.

## Normalization

```sh
semantic-cv normalize <filename>
```

The normalize command:

- Sorts work experience, education, projects, certifications, and life events in descending chronological order
- Converts single values to arrays (and arrays to single values) when the schema expects it
- Trims surrounding whitespace from strings

### Required fields

Schema.org is permissive, but a CV still needs a few core fields to be meaningful:

- @context
- @type
- name
- description
- jobTitle

Everything else is optional.

### Additional checks

The analyzer also checks for:

- invalid URLs
- missing or malformed fields
- structural inconsistencies
- unexpected types

Errors and warnings are printed directly to the console.
Template authors should assume **all fields are optional** and implement appropriate null checks.

## Rendering

```sh
semantic-cv render <theme> [filename=cv.json]
```

Renders your CV using the selected theme.
If no filename is provided, cv.json in the current directory is used

## Conventions by CV Area

Conventions for each CV area — including recommended fields, ordering rules, and semantic patterns — are documented in the dedicated reference:
[https://semantic.cv/docs/conventions](https://semantic.cv/docs/conventions)

## Contributing

Bug reports, ideas and pull requests are welcome. See [CONTRIBUTING.md](https://github.com/handiman/semantic-cv/blob/master/CONTRIBUTING.md) and the [code of conduct](https://github.com/handiman/semantic-cv/blob/master/CODE_OF_CONDUCT.md).

[person]: https://schema.org/Person
