import type { ThemeOptions } from '@mui/material/styles';
import { colorTokens, radiusTokens } from './tokens';

const focusRing = {
  outline: `2px solid ${colorTokens.brand.primary.main}`,
  outlineOffset: 2,
};

export const componentOverrides: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollBehavior: 'smooth',
      },
      '*:focus': {
        outline: 'none',
      },
      '*:focus-visible': {
        ...focusRing,
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: false,
    },
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': focusRing,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: radiusTokens.md,
        minHeight: 40,
        '&.Mui-focusVisible': focusRing,
      },
      sizeLarge: {
        minHeight: 48,
        paddingInline: 22,
      },
      sizeSmall: {
        minHeight: 32,
        paddingInline: 12,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': focusRing,
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'hover',
    },
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': focusRing,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': focusRing,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': focusRing,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
      fullWidth: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: radiusTokens.md,
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
        },
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: radiusTokens.lg,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: radiusTokens.md,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: radiusTokens.lg,
      },
    },
  },
  MuiAlert: {
    defaultProps: {
      variant: 'standard',
    },
    styleOverrides: {
      root: {
        borderRadius: radiusTokens.md,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: radiusTokens.sm,
        fontWeight: 600,
      },
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
      },
    },
  },
  MuiContainer: {
    defaultProps: {
      maxWidth: 'lg',
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginLeft: 0,
        marginRight: 0,
      },
    },
  },
};
