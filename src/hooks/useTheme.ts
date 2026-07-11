/**
 * Theme management hook.
 *
 * Reads the theme preference from the settings store, applies the
 * `data-theme` attribute to `<html>`, and listens for system-level
 * color scheme changes when the preference is set to 'system'.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

type ThemeValue = 'dark' | 'light' | 'system';
type EffectiveTheme = 'dark' | 'light';

interface UseThemeReturn {
  /** The user's stored theme preference. */
  theme: ThemeValue;
  /** Update the theme preference. */
  setTheme: (theme: ThemeValue) => void;
  /** The actually applied theme after resolving 'system'. */
  effectiveTheme: EffectiveTheme;
}

/**
 * Determine the system's preferred color scheme.
 */
function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Hook that manages the application theme.
 *
 * - Applies `data-theme="dark|light"` to `document.documentElement`
 * - Listens for `prefers-color-scheme` changes when theme is 'system'
 * - Returns the effective (resolved) theme for conditional rendering
 *
 * @example
 * ```tsx
 * const { theme, setTheme, effectiveTheme } = useTheme();
 *
 * return (
 *   <button onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}>
 *     Toggle theme
 *   </button>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const theme = useSettingsStore((s) => s.theme);
  const setThemeStore = useSettingsStore((s) => s.setTheme);

  const effectiveTheme: EffectiveTheme = useMemo(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    const apply = (t: EffectiveTheme) => {
      document.documentElement.setAttribute('data-theme', t);
      // Also toggle the class for Tailwind dark mode
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      // Apply current system preference
      apply(getSystemTheme());

      // Listen for system changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        apply(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);

      return () => mediaQuery.removeEventListener('change', handler);
    }

    apply(theme);
    return undefined;
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: ThemeValue) => {
      setThemeStore(newTheme);
    },
    [setThemeStore],
  );

  return { theme, setTheme, effectiveTheme };
}
