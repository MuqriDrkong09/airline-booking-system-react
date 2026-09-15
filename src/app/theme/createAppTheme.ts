import { createTheme } from '@mui/material/styles';
import { breakpoints } from './breakpoints';
import { componentOverrides } from './components';
import { createPalette } from './palette';
import { shadows } from './shadows';
import { radiusTokens, spacingUnit, type ColorScheme } from './tokens';
import { typography } from './typography';

export function createAppTheme(mode: ColorScheme = 'light') {
  return createTheme({
    palette: createPalette(mode),
    typography,
    breakpoints,
    spacing: spacingUnit,
    shape: {
      borderRadius: radiusTokens.md,
    },
    shadows,
    zIndex: {
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
    components: componentOverrides,
  });
}
