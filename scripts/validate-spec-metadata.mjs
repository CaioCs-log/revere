#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const VALID_STATUSES = new Set([
  "draft",
  "ready-for-planning",
  "planned",
  "in-progress",
  "verification",
  "pending-human-approval",
  "done",
  "blocked",
]);

const args = new Set(process.argv.slice(2));
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", cwd: root }).trim();
}

function parseNameStatus(output) {
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.split(/\s+/))
    .filter(([status, ...files]) => status && files.length > 0)
    .map(([status, ...files]) => ({ status, file: files.at(-1) }));
}

function listChangedSpecs() {
  const diffTarget = (() => {
    try {
      git(["rev-parse", "--verify", "origin/main"]);
      return ["diff", "--name-status", "origin/main...HEAD"];
    } catch {
      return ["diff", "--name-status", "HEAD~1...HEAD"];
    }
  })();

  const entries = [
    ...parseNameStatus(git(diffTarget)),
    ...parseNameStatus(git(["diff", "--name-status", "--cached"])),
    ...parseNameStatus(git(["diff", "--name-status"])),
    ...git(["ls-files", "--others", "--exclude-standard"])
      .split("\n")
      .filter(Boolean)
      .map((file) => ({ status: "A", file })),
  ];

  const byFile = new Map();
  for (const entry of entries) {
    const existing = byFile.get(entry.file);
    if (!existing || entry.status.startsWith("A")) {
      byFile.set(entry.file, entry);
    }
  }

  return [...byFile.values()];
}

function listAllSpecs() {
  const output = git(["ls-files", "revere-governance/specs/*.md"]);
  if (!output) return [];
  return output.split("\n").map((file) => ({ status: "tracked", file }));
}

function isSpecFile(file) {
  return (
    file.startsWith("revere-governance/specs/") &&
    file.endsWith(".md") &&
    !file.includes("/historical/") &&
    !file.endsWith("/SPEC-TEMPLATE.md")
  );
}

function frontmatterOf(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  return text.slice(4, end).trim();
}

function valueFor(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;
}

function sectionBlock(frontmatter, section, indent = "") {
  const lines = frontmatter.split("\n");
  const sectionLine = `${indent}${section}:`;
  const start = lines.findIndex((line) => line.trimEnd() === sectionLine);
  if (start === -1) return null;

  const sectionIndent = indent.length;
  const block = [];
  for (const line of lines.slice(start + 1)) {
    const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
    if (line.trim() && currentIndent <= sectionIndent && !line.trimStart().startsWith("-")) {
      break;
    }
    block.push(line);
  }

  return block.join("\n");
}

function hasListValue(frontmatter, section) {
  return Boolean(sectionBlock(frontmatter, section)?.match(/^\s+-\s+\S+/m));
}

function hasNestedListValue(frontmatter, parent, child) {
  const parentBlock = sectionBlock(frontmatter, parent);
  if (!parentBlock) return false;
  return Boolean(sectionBlock(parentBlock, child, "  ")?.match(/^\s+-\s+\S+/m));
}

function validateSpec(entry) {
  const absolute = path.join(root, entry.file);
  if (!existsSync(absolute)) return { status: "skipped", errors: [] };

  const text = readFileSync(absolute, "utf8");
  const frontmatter = frontmatterOf(text);
  const isNew = entry.status.startsWith("A");

  if (!frontmatter) {
    if (isNew) {
      return {
        status: "failed",
        errors: ["SPEC nova precisa ter frontmatter AI-OPS no topo do arquivo."],
      };
    }

    return { status: "skipped", errors: [] };
  }

  const errors = [];
  const id = valueFor(frontmatter, "id");
  const title = valueFor(frontmatter, "title");
  const status = valueFor(frontmatter, "status");
  const owner = valueFor(frontmatter, "owner");

  if (!id || !/^[A-Z]+-[0-9]{3,}$/.test(id)) {
    errors.push("frontmatter.id ausente ou invalido; use algo como SPEC-005.");
  }
  if (!title || title.length < 5) {
    errors.push("frontmatter.title ausente ou muito curto.");
  }
  if (!status || !VALID_STATUSES.has(status)) {
    errors.push(`frontmatter.status ausente ou invalido: ${status ?? "<empty>"}.`);
  }
  if (!owner || owner.length < 2) {
    errors.push("frontmatter.owner ausente.");
  }
  if (!hasNestedListValue(frontmatter, "scope", "allowed_paths")) {
    errors.push("frontmatter.scope.allowed_paths precisa ter ao menos um item.");
  }
  if (!hasNestedListValue(frontmatter, "scope", "forbidden_paths")) {
    errors.push("frontmatter.scope.forbidden_paths precisa ter ao menos um item.");
  }
  if (!hasListValue(frontmatter, "gates")) {
    errors.push("frontmatter.gates precisa ter ao menos um comando.");
  }
  if (!hasListValue(frontmatter, "human_approval_required")) {
    errors.push("frontmatter.human_approval_required precisa ter ao menos um item.");
  }

  return { status: errors.length === 0 ? "ok" : "failed", errors };
}

const entries = (args.has("--all") ? listAllSpecs() : listChangedSpecs()).filter(({ file }) =>
  isSpecFile(file),
);

if (entries.length === 0) {
  console.log("AI-OPS spec validate: no spec files to validate.");
  process.exit(0);
}

let failed = false;
for (const entry of entries) {
  const result = validateSpec(entry);
  if (result.status === "skipped") {
    console.log(`AI-OPS spec validate: SKIP legacy spec without frontmatter: ${entry.file}`);
    continue;
  }

  if (result.status === "ok") {
    console.log(`AI-OPS spec validate: OK ${entry.file}`);
    continue;
  }

  failed = true;
  console.error(`AI-OPS spec validate failed: ${entry.file}`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
}

process.exit(failed ? 1 : 0);
