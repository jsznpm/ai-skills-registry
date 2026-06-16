import { removeSkill } from "../installer.js";

export async function removeCommand(name: string): Promise<void> {
  const tracked = await removeSkill(process.cwd(), name);
  if (tracked) {
    console.log(`✓ removed ${name} → .skills/${name}`);
  } else {
    console.log(`! ${name} was not in manifest (removed any stray folder).`);
  }
}
