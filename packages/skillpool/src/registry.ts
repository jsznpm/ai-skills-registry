import { readFile } from "node:fs/promises";
import {
  getRegistrySource,
  isRemote,
  sourceUrl,
  type ResourceType,
} from "./config.js";

/** One installable resource (skill, command, or agent). */
export interface ResourceEntry {
  type: ResourceType;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  /** Folder within the registry source that holds this resource's files. */
  path: string;
  /** Files belonging to this resource, relative to `path`. */
  files: string[];
}

/** Back-compat alias — skills used to be the only entry type. */
export type SkillEntry = ResourceEntry;

export interface Registry {
  generatedAt: string;
  count: number;
  counts?: { skills: number; commands: number; agents: number };
  skills: ResourceEntry[];
  commands?: ResourceEntry[];
  agents?: ResourceEntry[];
}

/** Read a text resource from the active registry source (url or local path). */
export async function readSource(...parts: string[]): Promise<string> {
  const target = sourceUrl(...parts);
  if (isRemote(getRegistrySource())) {
    const res = await fetch(target);
    if (!res.ok) {
      throw new Error(`fetch failed ${res.status} ${res.statusText}: ${target}`);
    }
    return res.text();
  }
  return readFile(target, "utf8");
}

export async function fetchRegistry(): Promise<Registry> {
  let raw: string;
  try {
    raw = await readSource("registry.json");
  } catch (err) {
    throw new Error(
      `could not read registry.json from ${getRegistrySource()} (${(err as Error).message})`
    );
  }
  const reg = JSON.parse(raw) as Registry;
  if (!Array.isArray(reg.skills)) {
    throw new Error("registry.json malformed: missing skills[]");
  }
  // Normalize: older registries only had `skills`. Ensure each entry carries a
  // `type` so the rest of the CLI can rely on it.
  for (const s of reg.skills) s.type ??= "skill";
  for (const c of reg.commands ?? []) c.type ??= "command";
  for (const a of reg.agents ?? []) a.type ??= "agent";
  return reg;
}

/** All resources across every type, in a stable order. */
export function allResources(reg: Registry): ResourceEntry[] {
  return [...reg.skills, ...(reg.commands ?? []), ...(reg.agents ?? [])];
}

/**
 * Find a resource by name, optionally constrained to a type. Throws when the
 * name is ambiguous across types (caller must then disambiguate with `type:name`).
 */
export function findResource(
  reg: Registry,
  name: string,
  type?: ResourceType
): ResourceEntry | undefined {
  const matches = allResources(reg).filter(
    (r) => r.name === name && (!type || r.type === type)
  );
  if (matches.length > 1) {
    const opts = matches.map((m) => `${m.type}:${m.name}`).join(", ");
    throw new Error(
      `"${name}" is ambiguous across types. Use one of: ${opts}`
    );
  }
  return matches[0];
}

/** Back-compat: skill-only lookup. */
export function findSkill(reg: Registry, name: string): ResourceEntry | undefined {
  return reg.skills.find((s) => s.name === name);
}

/** Fetch one file belonging to a resource. */
export function fetchResourceFile(
  entry: ResourceEntry,
  file: string
): Promise<string> {
  return readSource(entry.path, file);
}

/** Back-compat alias. */
export const fetchSkillFile = fetchResourceFile;

/** Parse "name", "name@1.2.0", "type:name", or "type:name@1.2.0". */
export function parseSpec(spec: string): {
  type?: ResourceType;
  name: string;
  version?: string;
} {
  let rest = spec;
  let type: ResourceType | undefined;

  const colon = rest.indexOf(":");
  if (colon > 0) {
    const maybeType = rest.slice(0, colon);
    if (maybeType === "skill" || maybeType === "command" || maybeType === "agent") {
      type = maybeType;
      rest = rest.slice(colon + 1);
    }
  }

  const at = rest.lastIndexOf("@");
  if (at > 0) {
    return { type, name: rest.slice(0, at), version: rest.slice(at + 1) };
  }
  return { type, name: rest };
}
