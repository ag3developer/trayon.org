"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

const STORAGE_KEY = "trayon-theme";

interface ThemeContextValue {
  /** The theme actually applied to the document. */
  resolvedTheme: Theme;
  /** The user's stored preference, or "system" if none was set. */
  preference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("dark");

  useEffect(() => {
    const initialPreference = readStoredPreference();
    const initialTheme =
      initialPreference === "system" ? getSystemTheme() : initialPreference;
    setPreference(initialPreference);
    setResolvedTheme(initialTheme);
    applyTheme(initialTheme);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemChange = () => {
      if (readStoredPreference() === "system") {
        const nextTheme = getSystemTheme();
        setResolvedTheme(nextTheme);
        applyTheme(nextTheme);
      }
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    const nextTheme = next === "system" ? getSystemTheme() : next;
    setResolvedTheme(nextTheme);
    applyTheme(nextTheme);

    if (next === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ resolvedTheme, preference, setTheme, toggleTheme }),
    [resolvedTheme, preference, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Inline script string executed before hydration (via <script> in <head>)
 * to set data-theme immediately and avoid a flash of the wrong theme.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;
