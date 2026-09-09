import { createTheme, type Theme } from '@mui/material/styles';

import type { ThemeMode } from './themeContext';

// Builds the Material UI theme. Colours are read from the CSS custom properties
// defined in `styles/_tokens.scss`, which change with the `data-theme`
// attribute. Only `palette.mode` depends on the argument.
export function createAppTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: {
      mode,
      background: {
        default: 'var(--color-bg)',
        paper: 'var(--color-surface)',
      },
      text: {
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-muted)',
      },
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: 'var(--font-sans)' },
    components: {
      MuiIconButton: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-md)',
            transition:
              'color var(--duration-fast) ease, background-color var(--duration-fast) ease',
            '&:hover': {
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-accent-soft)',
            },
            '&:focus-visible': {
              outline: '2px solid var(--color-focus)',
              outlineOffset: '2px',
            },
          },
          // Set here rather than in a stylesheet because MUI's own sizeSmall
          // rule would otherwise win on specificity.
          sizeSmall: { padding: 'var(--space-2)' },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.02em',
            padding: '6px 10px',
          },
          arrow: { color: 'var(--color-surface)' },
        },
      },
    },
  });
}
