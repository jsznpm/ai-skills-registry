import { readFile } from "node:fs/promises";
import { getRegistrySource, isRemote, sourceUrl } from "./config.js";

export interface SkillEntry {
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  path: string;
  files: string[];
}

export interface Registry {
  generatedAt: string;
  count: number;
  skills: SkillEntry[];
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
  return reg;
}

/** Fetch one file belonging to a skill. */
export function fetchSkillFile(entry: SkillEntry, file: string): Promise<string> {
  return readSource(entry.path, file);
}

export function findSkill(reg: Registry, name: string): SkillEntry | undefined {
  return reg.skills.find((s) => s.name === name);
}

/** Parse "name" or "name@1.2.0" -> { name, version? } */
export function parseSpec(spec: string): { name: string; version?: string } {
  const at = spec.lastIndexOf("@");
  if (at > 0) return { name: spec.slice(0, at), version: spec.slice(at + 1) };
  return { name: spec };
}
