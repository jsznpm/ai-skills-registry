import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { color } from "./colors.js";

export const BANNER = color.cyan(`
 █████   ██████  ███████ ███    ██ ████████ ██████   ██████   ██████  ██
██   ██ ██       ██      ████   ██    ██    ██   ██ ██    ██ ██    ██ ██
███████ ██   ███ █████   ██ ██  ██    ██    ██████  ██    ██ ██    ██ ██
██   ██ ██    ██ ██      ██  ██ ██    ██    ██       ██    ██ ██    ██ ██
██   ██  ██████  ███████ ██   ████    ██    ██        ██████   ██████  ███████`) +
  color.dim("\n  agentpool — Ink TUI edition\n");

export function printBanner(): void {
  console.log(BANNER);
}

/** Marker file proving the banner has been shown once on this machine. */
const SEEN_MARKER = join(homedir(), ".agentpool", "seen");

/** Print the banner the very first time the CLI runs, then never again. */
export function showBannerOnce(): void {
  if (existsSync(SEEN_MARKER)) return;
  // stderr so piping `agentpool list | …` stays clean on the first run too.
  console.error(BANNER);
  try {
    mkdirSync(join(homedir(), ".agentpool"), { recursive: true });
    writeFileSync(SEEN_MARKER, new Date().toISOString(), "utf8");
  } catch {
    // non-fatal: if we can't write the marker, banner just shows again next run
  }
}
