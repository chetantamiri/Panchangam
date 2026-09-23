import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { safeStorage } from '../services/storage';
import { colors, ThemeColors, ThemeMode } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';

const THEME_STORAGE_KEY = '@user_theme_preference';

// ─── Types ───────────────────────────────────────────────────────────────────

type UserThemeMode = ThemeMode | 'system';

type Theme = {
  themeMode: ThemeMode;
  isDark: boolean;
  userOverride: UserThemeMode | null;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemDefault: () => void;
};

// ─── Sync initial override from localStorage (web only) ──────────────────────

const getInitialOverride = (): UserThemeMode | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(THEME_STORAGE_KEY) as UserThemeMode;
      if (val && (val === 'system' || colors[val])) return val;
    }
  } catch (_) {}
  return null;
};

// ─── Default context value ───────────────────────────────────────────────────

const defaultTheme: Theme = {
  themeMode: 'dark',
  isDark: true,
  userOverride: null,
  colors: colors.dark,
  typography,
  spacing,
  layout,
  toggleTheme: () => {},
  setThemeMode: () => {},
  setSystemDefault: () => {},
};

const ThemeContext = createContext<Theme>(defaultTheme);

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [userOverride, setUserOverride] = useState<UserThemeMode | null>(getInitialOverride);

  // Hydrate from storage on native boot
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = (await safeStorage.getItem(THEME_STORAGE_KEY)) as UserThemeMode;
        if (mounted && stored && (stored === 'system' || colors[stored])) {
          setUserOverride(stored);
        }
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  // Resolve active theme mode
  const themeMode: ThemeMode =
    userOverride && userOverride !== 'system'
      ? userOverride
      : (systemColorScheme === 'dark' || Appearance.getColorScheme() === 'dark')
        ? 'dark'
        : 'light';

  const isDark = themeMode === 'dark';

  const setThemeMode = async (mode: ThemeMode) => {
    setUserOverride(mode);
    await safeStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'crimsonLight'];
    const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    setThemeMode(next);
  };

  const setSystemDefault = async () => {
    setUserOverride('system');
    await safeStorage.setItem(THEME_STORAGE_KEY, 'system');
  };

  const theme: Theme = {
    themeMode,
    isDark,
    userOverride,
    colors: colors[themeMode] || colors.dark,
    typography,
    spacing,
    layout,
    toggleTheme,
    setThemeMode,
    setSystemDefault,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
