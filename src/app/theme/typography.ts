import type { ThemeOptions } from '@mui/material/styles';

export const typography: ThemeOptions['typography'] = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1.75rem',
    lineHeight: 1.3,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    lineHeight: 1.35,
    fontWeight: 600,
  },
  h5: {
    fontSize: '1.25rem',
    lineHeight: 1.4,
    fontWeight: 600,
  },
  h6: {
    fontSize: '1.125rem',
    lineHeight: 1.4,
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  overline: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
};
