// scripts/generate-changelog.js
//
// Writes the release notes for the next version to CHANGELOG.md. Only changes a user of the CLI
// notices are listed: breaking changes, features and fixes, from this repository and from the core
// and themes submodules. ci, test, docs, chore, refactor and build commits are left out, and so are
// the "Bump core and themes" commits here, whose content is listed from the submodules instead.
//
// Usage: node scripts/generate-changelog.js <version>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SUBMODULES = [
  { path: "src/core", repository: "handiman/semantic-cv-core", label: "core" },
  { path: "src/themes", repository: "handiman/semantic-cv-themes", label: "themes" }
];

const HEADER = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/;
const SECTIONS = [
  ["breaking", "Breaking changes"],
  ["feat", "Features"],
  ["fix", "Fixes"]
];

/**
 * Parses a conventional commit. Returns undefined for a commit that is not one.
 */
export const parseCommit = ({ hash, subject, body = "" }) => {
  const match = HEADER.exec(subject);
  if (!match) {
    return undefined;
  }
  const [, type, scope, bang, description] = match;
  return {
    hash,
    type: type.toLowerCase(),
    scope,
    description,
    breaking: Boolean(bang) || /^BREAKING[ -]CHANGE:/m.test(body)
  };
};

const isBump = (commit) => /^bump core and themes\b/i.test(commit.description);

/**
 * The section a commit belongs in, or undefined when it is left out.
 */
export const sectionOf = (commit) => {
  if (!commit || isBump(commit)) {
    return undefined;
  }
  if (commit.breaking) {
    return "breaking";
  }
  return ["feat", "fix"].includes(commit.type) ? commit.type : undefined;
};

const entry = (commit, source) => {
  const scope = commit.scope ? `**${commit.scope}:** ` : "";
  // A PR number in a submodule commit refers to that repository, so it is qualified to link there.
  const description = source
    ? commit.description.replace(/\(#(\d+)\)/g, `(${source.repository}#$1)`)
    : commit.description;
  const origin = source ? `${source.label} ${commit.hash}` : commit.hash;
  return `- ${scope}${description} (${origin})`;
};

/**
 * Formats the release notes. `sources` is a list of `{ source, commits }`, where `source` is
 * undefined for this repository and a submodule from SUBMODULES otherwise.
 */
export const formatChangelog = (version, sources) => {
  const lines = [`# v${version}`, ""];
  let any = false;
  for (const [key, title] of SECTIONS) {
    const entries = sources.flatMap(({ source, commits }) =>
      commits
        .map(parseCommit)
        .filter((commit) => sectionOf(commit) === key)
        .map((commit) => entry(commit, source))
    );
    if (entries.length) {
      any = true;
      lines.push(`## ${title}`, "", ...entries, "");
    }
  }
  if (!any) {
    lines.push("_No user-facing changes._", "");
  }
  return lines.join("\n");
};

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const FIELD = "\x1f";
const RECORD = "\x1e";

const commitsIn = (cwd, range) => {
  const args = ["-C", cwd, "log", `--pretty=format:%h${FIELD}%s${FIELD}%b${RECORD}`];
  if (range) {
    args.push(range);
  }
  return git(...args)
    .split(RECORD)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, subject, body] = record.split(FIELD);
      return { hash, subject, body };
    });
};

const pointer = (ref, path) => git("ls-tree", ref, path).split(/\s+/)[2];

const main = () => {
  const [version] = process.argv.slice(2);
  if (!version) {
    throw new Error("Usage: node scripts/generate-changelog.js <version>");
  }
  let lastTag = "";
  try {
    lastTag = git("describe", "--tags", "--abbrev=0");
  } catch {
    // No tag yet: everything is new.
  }

  const sources = [{ source: undefined, commits: commitsIn(".", lastTag && `${lastTag}..HEAD`) }];
  for (const submodule of SUBMODULES) {
    const oldSha = lastTag ? pointer(lastTag, submodule.path) : undefined;
    const newSha = pointer("HEAD", submodule.path);
    if (oldSha === newSha) {
      continue;
    }
    try {
      if (oldSha) {
        // The previous pointer can be a commit that is on no branch any more (a squashed PR
        // branch), so it is not in the clone; fetch it by hash.
        try {
          git("-C", submodule.path, "cat-file", "-e", `${oldSha}^{commit}`);
        } catch {
          git("-C", submodule.path, "fetch", "-q", "origin", oldSha);
        }
      }
      const range = oldSha ? `${oldSha}..${newSha}` : newSha;
      sources.push({ source: submodule, commits: commitsIn(submodule.path, range) });
    } catch (err) {
      // A changelog without the submodule is better than no release.
      console.warn(`Leaving ${submodule.label} out of the changelog: ${err.message}`);
    }
  }

  writeFileSync("CHANGELOG.md", formatChangelog(version, sources));
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
