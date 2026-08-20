"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={toggleTheme}
      className={`relative flex h-7 w-14 items-center rounded-full border p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isDark
          ? "justify-end border-zinc-600 bg-zinc-800 focus-visible:ring-offset-zinc-950"
          : "justify-start border-gray-300 bg-gray-200 focus-visible:ring-offset-white"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-transform duration-200 ${
          isDark
            ? "bg-emerald-300 text-zinc-950"
            : "bg-white text-gray-700"
        }`}
      >
        {isDark ? "D" : "L"}
      </span>
    </button>
  );
}
