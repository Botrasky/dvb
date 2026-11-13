import { execFileSync } from "node:child_process";
const base = process.env.PROGRESS_BASE_SHA ?? process.argv[2];
const head = process.env.PROGRESS_HEAD_SHA ?? process.argv[3] ?? "HEAD";

if (!base) {
  console.error(
    "Progress check requires PROGRESS_BASE_SHA or a base SHA argument.",
  );
  process.exit(1);
}

const changedFiles = execFileSync(
  "git",
  ["diff", "--name-only", `${base}..${head}`],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

const progressPath = "documentation/PROGRESS.md";
const exempt = new Set([
  progressPath,
  "documentation/PROJECT_CHARTER.md",
  "documentation/claude-role.md",
  "documentation/codex-role.md",
  "AGENTS.md",
  "CLAUDE.md",
]);

const requiresRecord = changedFiles.some((file) => !exempt.has(file));
if (!requiresRecord) {
  console.log("Progress record check passed: change set is governance-only.");
  process.exit(0);
}

if (!changedFiles.includes(progressPath)) {
  console.error(
    "Progress record check failed: implementation changes require documentation/PROGRESS.md in the same change set.",
  );
  console.error("Changed files:");
  for (const file of changedFiles) console.error(`- ${file}`);
  process.exit(1);
}

const progressDiff = execFileSync(
  "git",
  ["diff", "--unified=0", `${base}..${head}`, "--", progressPath],
  { encoding: "utf8" },
);
const addedActivity = progressDiff
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
  .some(
    (line) =>
      /^\+\| \d{4}-\d{2}-\d{2} \|/.test(line) ||
      /^\+### \d{4}-\d{2}-\d{2}/.test(line),
  );

if (!addedActivity) {
  console.error(
    "Progress record check failed: documentation/PROGRESS.md must add a dated activity entry.",
  );
  process.exit(1);
}

console.log(
  "Progress record check passed: change set includes a dated activity record.",
);
