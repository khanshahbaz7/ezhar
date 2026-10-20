"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

// No-op subscription: we only need to know whether the client has hydrated.
const emptySubscribe = () => () => {};

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // False during SSR and the hydration pass, true afterwards. Using
  // useSyncExternalStore keeps the server and client markup identical
  // without a setState-in-effect.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme";

  return (
    <button
      type="button"
      onClick={() => {
        if (mounted) setTheme(isDark ? "light" : "dark");
      }}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors",
        "hover:bg-slate-100 hover:text-slate-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
        className
      )}
    >
      <Sun className="size-[18px] transition-all duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute size-[18px] rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
