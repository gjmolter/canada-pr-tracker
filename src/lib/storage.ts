import type { TrackerState } from "./types";

export const STORAGE_KEY = "canada-stay-tracker-v1";
export const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  exportedAt: string;
  state: TrackerState;
}

export function loadState(): TrackerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrackerState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: TrackerState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function serializeBackup(state: TrackerState): string {
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBackup(json: string): TrackerState | null {
  try {
    const payload = JSON.parse(json) as BackupPayload;
    if (payload?.version !== BACKUP_VERSION || !payload.state) return null;
    return payload.state;
  } catch {
    return null;
  }
}
