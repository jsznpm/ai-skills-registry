import { fetchRegistry } from "../registry.js";

export async function listCommand(opts: { long?: boolean }): Promise<void> {
  const reg = await fetchRegistry();
  if (reg.skills.length === 0) {
    console.log("No skills in registry.");
    return;
  }
  for (const s of reg.skills) {
    if (opts.long) {
      console.log(`${s.name}@${s.version}  —  ${s.description}`);
    } else {
      console.log(s.name);
    }
  }
}
