import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SKILLS_DIR, MANIFEST_FILE } from "./config.js";
import { fetchSkillFile, type SkillEntry } from "./registry.js";

export interface InstalledSkill {
  version: string;
  files: string[];
  installedAt: string;
}

export interface Manifest {
  installed: Record<string, InstalledSkill>;
}

function manifestPath(cwd: string): string {
  return join(cwd, SKILLS_DIR, MANIFEST_FILE);
}

export async function readManifest(cwd: string): Promise<Manifest> {
  try {
    const raw = await readFile(manifestPath(cwd), "utf8");
    const m = JSON.parse(raw) as Manifest;
    if (!m.installed) m.installed = {};
    return m;
  } catch {
    return { installed: {} };
  }
}

async function writeManifest(cwd: string, manifest: Manifest): Promise<void> {
  await mkdir(join(cwd, SKILLS_DIR), { recursive: true });
  await writeFile(manifestPath(cwd), JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

/**
 * Download every file of a skill into .skills/<name>/ and record it in the
 * manifest. Reports progress via onFile. Returns the installed file list.
 */
export async function installSkill(
  cwd: string,
  entry: SkillEntry,
  onFile?: (file: string) => void
): Promise<string[]> {
  const dest = join(cwd, SKILLS_DIR, entry.name);
  await mkdir(dest, { recursive: true });

  for (const file of entry.files) {
    const content = await fetchSkillFile(entry, file);
    const filePath = join(dest, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
    onFile?.(file);
  }

  const manifest = await readManifest(cwd);
  manifest.installed[entry.name] = {
    version: entry.version,
    files: entry.files,
    installedAt: new Date().toISOString(),
  };
  await writeManifest(cwd, manifest);

  return entry.files;
}

/** Remove a skill folder and drop it from the manifest. */
export async function removeSkill(cwd: string, name: string): Promise<boolean> {
  const manifest = await readManifest(cwd);
  const wasTracked = Boolean(manifest.installed[name]);

  await rm(join(cwd, SKILLS_DIR, name), { recursive: true, force: true });

  if (wasTracked) {
    delete manifest.installed[name];
    await writeManifest(cwd, manifest);
  }
  return wasTracked;
}
