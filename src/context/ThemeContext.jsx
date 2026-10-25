import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { notifyWarning } from "../utils/notifications";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setTheme(saved);
      } else if (saved) {
        notifyWarning("Your saved theme preference was invalid.", {
          toastId: "invalid-theme-preference",
          dedupeForMs: 60000,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Could not read the saved theme preference:", error.name);
      }
      notifyWarning("Your saved theme preference couldn't be read.", {
        toastId: "theme-preference-read-warning",
        dedupeForMs: 60000,
      });
    } finally {
      setHasLoadedPreference(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      setResolvedTheme(theme);
      root.classList.toggle("dark", theme === "dark");
    }
    if (hasLoadedPreference) {
      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Could not save the theme preference:", error.name);
        }
        notifyWarning("Your theme choice couldn't be saved on this device.", {
          toastId: "theme-preference-save-warning",
          dedupeForMs: 60000,
        });
      }
    }
  }, [hasLoadedPreference, theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark",
        );
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, []);

  const setThemeMode = useCallback((mode) => {
    setTheme(mode);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, toggleTheme, setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
