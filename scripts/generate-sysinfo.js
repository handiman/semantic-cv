// scripts/generate-sysinfo.js
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const version = JSON.parse(execSync("npm pkg get version")).replace(/"/g, "");
const commit = execSync("git rev-parse --short HEAD").toString().trim();

const themesCommit = execSync("git -C src/themes rev-parse --short HEAD").toString().trim();
const coreCommit = execSync("git -C src/core rev-parse --short HEAD").toString().trim();

writeFileSync(
  "SYSINFO.md",
  `# Semantic‑CV System Info

**Version:** ${version}   
**Commit:** [${commit}](https://github.com/handiman/semantic-cv/commit/${commit})   
**Generated:** ${new Date().toISOString()}   

## Submodules
| Name      | Commit |
| --------- |   -    |
| core      | [${coreCommit}](https://github.com/handiman/semantic-cv-core/commit/${coreCommit}) |
| themes    | [${themesCommit}](https://github.com/handiman/semantic-cv-themes/commit/${themesCommit}) |
`
);
