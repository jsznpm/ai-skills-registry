#!/usr/bin/env node
/**
 * build-registry.mjs
 *
 * Scans skills/<name>/ folders, reads each skill.json, collects the full file
 * list of every skill folder, and writes a flat registry.json at repo root.
 *
 * The CLI reads registry.json from GitHub raw at runtime. Because we record the
 * `files` array per skill here, the CLI never needs the GitHub API to list a
 * folder — it fetches each file by raw URL directly.
 *
 * Run after adding/editing any skill:
 *   node scripts/build-registry.mjs
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const OUT = join(ROOT, "registry.json");

/** Recursively list files inside a skill folder, returned as POSIX paths
 *  relative to that folder (so nested files like rules/foo.md also work). */
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

async function main() {
  if (!(await isDir(SKILLS_DIR))) {
    throw new Error(`skills/ folder not found at ${SKILLS_DIR}`);
  }

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
      console.warn(`! skipping ${entry.name}: missing/invalid skill.json (${err.message})`);
      continue;
    }

    if (manifest.name && manifest.name !== entry.name) {
      console.warn(
        `! ${entry.name}: skill.json name "${manifest.name}" != folder name. Using folder name.`
      );
    }

    const files = await listFiles(skillDir);

    skills.push({
      name: entry.name,
      version: manifest.version ?? "0.0.0",
      description: manifest.description ?? "",
      author: manifest.author ?? "",
      tags: Array.isArray(manifest.tags) ? manifest.tags : [],
      path: `skills/${entry.name}`,
      files,
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const registry = {
    generatedAt: new Date().toISOString(),
    count: skills.length,
    skills,
  };

  await writeFile(OUT, JSON.stringify(registry, null, 2) + "\n", "utf8");
  console.log(`✓ registry.json written — ${skills.length} skill(s)`);
  for (const s of skills) console.log(`  - ${s.name}@${s.version} (${s.files.length} files)`);
}

main().catch((err) => {
  console.error("✗ build-registry failed:", err.message);
  process.exit(1);
});
