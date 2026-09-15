import type { ThemeOptions } from '@mui/material/styles';
import { radiusTokens } from './tokens';

export const componentOverrides: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollBehavior: 'smooth',
      },
      '*:focus-visible': {
        outline: '2px solid',
        outlineColor: 'inherit',
        outlineOffset: 2,
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
};
