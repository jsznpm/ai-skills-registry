import React from "react";
import { Text } from "ink";
import type { Phase } from "./types.js";

export function Footer({ phase, selectedCount }: { phase: Phase; selectedCount: number }) {
  if (phase === "installing") return <Text dimColor>installing… please wait</Text>;
  if (phase === "done") return <Text dimColor>press any key to exit</Text>;
  return (
    <Text dimColor>
      tab/←→ tabs · ↑↓ move · [ ] page · space select · a select-all (tab) · enter install (
      {selectedCount}) · q quit
    </Text>
  );
}
