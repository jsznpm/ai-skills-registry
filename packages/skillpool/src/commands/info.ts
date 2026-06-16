import { fetchRegistry, findSkill } from "../registry.js";

export async function infoCommand(name: string): Promise<void> {
  const reg = await fetchRegistry();
  const entry = findSkill(reg, name);

  if (!entry) {
    console.error(`✗ skill "${name}" not found.`);
    process.exitCode = 1;
    return;
  }

  console.log(`${entry.name}@${entry.version}`);
  console.log(entry.description);
  if (entry.author) console.log(`author: ${entry.author}`);
  if (entry.tags.length) console.log(`tags:   ${entry.tags.join(", ")}`);
  console.log(`files:  ${entry.files.length}`);
  for (const f of entry.files) console.log(`  - ${f}`);
}
