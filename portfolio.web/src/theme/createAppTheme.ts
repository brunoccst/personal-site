import { createTheme, type Theme } from '@mui/material/styles';

// Builds the Material UI theme. Colours are read from the CSS custom properties
// defined in `styles/_tokens.scss`, which change with the `data-theme`
// attribute, so one theme object covers both modes.
export function createAppTheme(): Theme {
  return createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: 'var(--color-bg)',
        paper: 'var(--color-bg-elevated)',
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
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.02em',
            padding: '6px 10px',
          },
          arrow: { color: 'var(--color-bg-elevated)' },
        },
      },
    },
  });
}
