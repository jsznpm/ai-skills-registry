import { fetchRegistry, findSkill, parseSpec } from "../registry.js";
import { installSkill } from "../installer.js";
import { SKILLS_DIR } from "../config.js";

export async function addCommand(spec: string): Promise<void> {
  const { name, version } = parseSpec(spec);
  const reg = await fetchRegistry();
  const entry = findSkill(reg, name);

  if (!entry) {
    console.error(`✗ skill "${name}" not found. Try: skillpool search ${name}`);
    process.exitCode = 1;
    return;
  }

  if (version && version !== entry.version) {
    console.error(
      `✗ version ${version} unavailable. Registry has ${name}@${entry.version}.`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Installing ${entry.name}@${entry.version}...\n`);
  await installSkill(process.cwd(), entry, (file) => {
    console.log(`✓ ${file}`);
  });
  console.log(`\nDone. → ${SKILLS_DIR}/${entry.name}`);
}
