import { emitKeypressEvents } from "node:readline";
import { fetchRegistry, type SkillEntry } from "../registry.js";
import { color } from "../colors.js";

export async function listCommand(opts: { long?: boolean }): Promise<void> {
  const reg = await fetchRegistry();
  if (reg.skills.length === 0) {
    console.log("No skills in registry.");
    return;
  }

  // --long, or non-interactive (piped/CI): keep the plain one-per-line output.
  if (opts.long || !process.stdout.isTTY || !process.stdin.isTTY) {
    for (const s of reg.skills) {
      if (opts.long) console.log(`${s.name}@${s.version}  —  ${s.description}`);
      else console.log(s.name);
    }
    return;
  }

  await interactiveGrid(reg.skills);
}

/** Number of columns that fit, and the padded width of each cell. */
function layout(skills: SkillEntry[]) {
  const longest = skills.reduce((m, s) => Math.max(m, s.name.length), 0);
  const cellWidth = longest + 2; // gap between columns
  const termWidth = process.stdout.columns || 80;
  const cols = Math.max(1, Math.floor(termWidth / cellWidth));
  return { cols, cellWidth };
}

function render(skills: SkillEntry[], selected: number): void {
  const { cols, cellWidth } = layout(skills);
  const rows = Math.ceil(skills.length / cols);

  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= skills.length) break;
      const name = skills[i].name;
      const cell = name.padEnd(cellWidth);
      line += i === selected ? color.selected(name) + " ".repeat(cellWidth - name.length) : cell;
    }
    lines.push(line);
  }

  const sel = skills[selected];
  const footer =
    color.bold(sel.name) +
    color.gray(`@${sel.version}`) +
    "  " +
    color.dim(sel.description);
  const help = color.gray("↑↓←→ move · enter info · q quit");

  // Clear screen, home cursor, draw.
  process.stdout.write("\x1b[2J\x1b[H");
  process.stdout.write(color.cyan(`skills (${skills.length})\n\n`));
  process.stdout.write(lines.join("\n") + "\n\n");
  process.stdout.write(footer + "\n" + help + "\n");
}

function interactiveGrid(skills: SkillEntry[]): Promise<void> {
  return new Promise((resolve) => {
    let selected = 0;
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

    const onKey = (
      _str: string,
      key: { name?: string; ctrl?: boolean }
    ) => {
      const { cols } = layout(skills);
      const last = skills.length - 1;

      if (key.ctrl && key.name === "c") {
        cleanup();
        resolve();
        return;
      }
      switch (key.name) {
        case "left":
          selected = Math.max(0, selected - 1);
          break;
        case "right":
          selected = Math.min(last, selected + 1);
          break;
        case "up":
          if (selected - cols >= 0) selected -= cols;
          break;
        case "down":
          if (selected + cols <= last) selected += cols;
          break;
        case "return":
        case "enter": {
          const s = skills[selected];
          cleanup();
          console.log(color.bold(`${s.name}@${s.version}`));
          console.log(s.description);
          if (s.tags.length) console.log(color.gray(`tags: ${s.tags.join(", ")}`));
          console.log(color.green(`\nInstall: skillpool add ${s.name}`));
          resolve();
          return;
        }
        case "q":
        case "escape":
          cleanup();
          resolve();
          return;
        default:
          return;
      }
      render(skills, selected);
    };

    stdin.on("keypress", onKey);
    render(skills, selected);
  });
}
