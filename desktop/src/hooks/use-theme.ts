import { useState, useEffect } from 'preact/hooks';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const savedTheme = globalThis.localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof globalThis === 'undefined' || !globalThis.document) return;

    const root = globalThis.document.documentElement;

    const applyTheme = (newTheme: Theme) => {
      root.classList.remove('light', 'dark');

      if (newTheme === 'system') {
        const systemTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(newTheme);
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const getIsDark = () => {
    if (typeof globalThis === 'undefined') return false;
    return theme === 'dark' || (theme === 'system' && globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const getIsLight = () => {
    if (typeof globalThis === 'undefined') return true;
    return theme === 'light' || (theme === 'system' && !globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  return {
    theme,
    setTheme,
    isDark: getIsDark(),
    isLight: getIsLight(),
    isSystem: theme === 'system',
  };
} 
