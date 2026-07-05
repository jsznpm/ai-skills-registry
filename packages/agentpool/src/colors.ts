/** Tiny ANSI helper — no deps. Colors auto-disable when output is not a TTY. */
const ON = process.stdout.isTTY && !process.env.NO_COLOR;

function wrap(open: number, close: number) {
  return (s: string): string => (ON ? `\x1b[${open}m${s}\x1b[${close}m` : s);
}

export const color = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  cyan: wrap(36, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  gray: wrap(90, 39),
  /** highlighted/selected: black text on cyan background */
  selected: (s: string): string =>
    ON ? `\x1b[30;46m${s}\x1b[0m` : `> ${s}`,
};
