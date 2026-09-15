import type { ThemeOptions } from '@mui/material/styles';
import { colorTokens, type ColorScheme } from './tokens';

export function createPalette(mode: ColorScheme): ThemeOptions['palette'] {
  const surface = colorTokens[mode];

  return {
    mode,
    primary: { ...colorTokens.brand.primary },
    secondary: { ...colorTokens.brand.secondary },
    success: { ...colorTokens.semantic.success },
    warning: { ...colorTokens.semantic.warning },
    error: { ...colorTokens.semantic.error },
    info: { ...colorTokens.semantic.info },
    background: { ...surface.background },
    text: { ...surface.text },
    divider: surface.divider,
    action: { ...surface.action },
  };
}
