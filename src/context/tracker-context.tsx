"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TrackerProfile, TrackerState, Trip } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/types";
import { clearState, loadState, saveState } from "@/lib/storage";

const PERSIST_DEBOUNCE_MS = 500;

interface TrackerContextValue {
  hydrated: boolean;
  state: TrackerState;
  setProfile: (p: Partial<TrackerProfile>) => void;
  addTrip: (trip: Omit<Trip, "id">) => void;
  updateTrip: (id: string, trip: Omit<Trip, "id">) => void;
  deleteTrip: (id: string) => void;
  replaceState: (s: TrackerState) => void;
  clearAll: () => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

const emptyState: TrackerState = {
  profile: DEFAULT_PROFILE,
  trips: [],
};

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<TrackerState>(emptyState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const loaded = loadState();
    if (loaded) setState(loaded);
    setHydrated(true);
  }, []);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    if (!hydrated) return;
    globalThis.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = globalThis.setTimeout(() => {
      saveState(stateRef.current);
    }, PERSIST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(persistTimerRef.current);
  }, [state, hydrated]);

  useEffect(() => {
    const flush = () => saveState(stateRef.current);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, []);

  const setProfile = useCallback((p: Partial<TrackerProfile>) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...p },
    }));
  }, []);

  const addTrip = useCallback((trip: Omit<Trip, "id">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    setState((s) => ({
      ...s,
      trips: [...s.trips, { ...trip, id }].sort((a, b) =>
        a.departureDate.localeCompare(b.departureDate)
      ),
    }));
  }, []);

  const updateTrip = useCallback((id: string, trip: Omit<Trip, "id">) => {
    setState((s) => ({
      ...s,
      trips: s.trips
        .map((t) => (t.id === id ? { ...trip, id } : t))
        .sort((a, b) => a.departureDate.localeCompare(b.departureDate)),
    }));
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      trips: s.trips.filter((t) => t.id !== id),
    }));
  }, []);

  const replaceState = useCallback((s: TrackerState) => {
    setState(s);
    saveState(s);
  }, []);

  const clearAll = useCallback(() => {
    clearState();
    setState(emptyState);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      state,
      setProfile,
      addTrip,
      updateTrip,
      deleteTrip,
      replaceState,
      clearAll,
    }),
    [
      hydrated,
      state,
      setProfile,
      addTrip,
      updateTrip,
      deleteTrip,
      replaceState,
      clearAll,
    ]
  );

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}
