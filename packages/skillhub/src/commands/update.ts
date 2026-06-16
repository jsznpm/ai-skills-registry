import { fetchRegistry, findSkill } from "../registry.js";
import { installSkill, readManifest } from "../installer.js";

export async function updateCommand(name?: string): Promise<void> {
  const cwd = process.cwd();
  const reg = await fetchRegistry();
  const manifest = await readManifest(cwd);

  const names = name ? [name] : Object.keys(manifest.installed);
  if (names.length === 0) {
    console.log("No installed skills to update.");
    return;
  }

  let updated = 0;
  for (const n of names) {
    const installed = manifest.installed[n];
    if (!installed) {
      console.error(`! ${n} is not installed — skipping.`);
      continue;
    }
    const entry = findSkill(reg, n);
    if (!entry) {
      console.error(`! ${n} no longer in registry — skipping.`);
      continue;
    }
    if (entry.version === installed.version) {
      console.log(`= ${n}@${installed.version} up to date`);
      continue;
    }
    console.log(`↑ ${n} ${installed.version} → ${entry.version}`);
    await installSkill(cwd, entry);
    updated++;
  }
  console.log(`\nDone. ${updated} skill(s) updated.`);
}
