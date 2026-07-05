import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import type { ResourceEntry } from "../registry.js";
import { installResource } from "../installer.js";
import { Tabs } from "./Tabs.js";
import { ResourceList } from "./ResourceList.js";
import { InstallProgress } from "./InstallProgress.js";
import { Footer } from "./Footer.js";
import {
  TABS,
  PAGE_SIZE,
  type TabKey,
  type TabState,
  type Phase,
  type InstallRowState,
} from "./types.js";

function resourceKey(r: { type: string; name: string }): string {
  return `${r.type}:${r.name}`;
}

export function App({
  resources,
  onExit,
}: {
  resources: ResourceEntry[];
  onExit: (installed: ResourceEntry[]) => void;
}) {
  const byTab = useMemo(() => {
    const m = {} as Record<TabKey, ResourceEntry[]>;
    for (const t of TABS) m[t.key] = resources.filter((r) => r.type === t.key);
    return m;
  }, [resources]);

  const byKey = useMemo(() => {
    const m = new Map<string, ResourceEntry>();
    for (const r of resources) m.set(resourceKey(r), r);
    return m;
  }, [resources]);

  const [activeTab, setActiveTab] = useState<TabKey>(TABS[0]!.key);
  const [perTab, setPerTab] = useState<Record<TabKey, TabState>>(() => {
    const m = {} as Record<TabKey, TabState>;
    for (const t of TABS) m[t.key] = { page: 0, cursor: 0 };
    return m;
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("browse");
  const [installRows, setInstallRows] = useState<InstallRowState[]>([]);

  const activeResources = byTab[activeTab];
  const tabState = perTab[activeTab];
  const pageCount = Math.max(1, Math.ceil(activeResources.length / PAGE_SIZE));
  const pageStart = tabState.page * PAGE_SIZE;
  const pageSlice = activeResources.slice(pageStart, pageStart + PAGE_SIZE);

  function updateTab(key: TabKey, patch: Partial<TabState>) {
    setPerTab((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function switchTab(dir: 1 | -1) {
    const idx = TABS.findIndex((t) => t.key === activeTab);
    const next = (idx + dir + TABS.length) % TABS.length;
    setActiveTab(TABS[next]!.key);
  }

  useInput((input, key) => {
    if (phase === "done") {
      const installed = installRows
        .filter((r) => r.status === "done")
        .map((r) => byKey.get(r.key))
        .filter((r): r is ResourceEntry => Boolean(r));
      onExit(installed);
      return;
    }

    if (phase === "installing") return; // ignore all keys while installing

    if (key.ctrl && input === "c") {
      onExit([]);
      return;
    }
    if (input === "q" || key.escape) {
      onExit([]);
      return;
    }

    if (key.tab || key.leftArrow || key.rightArrow) {
      switchTab(key.tab && key.shift ? -1 : key.leftArrow ? -1 : 1);
      return;
    }

    if (key.upArrow || key.downArrow) {
      const len = pageSlice.length;
      if (len === 0) return;
      const cur = tabState.cursor;
      const next = key.upArrow ? (cur > 0 ? cur - 1 : len - 1) : cur < len - 1 ? cur + 1 : 0;
      updateTab(activeTab, { cursor: next });
      return;
    }

    if (input === "[" || input === "]" || key.pageUp || key.pageDown) {
      const dir = input === "[" || key.pageUp ? -1 : 1;
      const next = (tabState.page + dir + pageCount) % pageCount;
      updateTab(activeTab, { page: next, cursor: 0 });
      return;
    }

    if (input === " ") {
      const item = pageSlice[tabState.cursor];
      if (!item) return;
      const k = resourceKey(item);
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      return;
    }

    if (input === "a") {
      const keys = activeResources.map(resourceKey);
      const allSelected = keys.length > 0 && keys.every((k) => selected.has(k));
      setSelected((prev) => {
        const next = new Set(prev);
        if (allSelected) keys.forEach((k) => next.delete(k));
        else keys.forEach((k) => next.add(k));
        return next;
      });
      return;
    }

    if (key.return) {
      if (selected.size === 0) return;
      const entries = [...selected]
        .map((k) => byKey.get(k))
        .filter((r): r is ResourceEntry => Boolean(r));
      setInstallRows(
        entries.map((e) => ({
          key: resourceKey(e),
          label: `${e.type}:${e.name}@${e.version}`,
          status: "pending",
          filesDone: 0,
          filesTotal: e.files.length,
        }))
      );
      setPhase("installing");
      return;
    }
  });

  useEffect(() => {
    if (phase !== "installing") return;
    let cancelled = false;

    async function run() {
      const cwd = process.cwd();
      for (const k of [...selected]) {
        const entry = byKey.get(k);
        if (!entry || cancelled) continue;
        setInstallRows((prev) =>
          prev.map((r) => (r.key === k ? { ...r, status: "installing" } : r))
        );
        try {
          await installResource(cwd, entry, () => {
            setInstallRows((prev) =>
              prev.map((r) => (r.key === k ? { ...r, filesDone: r.filesDone + 1 } : r))
            );
          });
          if (cancelled) return;
          setInstallRows((prev) =>
            prev.map((r) => (r.key === k ? { ...r, status: "done" } : r))
          );
        } catch (err) {
          if (cancelled) return;
          setInstallRows((prev) =>
            prev.map((r) =>
              r.key === k ? { ...r, status: "error", error: String((err as Error).message ?? err) } : r
            )
          );
        }
      }
      if (!cancelled) setPhase("done");
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const counts = {} as Record<TabKey, number>;
  for (const t of TABS) counts[t.key] = byTab[t.key].length;

  return (
    <Box flexDirection="column">
      <Tabs active={activeTab} counts={counts} />
      {phase === "browse" && (
        <ResourceList
          resources={activeResources}
          page={tabState.page}
          cursor={tabState.cursor}
          selected={selected}
        />
      )}
      {phase !== "browse" && <InstallProgress rows={installRows} phase={phase} />}
      <Box marginTop={1}>
        <Footer phase={phase} selectedCount={selected.size} />
      </Box>
    </Box>
  );
}
