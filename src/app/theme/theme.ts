import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
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
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2430',
      secondary: '#5C6B7A',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});
