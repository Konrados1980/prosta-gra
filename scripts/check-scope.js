const fs = require("fs");
const { execFileSync } = require("child_process");

const taskFile = process.env.CHECK_SCOPE_TASK_FILE || process.env.CHECK_TASK_FILE || "tasks/todo.md";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function fail(message, detail) {
  console.error(message);
  if (detail) console.error(detail);
  process.exit(1);
}

function normalize(file) {
  return file.replace(/^["'`]|["'`]$/g, "").replace(/^\.\//, "").trim();
}

function changedFiles() {
  if (process.env.CHECK_SCOPE_CHANGED_FILES) {
    return process.env.CHECK_SCOPE_CHANGED_FILES.split(/\r?\n/).map(normalize).filter(Boolean);
  }

  if (process.env.GITHUB_BASE_REF) {
    const output = git(["diff", "--no-renames", "--name-only", "-z", `origin/${process.env.GITHUB_BASE_REF}...HEAD`]);
    return output.split("\0").filter(Boolean);
  }

  const entries = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"])
    .split("\0").filter(Boolean);
  const files = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    files.push(entry.slice(3));
    if (/[RC]/.test(entry.slice(0, 2))) files.push(entries[++index]);
  }
  return files;
}

function taskText() {
  if (!fs.existsSync(taskFile)) fail(`Missing ${taskFile}`);
  return fs.readFileSync(taskFile, "utf8");
}

function changeMode(txt) {
  const match = txt.match(/^Tryb zmiany:\s*(code-change|audit-only|release-build)\s*$/mi);
  if (!match) fail("tasks/todo.md must declare 'Tryb zmiany: code-change|audit-only|release-build'.");
  return match[1];
}

function allowedFiles(txt) {
  const lines = txt.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim() === "Dozwolone pliki do zmiany:");
  if (start === -1) return [];

  const allowed = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line) || (allowed.length && !line.trim())) break;

    const bullet = line.match(/^\s*-\s+(.+?)\s*$/);
    if (bullet) {
      allowed.push(normalize(bullet[1]));
    } else if (/^[A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż][^:]{0,80}:\s*/.test(line.trim())) {
      break;
    }
  }
  return allowed;
}

function matches(file, allowed) {
  if (file === allowed) return true;
  if (allowed.endsWith("/**")) return file.startsWith(allowed.slice(0, -2));
  if (allowed.endsWith("/")) return file.startsWith(allowed);
  return false;
}

const txt = taskText();
const mode = changeMode(txt);
const files = Array.from(new Set(changedFiles())).sort();

if (mode === "audit-only") {
  const id = txt.match(/^Task ID: (\d{4}-\d{2}-\d{2}-[a-z0-9-]+)\r?$/m)?.[1];
  const archive = id && `tasks/archive/${id}.md`;
  const outsideAudit = files.filter(file => file !== "tasks/todo.md" && file !== archive);
  if (outsideAudit.length) fail(`audit-only task cannot change files: ${outsideAudit.join(", ")}`);
  console.log("check:scope PASS - audit-only, task metadata only");
  process.exit(0);
}

if (!files.length) {
  console.log(`check:scope PASS - ${mode} with no changed files`);
  process.exit(0);
}

const artifactFiles = files.filter(file => file === "artifacts" || file.startsWith("artifacts/"));
if (artifactFiles.length && mode !== "release-build") {
  fail(`artifacts/** changes require 'Tryb zmiany: release-build': ${artifactFiles.join(", ")}`);
}

const allowed = allowedFiles(txt);
if (!allowed.length) {
  fail(
    "code changes require 'Dozwolone pliki do zmiany' allowlist in tasks/todo.md.",
    `Changed files: ${files.join(", ")}`
  );
}

const outsideScope = files.filter(file => !allowed.some(pattern => matches(file, pattern)));
if (outsideScope.length) {
  fail(`Changed files outside scope lock: ${outsideScope.join(", ")}`, `Allowed files: ${allowed.join(", ")}`);
}

console.log(`check:scope PASS - ${files.length} changed files inside scope lock`);
