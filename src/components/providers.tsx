"use client";

import { ThemeProvider } from "next-themes";
import { TrackerProvider } from "@/context/tracker-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TrackerProvider>{children}</TrackerProvider>
    </ThemeProvider>
  );
}
