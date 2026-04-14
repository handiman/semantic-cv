# Semantic-CV - a schema.org/Person based CV Generator

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

# Sets a single value
semantic-cv set name Yoda
```

## Analysing JSON‑LD CVs

### One‑off analysis

```sh
semantic-cv analyze <filename>
```

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
[https://github.com/handiman/semantic-cv-docs/blob/master/conventions.md](https://github.com/handiman/semantic-cv-docs/blob/master/conventions.md)

[person]: https://schema.org/Person
