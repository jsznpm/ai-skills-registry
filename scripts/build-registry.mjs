#!/usr/bin/env node
/**
 * build-registry.mjs
 *
 * Scans the registry's three resource trees and writes a flat registry.json at
 * repo root:
 *
 *   skills/<name>/    — a folder + skill.json manifest + prompt files
 *   commands/<name>.md — a single Claude Code slash command (YAML frontmatter)
 *   agents/<name>.md   — a single Claude Code subagent     (YAML frontmatter)
 *
 * The CLI reads registry.json from GitHub raw at runtime. Because we record the
 * `files` array per resource here, the CLI never needs the GitHub API to list a
 * folder — it fetches each file by raw URL directly.
 *
 * Run after adding/editing any resource:
 *   node scripts/build-registry.mjs
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "registry.json");

const SKILLS_DIR = join(ROOT, "skills");
const COMMANDS_DIR = join(ROOT, "commands");
const AGENTS_DIR = join(ROOT, "agents");

/** Recursively list files inside a folder, returned as POSIX paths relative to
 *  that folder (so nested files like rules/foo.md also work). */
async function listFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full, base)));
    } else {
      files.push(relative(base, full).split("\\").join("/"));
    }
  }
  return files.sort();
}

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Minimal dependency-free YAML frontmatter parser. Reads the leading
 * `---\n...\n---` block and returns a flat object. Supports `key: value` and
 * inline arrays `key: [a, b]` (also `key: "a, b"` is treated as a string).
 * Quotes around scalars are stripped. Everything after the block is ignored —
 * we only need the metadata here.
 */
function parseFrontmatter(text) {
  const match = /^﻿?---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return {};
  const body = match[1];
  const out = {};
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (!key) continue;

    if (value.startsWith("[") && value.endsWith("]")) {
      out[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => unquote(s.trim()))
        .filter(Boolean);
    } else {
      out[key] = unquote(value);
    }
  }
  return out;
}

function unquote(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

/** Build the skill entries (folder + skill.json). */
async function scanSkills() {
  if (!(await isDir(SKILLS_DIR))) return [];
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(SKILLS_DIR, entry.name);
    const manifestPath = join(skillDir, "skill.json");

    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (err) {
      console.warn(
        `! skipping skill ${entry.name}: missing/invalid skill.json (${err.message})`
      );
      continue;
    }

    if (manifest.name && manifest.name !== entry.name) {
      console.warn(
        `! ${entry.name}: skill.json name "${manifest.name}" != folder name. Using folder name.`
      );
    }

    const files = await listFiles(skillDir);

    skills.push({
      type: "skill",
      name: entry.name,
      version: manifest.version ?? "0.0.0",
      description: manifest.description ?? "",
      author: manifest.author ?? "",
      tags: Array.isArray(manifest.tags) ? manifest.tags : [],
      path: `skills/${entry.name}`,
      files,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build entries for the single-file resource types (commands, agents). Each
 * `*.md` file in the folder is one resource; metadata comes from its YAML
 * frontmatter. `path` is the folder, `files` is the single markdown filename.
 */
async function scanSingleFile(type, dir, folderName) {
  if (!(await isDir(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const fileName = entry.name;
    const fallbackName = basename(fileName, ".md");

    let fm = {};
    try {
      fm = parseFrontmatter(await readFile(join(dir, fileName), "utf8"));
    } catch (err) {
      console.warn(`! ${type} ${fileName}: could not read (${err.message})`);
      continue;
    }

    if (fm.name && fm.name !== fallbackName) {
      console.warn(
        `! ${fileName}: frontmatter name "${fm.name}" != file name. Using file name.`
      );
    }

    out.push({
      type,
      name: fallbackName,
      version: fm.version ?? "0.0.0",
      description: fm.description ?? "",
      author: fm.author ?? "ai-skills-registry",
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      path: folderName,
      files: [fileName],
    });
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const [skills, commands, agents] = await Promise.all([
    scanSkills(),
    scanSingleFile("command", COMMANDS_DIR, "commands"),
    scanSingleFile("agent", AGENTS_DIR, "agents"),
  ]);

  const counts = {
    skills: skills.length,
    commands: commands.length,
    agents: agents.length,
  };
  const total = counts.skills + counts.commands + counts.agents;

  const registry = {
    generatedAt: new Date().toISOString(),
    count: total,
    counts,
    skills,
    commands,
    agents,
  };

  await writeFile(OUT, JSON.stringify(registry, null, 2) + "\n", "utf8");
  console.log(
    `✓ registry.json written — ${total} resource(s): ` +
      `${counts.skills} skill(s), ${counts.commands} command(s), ${counts.agents} agent(s)`
  );
  for (const r of [...skills, ...commands, ...agents]) {
    console.log(`  - [${r.type}] ${r.name}@${r.version} (${r.files.length} file(s))`);
  }
}

main().catch((err) => {
  console.error("✗ build-registry failed:", err.message);
  process.exit(1);
});
