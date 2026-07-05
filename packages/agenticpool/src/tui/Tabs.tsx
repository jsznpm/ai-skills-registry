import React from "react";
import { Box, Text } from "ink";
import { TABS, type TabKey } from "./types.js";

export function Tabs({
  active,
  counts,
}: {
  active: TabKey;
  counts: Record<TabKey, number>;
}) {
  return (
    <Box gap={2}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Text key={t.key} color="cyan" bold={isActive} inverse={isActive} dimColor={!isActive}>
            {" "}
            {t.label} ({counts[t.key]}){" "}
          </Text>
        );
      })}
    </Box>
  );
}
