import { removeResource, readManifest, splitKey } from "../installer.js";
import { parseSpec } from "../registry.js";

export async function removeCommand(spec: string): Promise<void> {
  const cwd = process.cwd();
  const { type, name } = parseSpec(spec);

  let key: string;
  if (type) {
    key = `${type}:${name}`;
  } else {
    // No type given: resolve a unique installed match, else assume skill.
    const manifest = await readManifest(cwd);
    const matches = Object.keys(manifest.installed).filter(
      (k) => splitKey(k).name === name
    );
    if (matches.length > 1) {
      console.error(
        `✗ "${name}" is ambiguous: ${matches.join(", ")}. Use type:name.`
      );
      process.exitCode = 1;
      return;
    }
    key = matches[0] ?? `skill:${name}`;
  }

  const tracked = await removeResource(cwd, key);
  if (tracked) {
    console.log(`✓ removed ${key}`);
  } else {
    console.log(`! ${key} was not in manifest (removed any stray file/folder).`);
  }
}
