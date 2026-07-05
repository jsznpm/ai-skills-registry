import { fetchRegistry, findResource, parseSpec } from "../registry.js";

export async function infoCommand(spec: string): Promise<void> {
  const reg = await fetchRegistry();
  const { type, name } = parseSpec(spec);

  let entry;
  try {
    entry = findResource(reg, name, type);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exitCode = 1;
    return;
  }

  if (!entry) {
    console.error(`✗ "${name}" not found.`);
    process.exitCode = 1;
    return;
  }

  console.log(`${entry.type}:${entry.name}@${entry.version}`);
  console.log(entry.description);
  if (entry.author) console.log(`author: ${entry.author}`);
  if (entry.tags.length) console.log(`tags:   ${entry.tags.join(", ")}`);
  console.log(`files:  ${entry.files.length}`);
  for (const f of entry.files) console.log(`  - ${f}`);
}
