import React from "react";
import { Box, Text } from "ink";
import type { InstallRowState, Phase } from "./types.js";

export function InstallProgress({
  rows,
  phase,
}: {
  rows: InstallRowState[];
  phase: Phase;
}) {
  const done = rows.filter((r) => r.status === "done").length;
  return (
    <Box flexDirection="column" marginTop={1}>
      {rows.map((r) => (
        <Box key={r.key}>
          <Text color={r.status === "error" ? "red" : r.status === "done" ? "green" : "yellow"}>
            {r.status === "done" ? "✓" : r.status === "error" ? "✗" : r.status === "installing" ? "…" : " "}
          </Text>
          <Text> {r.label}</Text>
          {r.status === "installing" && (
            <Text dimColor>
              {" "}
              ({r.filesDone}/{r.filesTotal} files)
            </Text>
          )}
          {r.status === "error" && <Text color="red"> — {r.error}</Text>}
        </Box>
      ))}
      {phase === "done" && (
        <Box marginTop={1} flexDirection="column">
          <Text color="cyan">
            Done. {done}/{rows.length} installed.
          </Text>
          <Text dimColor>press any key to exit</Text>
        </Box>
      )}
    </Box>
  );
}
