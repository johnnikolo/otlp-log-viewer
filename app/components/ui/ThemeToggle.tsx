"use client";

import { useEffect, useState } from "react";
import * as Toggle from "@radix-ui/react-toggle";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Private-browsing/storage-restricted contexts can throw on write; the
    // theme still applies for this session, it just won't persist.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <Toggle.Root
      pressed={theme === "dark"}
      onPressedChange={(pressed) => {
        const next: Theme = pressed ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
    >
      {theme === "dark" ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </Toggle.Root>
  );
}
