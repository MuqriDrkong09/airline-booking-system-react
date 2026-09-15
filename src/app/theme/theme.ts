import { createAppTheme } from './createAppTheme';

/** Default light theme for non-reactive contexts and tests. */
export const appTheme = createAppTheme('light');

export { createAppTheme } from './createAppTheme';
export { breakpoints } from './breakpoints';
export { createPalette } from './palette';
export { shadows } from './shadows';
export { typography } from './typography';
export {
  colorTokens,
  radiusTokens,
  spacingUnit,
  zIndexTokens,
  type ColorScheme,
} from './tokens';
