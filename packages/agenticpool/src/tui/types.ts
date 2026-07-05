import type { ResourceType } from "../config.js";

export type TabKey = ResourceType;

export const TABS: { key: TabKey; label: string }[] = [
  { key: "skill", label: "Skills" },
  { key: "command", label: "Commands" },
  { key: "agent", label: "Agents" },
];

export const PAGE_SIZE = 10;

export type Phase = "browse" | "installing" | "done";

export interface TabState {
  page: number;
  cursor: number;
}

export interface InstallRowState {
  key: string; // "type:name" — same format as installer.ts resourceKey()
  label: string;
  status: "pending" | "installing" | "done" | "error";
  filesDone: number;
  filesTotal: number;
  error?: string;
}
