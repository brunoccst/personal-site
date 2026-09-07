import { createContext, use } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

// Reads the current theme mode. Throws when used outside AppThemeProvider.
export function useThemeMode(): ThemeModeContextValue {
  const context = use(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used inside AppThemeProvider');
  }
  return context;
}
