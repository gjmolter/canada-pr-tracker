"use client";

import { useRef } from "react";
import { Download, HardDrive, Trash2, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTracker } from "@/context/tracker-context";
import { parseBackup, serializeBackup } from "@/lib/storage";

export function BackupControls() {
  const { state, replaceState, clearAll } = useTracker();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <HardDrive className="h-6 w-6 text-[var(--color-forest)]" />
          Stash a copy
        </CardTitle>
        <CardDescription>
          Your data never leaves your machine unless you download it. Keep a JSON
          somewhere boring and safe (email to yourself counts).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-5">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              const blob = new Blob([serializeBackup(state)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `canada-stay-tracker-backup.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Download JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const text = String(reader.result ?? "");
                const parsed = parseBackup(text);
                if (!parsed) {
                  window.alert("That file doesn’t look like our backup format.");
                  return;
                }
                if (
                  window.confirm(
                    "Replace what you have now with this backup? Trips vanish if they’re not in the file."
                  )
                ) {
                  replaceState(parsed);
                }
                e.target.value = "";
              };
              reader.readAsText(file);
            }}
          />
        </div>

        <div className="border-t-2 border-dashed border-[color:var(--color-ink)]/15 pt-2 dark:border-stone-600/40">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted-ink)] dark:text-stone-400">
            Danger zone
          </p>
          <p className="mb-3 text-xs font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-500">
            Clear everything stored in this browser: Profile, trips, the lot.
            There is no undo.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm(
                  "Nuke everything stored in this browser? There is no undoing this."
                )
              ) {
                clearAll();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear all local data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
