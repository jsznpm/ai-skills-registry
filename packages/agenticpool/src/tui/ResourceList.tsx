import React from "react";
import { Box, Text } from "ink";
import type { ResourceEntry } from "../registry.js";
import { PAGE_SIZE } from "./types.js";

export function ResourceList({
  resources,
  page,
  cursor,
  selected,
}: {
  resources: ResourceEntry[];
  page: number;
  cursor: number;
  selected: Set<string>;
}) {
  const pageCount = Math.max(1, Math.ceil(resources.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const slice = resources.slice(start, start + PAGE_SIZE);
  const current = slice[cursor];

  if (resources.length === 0) {
    return (
      <Box marginTop={1}>
        <Text dimColor>No resources of this type.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {slice.map((r, i) => {
        const key = `${r.type}:${r.name}`;
        const isCursor = i === cursor;
        const box = selected.has(key) ? <Text color="green">[x]</Text> : <Text>[ ]</Text>;
        return (
          <Box key={key}>
            <Text color="cyan">{isCursor ? "› " : "  "}</Text>
            {box}
            <Text> </Text>
            <Text inverse={isCursor}>{r.name}</Text>
            <Text dimColor>{"  "}v{r.version}</Text>
          </Box>
        );
      })}
      <Box marginTop={1} flexDirection="column">
        {current && <Text dimColor>{current.description}</Text>}
        <Text dimColor>
          page {page + 1}/{pageCount}
        </Text>
      </Box>
    </Box>
  );
}
