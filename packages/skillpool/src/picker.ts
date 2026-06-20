import { emitKeypressEvents } from "node:readline";
import { color } from "./colors.js";
import type { ResourceEntry } from "./registry.js";

/**
 * Interactive multi-select list across all resource types. Returns the chosen
 * entries (empty if cancelled). Requires a TTY — callers must check beforehand.
 *
 *   ↑↓ move · space toggle · a toggle-all · enter confirm · q/esc cancel
 */
export function pickResources(
  resources: ResourceEntry[]
): Promise<ResourceEntry[]> {
  return new Promise((resolve) => {
    let cursor = 0;
    const checked = new Set<number>();
    const { stdin } = process;
    emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.removeListener("keypress", onKey);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\x1b[2J\x1b[H");
    };

    const onKey = (_str: string, key: { name?: string; ctrl?: boolean }) => {
      const last = resources.length - 1;

      if (key.ctrl && key.name === "c") {
        cleanup();
        resolve([]);
        return;
      }
      switch (key.name) {
        case "up":
          cursor = cursor > 0 ? cursor - 1 : last;
          break;
        case "down":
          cursor = cursor < last ? cursor + 1 : 0;
          break;
        case "space":
          if (checked.has(cursor)) checked.delete(cursor);
          else checked.add(cursor);
          break;
        case "a":
          if (checked.size === resources.length) checked.clear();
          else resources.forEach((_, i) => checked.add(i));
          break;
        case "return":
        case "enter":
          cleanup();
          resolve(
            [...checked].sort((a, b) => a - b).map((i) => resources[i]!)
          );
          return;
        case "q":
        case "escape":
          cleanup();
          resolve([]);
          return;
        default:
          return;
      }
      render();
    };

    const tagWidth = 7; // "command".length

    function render(): void {
      const current = resources[cursor]!;
      const lines = resources.map((r, i) => {
        const box = checked.has(i) ? color.green("[x]") : "[ ]";
        const tag = color.gray(r.type.padEnd(tagWidth));
        const name = i === cursor ? color.selected(r.name) : r.name;
        const caret = i === cursor ? color.cyan("›") : " ";
        return `${caret} ${box} ${tag} ${name}`;
      });

      process.stdout.write("\x1b[2J\x1b[H");
      process.stdout.write(
        color.cyan(`resources (${resources.length}) — ${checked.size} selected\n\n`)
      );
      process.stdout.write(lines.join("\n") + "\n\n");
      process.stdout.write(color.dim(current.description) + "\n");
      process.stdout.write(
        color.gray("↑↓ move · space select · a all · enter install · q quit") + "\n"
      );
    }

    stdin.on("keypress", onKey);
    render();
  });
}
