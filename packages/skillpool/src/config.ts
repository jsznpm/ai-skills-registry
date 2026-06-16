import { resolve } from "node:path";

/**
 * Where the registry lives. Resolution order:
 *   1. --registry <url|path>   (CLI flag, set via setRegistry)
 *   2. SKILLPOOL_REGISTRY env  (url or local folder path — great for testing)
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
  const src = override ?? process.env.SKILLPOOL_REGISTRY ?? DEFAULT_REGISTRY;
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

/** Install target inside the user's project. */
export const SKILLS_DIR = ".skills";
export const MANIFEST_FILE = "manifest.json";
