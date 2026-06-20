import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  SKILLS_DIR,
  MANIFEST_FILE,
  targetDir,
  type ResourceType,
} from "./config.js";
import { fetchResourceFile, type ResourceEntry } from "./registry.js";

export interface InstalledResource {
  type: ResourceType;
  version: string;
  files: string[];
  installedAt: string;
}

/** Back-compat alias. */
export type InstalledSkill = InstalledResource;

export interface Manifest {
  /** Keyed by namespaced id, e.g. "skill:docx", "command:commit". */
  installed: Record<string, InstalledResource>;
}

const TYPES: ResourceType[] = ["skill", "command", "agent"];

/** Namespaced manifest key for a resource. */
export function resourceKey(r: { type: ResourceType; name: string }): string {
  return `${r.type}:${r.name}`;
}

/** Split a manifest key back into its parts. Defaults to skill when unprefixed. */
export function splitKey(key: string): { type: ResourceType; name: string } {
  const colon = key.indexOf(":");
  if (colon > 0) {
    const maybe = key.slice(0, colon) as ResourceType;
    if (TYPES.includes(maybe)) return { type: maybe, name: key.slice(colon + 1) };
  }
  return { type: "skill", name: key };
}

function manifestPath(cwd: string): string {
  return join(cwd, SKILLS_DIR, MANIFEST_FILE);
}

export async function readManifest(cwd: string): Promise<Manifest> {
  try {
    const raw = await readFile(manifestPath(cwd), "utf8");
    const m = JSON.parse(raw) as Manifest;
    if (!m.installed) m.installed = {};
    return migrate(m);
  } catch {
    return { installed: {} };
  }
}

/**
 * Migrate legacy manifests: entries used to be keyed by bare skill name with no
 * `type` field. Re-key them as `skill:<name>` and stamp `type: "skill"`.
 */
function migrate(m: Manifest): Manifest {
  const out: Manifest = { installed: {} };
  for (const [key, entry] of Object.entries(m.installed)) {
    const { type, name } = splitKey(key);
    out.installed[`${type}:${name}`] = { ...entry, type: entry.type ?? type };
  }
  return out;
}

async function writeManifest(cwd: string, manifest: Manifest): Promise<void> {
  await mkdir(join(cwd, SKILLS_DIR), { recursive: true });
  await writeFile(
    manifestPath(cwd),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );
}

/** Absolute destination path for a single file of a resource. */
function destPath(cwd: string, entry: ResourceEntry, file: string): string {
  const base = join(cwd, targetDir(entry.type));
  // Skills live in a per-skill folder; single-file resources land directly.
  return entry.type === "skill"
    ? join(base, entry.name, file)
    : join(base, file);
}

/**
 * Download every file of a resource to its install target and record it in the
 * manifest. Reports progress via onFile. Returns the installed file list.
 */
export async function installResource(
  cwd: string,
  entry: ResourceEntry,
  onFile?: (file: string) => void
): Promise<string[]> {
  for (const file of entry.files) {
    const content = await fetchResourceFile(entry, file);
    const filePath = destPath(cwd, entry, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
    onFile?.(file);
  }

  const manifest = await readManifest(cwd);
  manifest.installed[resourceKey(entry)] = {
    type: entry.type,
    version: entry.version,
    files: entry.files,
    installedAt: new Date().toISOString(),
  };
  await writeManifest(cwd, manifest);

  return entry.files;
}

/** Back-compat alias. */
export const installSkill = installResource;

/**
 * Remove an installed resource and drop it from the manifest. `key` is a
 * namespaced id ("type:name"); a bare name is treated as a skill.
 */
export async function removeResource(cwd: string, key: string): Promise<boolean> {
  const manifest = await readManifest(cwd);
  const { type, name } = splitKey(key);
  const fullKey = `${type}:${name}`;
  const tracked = manifest.installed[fullKey];

  if (type === "skill") {
    await rm(join(cwd, SKILLS_DIR, name), { recursive: true, force: true });
  } else {
    // Single-file resource: remove the tracked file(s), or fall back to <name>.md.
    const files = tracked?.files ?? [`${name}.md`];
    for (const file of files) {
      await rm(join(cwd, targetDir(type), file), { force: true });
    }
  }

  if (tracked) {
    delete manifest.installed[fullKey];
    await writeManifest(cwd, manifest);
    return true;
  }
  return false;
}

/** Back-compat: remove a skill by bare name. */
export function removeSkill(cwd: string, name: string): Promise<boolean> {
  return removeResource(cwd, `skill:${name}`);
}
