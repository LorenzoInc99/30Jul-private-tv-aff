// Premium Football App Color System
// Designed to create a distinctive, professional brand identity

export const colors = {
  // Primary Brand Colors - Deep Emerald Green (Football Field)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main brand color
    600: '#16a34a', // Primary button, active states
    700: '#15803d', // Hover states
    800: '#166534', // Text on light backgrounds
    900: '#14532d', // Dark mode primary
  },

  // Secondary Colors - Rich Gold (Trophy/Premium)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Accent color
    600: '#d97706', // Secondary buttons
    700: '#b45309', // Hover states
    800: '#92400e', // Text on light backgrounds
    900: '#78350f', // Dark mode secondary
  },

  // Success Colors - Victory Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Win indicators
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning Colors - Draw Orange
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Draw indicators
    600: '#d97706',
    700: '#b45309',
  },

  // Error Colors - Loss Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Loss indicators
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Neutral Colors - Professional Grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Dark Theme Colors
  dark: {
    bg: '#0a0a0a', // Deep black background
    surface: '#111111', // Card backgrounds
    surfaceHover: '#1a1a1a', // Hover states
    border: '#262626', // Borders
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      tertiary: '#737373',
    }
  },

  // Light Theme Colors
  light: {
    bg: '#ffffff',
    surface: '#fafafa',
    surfaceHover: '#f5f5f5',
    border: '#e5e5e5',
    text: {
      primary: '#171717',
      secondary: '#525252',
      tertiary: '#737373',
    }
  },

  // Team Status Colors
  status: {
    live: '#ef4444', // Live match indicator
    upcoming: '#3b82f6', // Upcoming match
    finished: '#6b7280', // Finished match
    postponed: '#f59e0b', // Postponed match
    cancelled: '#ef4444', // Cancelled match
  },

  // Odds Colors
  odds: {
    best: '#22c55e', // Best odds highlight
    good: '#4ade80', // Good odds
    average: '#fbbf24', // Average odds
    poor: '#ef4444', // Poor odds
  },

  // Broadcast Colors
  broadcast: {
    sky: '#0ea5e9', // Sky Sports
    bt: '#1e40af', // BT Sport
    amazon: '#f59e0b', // Amazon Prime
    espn: '#dc2626', // ESPN
    bein: '#7c3aed', // beIN Sports
  }
};

// Semantic color mappings
export const semanticColors = {
  // Backgrounds
  bg: {
    primary: colors.light.bg,
    secondary: colors.light.surface,
    tertiary: colors.light.surfaceHover,
    dark: colors.dark.bg,
    darkSecondary: colors.dark.surface,
  },

  // Text
  text: {
    primary: colors.light.text.primary,
    secondary: colors.light.text.secondary,
    tertiary: colors.light.text.tertiary,
    dark: colors.dark.text.primary,
    darkSecondary: colors.dark.text.secondary,
  },

  // Borders
  border: {
    light: colors.light.border,
    dark: colors.dark.border,
  },

  // Interactive elements
  interactive: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    secondary: colors.secondary[600],
    secondaryHover: colors.secondary[700],
  },

  // Status indicators
  status: {
    win: colors.success[500],
    draw: colors.warning[500],
    loss: colors.error[500],
    live: colors.status.live,
    upcoming: colors.status.upcoming,
    finished: colors.status.finished,
  }
};

// CSS Custom Properties for easy theming
export const cssVariables = {
  // Primary colors
  '--color-primary-50': colors.primary[50],
  '--color-primary-100': colors.primary[100],
  '--color-primary-500': colors.primary[500],
  '--color-primary-600': colors.primary[600],
  '--color-primary-700': colors.primary[700],

  // Secondary colors
  '--color-secondary-500': colors.secondary[500],
  '--color-secondary-600': colors.secondary[600],

  // Status colors
  '--color-win': colors.success[500],
  '--color-draw': colors.warning[500],
  '--color-loss': colors.error[500],
  '--color-live': colors.status.live,

  // Neutral colors
  '--color-neutral-50': colors.neutral[50],
  '--color-neutral-100': colors.neutral[100],
  '--color-neutral-200': colors.neutral[200],
  '--color-neutral-300': colors.neutral[300],
  '--color-neutral-400': colors.neutral[400],
  '--color-neutral-500': colors.neutral[500],
  '--color-neutral-600': colors.neutral[600],
  '--color-neutral-700': colors.neutral[700],
  '--color-neutral-800': colors.neutral[800],
  '--color-neutral-900': colors.neutral[900],
};

// Utility functions
export const getTeamFormColor = (result: 'W' | 'D' | 'L') => {
  switch (result) {
    case 'W': return colors.success[500];
    case 'D': return colors.warning[500];
    case 'L': return colors.error[500];
    default: return colors.neutral[400];
  }
};

export const getMatchStatusColor = (status: string) => {
  if (status.includes('Live') || status.includes('Half')) return colors.status.live;
  if (status.includes('Finished') || status.includes('Full Time')) return colors.status.finished;
  if (status.includes('Not Started') || status.includes('Scheduled')) return colors.status.upcoming;
  if (status.includes('Postponed')) return colors.status.postponed;
  if (status.includes('Cancelled')) return colors.status.cancelled;
  return colors.neutral[400];
};

export const getOddsColor = (odds: number, bestOdds: number) => {
  const percentage = (odds / bestOdds) * 100;
  if (percentage <= 105) return colors.odds.best;
  if (percentage <= 110) return colors.odds.good;
  if (percentage <= 120) return colors.odds.average;
  return colors.odds.poor;
};

