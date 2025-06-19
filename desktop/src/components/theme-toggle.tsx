import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-preact";

export function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-primary/20 bg-primary-light text-primary hover:bg-primary-light/70 hover:text-primary-hover dark:border-primary/30 dark:bg-primary-dark dark:text-primary dark:hover:bg-primary-dark/70 transition-colors"
      title={`Switch to ${darkMode ? "light" : "dark"} mode`}
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
}
