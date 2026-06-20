import {
  fetchRegistry,
  findResource,
  parseSpec,
  allResources,
  type ResourceEntry,
} from "../registry.js";
import { installResource } from "../installer.js";
import { targetDir } from "../config.js";
import { pickResources } from "../picker.js";

/** Install a batch of resources, printing progress. Shared with the picker UI. */
export async function installEntries(entries: ResourceEntry[]): Promise<void> {
  const cwd = process.cwd();
  for (const e of entries) {
    console.log(`Installing ${e.type}:${e.name}@${e.version}...`);
    await installResource(cwd, e, (file) => console.log(`  ✓ ${file}`));
    const where =
      e.type === "skill"
        ? `${targetDir(e.type)}/${e.name}`
        : `${targetDir(e.type)}/${e.files[0]}`;
    console.log(`  → ${where}\n`);
  }
  console.log(`Done. ${entries.length} resource(s) installed.`);
}

export async function addCommand(spec?: string): Promise<void> {
  const reg = await fetchRegistry();

  // No spec → interactive multi-select picker.
  if (!spec) {
    if (!process.stdout.isTTY || !process.stdin.isTTY) {
      console.error(
        "✗ no resource specified (run with a name, or use an interactive terminal)."
      );
      process.exitCode = 1;
      return;
    }
    const picked = await pickResources(allResources(reg));
    if (picked.length === 0) {
      console.log("Nothing selected.");
      return;
    }
    await installEntries(picked);
    return;
  }

  const { type, name, version } = parseSpec(spec);

  let entry: ResourceEntry | undefined;
  try {
    entry = findResource(reg, name, type);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exitCode = 1;
    return;
  }

  if (!entry) {
    console.error(`✗ "${name}" not found. Try: skillpool search ${name}`);
    process.exitCode = 1;
    return;
  }

  if (version && version !== entry.version) {
    console.error(
      `✗ version ${version} unavailable. Registry has ${entry.name}@${entry.version}.`
    );
    process.exitCode = 1;
    return;
  }

  await installEntries([entry]);
}
