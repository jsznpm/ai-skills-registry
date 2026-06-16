import { removeSkill } from "../installer.js";
import { SKILLS_DIR } from "../config.js";

export async function removeCommand(name: string): Promise<void> {
  const tracked = await removeSkill(process.cwd(), name);
  if (tracked) {
    console.log(`✓ removed ${name} → ${SKILLS_DIR}/${name}`);
  } else {
    console.log(`! ${name} was not in manifest (removed any stray folder).`);
  }
}
