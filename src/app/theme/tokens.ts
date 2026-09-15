export const colorTokens = {
  brand: {
    primary: {
      main: '#0B3D91',
      dark: '#082C69',
      light: '#3B66B0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C9A227',
      dark: '#A3841B',
      light: '#D4B75C',
      contrastText: '#1A1A1A',
    },
  },
  light: {
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2430',
      secondary: '#5C6B7A',
      disabled: '#9AA6B2',
    },
    divider: '#D8E0EA',
    action: {
      hover: 'rgba(11, 61, 145, 0.04)',
      selected: 'rgba(11, 61, 145, 0.08)',
      disabled: 'rgba(28, 36, 48, 0.38)',
      disabledBackground: 'rgba(28, 36, 48, 0.12)',
    },
  },
  dark: {
    background: {
      default: '#0F1724',
      paper: '#172033',
    },
    text: {
      primary: '#E8EEF7',
      secondary: '#A7B4C5',
      disabled: '#6F7C8C',
    },
    divider: '#2A3648',
    action: {
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: 'rgba(255, 255, 255, 0.1)',
      disabled: 'rgba(232, 238, 247, 0.38)',
      disabledBackground: 'rgba(232, 238, 247, 0.12)',
    },
  },
  semantic: {
    success: { main: '#1B7F4E', light: '#4CA978', dark: '#125C38', contrastText: '#FFFFFF' },
    warning: { main: '#C47B16', light: '#E0A04A', dark: '#8F580F', contrastText: '#1A1A1A' },
    error: { main: '#C62828', light: '#E05A5A', dark: '#8E1C1C', contrastText: '#FFFFFF' },
    info: { main: '#1565C0', light: '#4B8AD4', dark: '#0E478A', contrastText: '#FFFFFF' },
  },
} as const;

/** Base spacing unit in pixels. MUI spacing(n) = n * 8. */
export const spacingUnit = 8;

export const radiusTokens = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const zIndexTokens = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

export type ColorScheme = 'light' | 'dark';
