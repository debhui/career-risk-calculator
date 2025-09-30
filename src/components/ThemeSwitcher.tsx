// components/ThemeSwitcher.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // Assuming you use lucide-react for icons

export function ThemeSwitcher() {
  // 1. next-themes only runs on the client, so we use mounted state to prevent hydration errors.
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null during server rendering
    return null;
  }

  // 2. Determine the opposite theme for the button's action
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="p-2 rounded-full transition-colors duration-200 
                 text-white bg-teal-500 
                 dark:text-white dark:bg-gray-700 
                 hover:bg-gray-300 dark:hover:bg-gray-600"
      aria-label={`Switch to ${nextTheme} mode`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
