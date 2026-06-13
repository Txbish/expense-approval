"use client";

import { useSyncExternalStore } from "react";
import { clsx } from "clsx";

/* The no-flash script in app/layout.tsx sets the theme before hydration. This
   reads that live DOM state via useSyncExternalStore (no setState-in-effect),
   and a custom event keeps every toggle instance in sync. */
function subscribe(cb: () => void) {
  window.addEventListener("themechange", cb);
  return () => window.removeEventListener("themechange", cb);
}
function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private mode / storage disabled — the choice just won't persist
    }
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-muted transition-colors duration-200 hover:bg-sidebar-2 hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="relative block h-[18px] w-[18px]">
        <Sun
          className={clsx(
            "absolute inset-0 transition-all duration-300 ease-out",
            isDark ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Moon
          className={clsx(
            "absolute inset-0 transition-all duration-300 ease-out",
            isDark ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </span>
    </button>
  );
}

function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    </svg>
  );
}
