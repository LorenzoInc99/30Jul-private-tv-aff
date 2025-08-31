// Design System & Brand Identity for Live Football TV Guide
// Brand Name: "Pitch Perfect" - Premium Football Experience

export const brand = {
  name: 'Live Football TV Guide',
  tagline: 'Where Every Match Matters',
  description: 'Premium football coverage with live scores, betting odds, and comprehensive TV guides'
};

// ===== TYPOGRAPHY =====
export const typography = {
  // Primary Font: Inter (modern, clean, highly readable)
  // Secondary Font: Poppins (for headings - sporty, dynamic)
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", "Roboto Mono", monospace'
  },
  
  // Custom font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  
  // Typography scale
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem'      // 128px
  },
  
  // Line heights
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// ===== COLOR PALETTE =====
// Unique brand colors inspired by football pitch, premium sports, and modern tech
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',   // Lightest blue
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  
  // Secondary Brand Colors (Pitch Green)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Football pitch green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  
  // Accent Colors (Dynamic Orange)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Dynamic orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },
  
  // Neutral Colors (Premium Grays)
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
    950: '#0a0a0a'
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  }
};

// ===== SPACING SYSTEM =====
export const spacing = {
  // Base spacing unit: 4px
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
  '6xl': '12rem'    // 192px
};

// ===== BORDER RADIUS =====
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// ===== SHADOWS =====
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none'
};

// ===== BREAKPOINTS =====
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// ===== ANIMATIONS =====
export const animations = {
  // Transition durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom easing for brand
    brand: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// ===== COMPONENT THEMES =====
export const componentThemes = {
  // Button variants
  button: {
    primary: {
      bg: colors.primary[500],
      hover: colors.primary[600],
      text: 'white',
      border: 'transparent'
    },
    secondary: {
      bg: colors.secondary[500],
      hover: colors.secondary[600],
      text: 'white',
      border: 'transparent'
    },
    accent: {
      bg: colors.accent[500],
      hover: colors.accent[600],
      text: 'white',
      border: 'transparent'
    },
    outline: {
      bg: 'transparent',
      hover: colors.neutral[100],
      text: colors.neutral[700],
      border: colors.neutral[300]
    },
    ghost: {
      bg: 'transparent',
      hover: colors.neutral[100],
      text: colors.neutral[700],
      border: 'transparent'
    }
  },
  
  // Card variants
  card: {
    default: {
      bg: 'white',
      border: colors.neutral[200],
      shadow: shadows.base
    },
    elevated: {
      bg: 'white',
      border: 'transparent',
      shadow: shadows.lg
    },
    outlined: {
      bg: 'transparent',
      border: colors.neutral[300],
      shadow: 'none'
    }
  },
  
  // Input variants
  input: {
    default: {
      bg: 'white',
      border: colors.neutral[300],
      focus: colors.primary[500],
      placeholder: colors.neutral[400]
    },
    error: {
      bg: colors.error[50],
      border: colors.error[500],
      focus: colors.error[600],
      placeholder: colors.neutral[400]
    }
  }
};

// ===== DARK MODE COLORS =====
export const darkModeColors = {
  primary: {
    50: '#082f49',
    100: '#0c4a6e',
    200: '#075985',
    300: '#0369a1',
    400: '#0284c7',
    500: '#0ea5e9',
    600: '#38bdf8',
    700: '#7dd3fc',
    800: '#bae6fd',
    900: '#e0f2fe',
    950: '#f0f9ff'
  },
  
  neutral: {
    50: '#0a0a0a',
    100: '#171717',
    200: '#262626',
    300: '#404040',
    400: '#525252',
    500: '#737373',
    600: '#a3a3a3',
    700: '#d4d4d4',
    800: '#e5e5e5',
    900: '#f5f5f5',
    950: '#fafafa'
  }
};

// ===== BRAND VOICE & TONE =====
export const brandVoice = {
  personality: {
    confident: 'Bold and authoritative',
    passionate: 'Enthusiastic about football',
    professional: 'Trustworthy and reliable',
    modern: 'Tech-savvy and innovative'
  },
  
  tone: {
    headings: 'Bold, confident, and engaging',
    body: 'Clear, informative, and accessible',
    buttons: 'Action-oriented and encouraging',
    captions: 'Concise and helpful'
  },
  
  writing: {
    style: 'Active voice, clear and direct',
    vocabulary: 'Football terminology, but accessible',
    length: 'Concise but comprehensive'
  }
};

// ===== ICON SYSTEM =====
export const icons = {
  // Icon sizes
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem'    // 48px
  },
  
  // Icon categories
  categories: {
    navigation: ['home', 'scores', 'news', 'favourites', 'calculator'],
    sports: ['football', 'goal', 'card', 'whistle', 'trophy'],
    actions: ['play', 'pause', 'stop', 'refresh', 'share'],
    status: ['success', 'warning', 'error', 'info', 'loading']
  }
};

// ===== LAYOUT CONSTANTS =====
export const layout = {
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%'
  },
  
  // Header height
  header: {
    height: '4rem',  // 64px
    mobile: '3.5rem' // 56px
  },
  
  // Sidebar width
  sidebar: {
    width: '16rem',  // 256px
    collapsed: '4rem' // 64px
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Export all design tokens
export const designSystem = {
  brand,
  typography,
  colors,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animations,
  componentThemes,
  darkModeColors,
  brandVoice,
  icons,
  layout
};

export default designSystem;
