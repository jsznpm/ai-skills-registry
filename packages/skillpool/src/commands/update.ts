import { fetchRegistry, findResource, parseSpec } from "../registry.js";
import { installResource, readManifest, splitKey } from "../installer.js";

export async function updateCommand(spec?: string): Promise<void> {
  const cwd = process.cwd();
  const reg = await fetchRegistry();
  const manifest = await readManifest(cwd);

  let keys = Object.keys(manifest.installed);

  if (spec) {
    const { type, name } = parseSpec(spec);
    keys = keys.filter((k) => {
      const s = splitKey(k);
      return s.name === name && (!type || s.type === type);
    });
    if (keys.length === 0) {
      console.error(`! ${spec} is not installed — nothing to update.`);
      return;
    }
  }

  if (keys.length === 0) {
    console.log("No installed resources to update.");
    return;
  }

  let updated = 0;
  for (const key of keys) {
    const installed = manifest.installed[key];
    if (!installed) continue;
    const { type, name } = splitKey(key);
    const entry = findResource(reg, name, type);
    if (!entry) {
      console.error(`! ${key} no longer in registry — skipping.`);
      continue;
    }
    if (entry.version === installed.version) {
      console.log(`= ${key}@${installed.version} up to date`);
      continue;
    }
    console.log(`↑ ${key} ${installed.version} → ${entry.version}`);
    await installResource(cwd, entry);
    updated++;
  }
  console.log(`\nDone. ${updated} resource(s) updated.`);
}
