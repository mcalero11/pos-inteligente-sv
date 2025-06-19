import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";

export type ColorTheme =
  | "orange"
  | "red"
  | "rose"
  | "green"
  | "blue"
  | "yellow"
  | "violet"
  | "white";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: any }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("orange");
  const [darkMode, setDarkMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = globalThis.localStorage?.getItem("pos-color-theme");
      const savedDark = globalThis.localStorage?.getItem("pos-dark-mode");

      if (savedTheme) {
        setColorTheme(savedTheme as ColorTheme);
      }
      if (savedDark) {
        setDarkMode(savedDark === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    try {
      // Save to localStorage
      globalThis.localStorage?.setItem("pos-color-theme", colorTheme);
      globalThis.localStorage?.setItem("pos-dark-mode", darkMode.toString());
    } catch {
      // Ignore localStorage errors
    }

    // Apply theme classes to document
    const themeClass = `theme-${colorTheme}`;
    const darkClass = darkMode ? "dark" : "";

    try {
      // Remove all existing theme classes
      const currentClasses =
        globalThis.document?.documentElement?.className || "";
      const cleanedClasses = currentClasses
        .replace(/theme-\w+/g, "")
        .replace(/\bdark\b/g, "")
        .trim();

      // Add new theme classes
      const newClasses = `${cleanedClasses} ${themeClass} ${darkClass}`.trim();

      if (globalThis.document?.documentElement) {
        globalThis.document.documentElement.className = newClasses;
      }
    } catch {
      // Ignore document errors
    }
  }, [colorTheme, darkMode]);

  const handleSetColorTheme = (theme: ColorTheme) => {
    if (theme !== colorTheme) {
      setColorTheme(theme);
    }
  };

  const handleSetDarkMode = (dark: boolean) => {
    setDarkMode(dark);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme: handleSetColorTheme,
        darkMode,
        setDarkMode: handleSetDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
