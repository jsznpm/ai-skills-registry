import { fetchRegistry, allResources } from "../registry.js";
import type { ResourceType } from "../config.js";

export async function listCommand(opts: {
  long?: boolean;
  type?: ResourceType;
}): Promise<void> {
  const reg = await fetchRegistry();
  let resources = allResources(reg);
  if (opts.type) resources = resources.filter((r) => r.type === opts.type);

  if (resources.length === 0) {
    console.log("No resources in registry.");
    return;
  }

  // --long, or non-interactive (piped/CI): plain one-per-line output.
  if (opts.long || !process.stdout.isTTY || !process.stdin.isTTY) {
    for (const r of resources) {
      if (opts.long) {
        console.log(`${r.type.padEnd(7)} ${r.name}@${r.version}  —  ${r.description}`);
      } else {
        console.log(`${r.type.padEnd(7)} ${r.name}`);
      }
    }
    return;
  }

  // Interactive: full-screen Ink picker/installer.
  const { runInstallTui } = await import("../tui/runInstallTui.js");
  const installed = await runInstallTui(resources);
  if (installed.length === 0) {
    console.log("Nothing installed.");
    return;
  }
  console.log(`Done. ${installed.length} resource(s) installed.`);
}
