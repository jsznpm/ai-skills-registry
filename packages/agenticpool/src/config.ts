import { resolve } from "node:path";

/**
 * Where the registry lives. Resolution order:
 *   1. --registry <url|path>   (CLI flag, set via setRegistry)
 *   2. AGENTICPOOL_REGISTRY env  (url or local folder path — great for testing)
 *   3. default GitHub raw base
 *
 * A "registry source" is a base location that contains registry.json and the
 * skills/ tree. It can be an http(s) URL or a local filesystem path.
 */
const DEFAULT_REGISTRY =
  "https://raw.githubusercontent.com/jsznpm/ai-skills-registry/main";

let override: string | undefined;

export function setRegistry(value?: string) {
  if (value) override = value;
}

export function getRegistrySource(): string {
  const src = override ?? process.env.AGENTICPOOL_REGISTRY ?? DEFAULT_REGISTRY;
  return src.replace(/\/+$/, "");
}

export function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/** Resolve a path within the registry source (url join or local path join). */
export function sourceUrl(...parts: string[]): string {
  const src = getRegistrySource();
  const tail = parts.map((p) => p.replace(/^\/+|\/+$/g, "")).join("/");
  if (isRemote(src)) return `${src}/${tail}`;
  return resolve(src, ...parts);
}

/** The resource types the registry can hold. */
export type ResourceType = "skill" | "command" | "agent";

/** Base directory for all installed Claude Code resources. */
export const CLAUDE_DIR = ".claude";

/** Install target for skills (also where the manifest lives). */
export const SKILLS_DIR = ".claude/skills";
export const MANIFEST_FILE = "manifest.json";

/** Install target directory for a given resource type, inside the user's project.
 *  skill   -> .claude/skills   (one folder per skill)
 *  command -> .claude/commands (one .md per command)
 *  agent   -> .claude/agents   (one .md per agent)
 */
export function targetDir(type: ResourceType): string {
  switch (type) {
    case "command":
      return `${CLAUDE_DIR}/commands`;
    case "agent":
      return `${CLAUDE_DIR}/agents`;
    case "skill":
    default:
      return SKILLS_DIR;
  }
}
