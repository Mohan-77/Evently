"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);

  const isDark = !mounted || resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle color theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle color theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className={isDark ? "theme-icon is-visible" : "theme-icon"} size={18} aria-hidden="true" />
      <Moon className={!isDark ? "theme-icon is-visible" : "theme-icon"} size={18} aria-hidden="true" />
    </button>
  );
}
