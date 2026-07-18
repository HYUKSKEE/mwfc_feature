export const theme = {
  colors: {
    bg: '#0a0a0a',
    bgElevated: '#141414',
    bgHover: '#1c1c1c',
    border: '#2a2a2a',
    borderStrong: '#3a3a3a',
    text: '#f2f2f2',
    textMuted: '#8a8a8a',
    accent: '#e10600',
    accentHover: '#ff1a10',
    accentSoft: 'rgba(225, 6, 0, 0.15)',
    danger: '#ff3b30',
    white: '#ffffff',
  },
  fonts: {
    display: '"Bebas Neue", sans-serif',
    body: '"Outfit", sans-serif',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
  },
  shadows: {
    glow: '0 0 24px rgba(225, 6, 0, 0.25)',
  },
} as const;

export type AppTheme = typeof theme;
