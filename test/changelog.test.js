import assert from "node:assert";
import { describe, test } from "node:test";
import { formatChangelog, parseCommit, sectionOf } from "../scripts/generate-changelog.js";

const commit = (subject, body = "", hash = "abc1234") => ({ hash, subject, body });
const core = { repository: "handiman/semantic-cv-core", label: "core" };
const section = (subject, body) => sectionOf(parseCommit(commit(subject, body)));

describe("The changelog", () => {
  test("lists features and fixes", () => {
    assert.equal(section("feat(CLI): Add --version (#89)"), "feat");
    assert.equal(section("fix(CLI): Exit with code 1 for an unknown command (#96)"), "fix");
  });

  test("leaves out ci, test, docs, chore, refactor and build commits", () => {
    for (const type of ["ci", "test", "docs", "chore", "refactor", "build"]) {
      assert.equal(section(`${type}(Anything): Something`), undefined, type);
    }
  });

  test("leaves out commits that are not conventional commits", () => {
    assert.equal(section("Merge branch 'master'"), undefined);
  });

  test("leaves out the commits that only bump the submodules", () => {
    assert.equal(section("fix(Render): Bump core and themes for source maps (#78)"), undefined);
  });

  test("lists a breaking change marked with ! or BREAKING CHANGE, whatever its type", () => {
    assert.equal(section("feat(CLI)!: Rename render to build"), "breaking");
    assert.equal(section("refactor: Drop Node 20", "BREAKING CHANGE: Node 22 is required"), "breaking");
  });

  test("groups the entries under Breaking changes, Features and Fixes, in that order", () => {
    const text = formatChangelog("1.1.0", [
      {
        source: undefined,
        commits: [
          commit("fix(CLI): Second", "", "2222222"),
          commit("ci(Test): Ignored", "", "3333333"),
          commit("feat(CLI): First", "", "1111111"),
          commit("feat!: Breaking", "", "0000000")
        ]
      }
    ]);

    assert.equal(
      text,
      [
        "# v1.1.0",
        "",
        "## Breaking changes",
        "",
        "- Breaking (0000000)",
        "",
        "## Features",
        "",
        "- **CLI:** First (1111111)",
        "",
        "## Fixes",
        "",
        "- **CLI:** Second (2222222)",
        ""
      ].join("\n")
    );
  });

  test("marks a submodule entry with its source and links its PR to that repository", () => {
    const text = formatChangelog("1.0.1", [
      { source: core, commits: [commit("fix(Analyze): Print relative paths (#54)", "", "ee4e181")] }
    ]);

    assert.match(
      text,
      /^- \*\*Analyze:\*\* Print relative paths \(handiman\/semantic-cv-core#54\) \(core ee4e181\)$/m
    );
  });

  test("says so when there is nothing a user notices", () => {
    const text = formatChangelog("1.0.1", [
      { source: undefined, commits: [commit("ci(Security): Harden the workflows")] }
    ]);

    assert.equal(text, "# v1.0.1\n\n_No user-facing changes._\n");
  });
});
