import React from "react";
import { render } from "ink";
import type { ResourceEntry } from "../registry.js";
import { App } from "./App.js";

/**
 * Renders the full-screen Ink picker/installer. Resolves with the resources
 * that were actually installed (empty array if the user cancelled or selected
 * nothing). Requires a TTY — callers must check beforehand.
 */
export function runInstallTui(resources: ResourceEntry[]): Promise<ResourceEntry[]> {
  return new Promise((resolve) => {
    const instance = render(
      React.createElement(App, {
        resources,
        onExit: (installed: ResourceEntry[]) => {
          instance.unmount();
          resolve(installed);
        },
      }),
      { exitOnCtrlC: false }
    );
  });
}
