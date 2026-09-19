import { createAppTheme } from '@/app/theme/createAppTheme';
import { componentOverrides } from '@/app/theme/components';
import { colorTokens, type ColorScheme } from '@/app/theme/tokens';

describe('createAppTheme', () => {
  it('defaults to the light color scheme', () => {
    const theme = createAppTheme();

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.background.default).toBe(colorTokens.light.background.default);
    expect(theme.palette.text.primary).toBe(colorTokens.light.text.primary);
  });

  it.each(['light', 'dark'] as const)(
    'creates a %s theme with shared tokens and overrides',
    (mode: ColorScheme) => {
      const theme = createAppTheme(mode);
      const surface = colorTokens[mode];

      expect(theme.palette.mode).toBe(mode);
      expect(theme.palette.primary.main).toBe(colorTokens.brand.primary.main);
      expect(theme.palette.secondary.main).toBe(colorTokens.brand.secondary.main);
      expect(theme.palette.success.main).toBe(colorTokens.semantic.success.main);
      expect(theme.palette.background.default).toBe(surface.background.default);
      expect(theme.palette.background.paper).toBe(surface.background.paper);
      expect(theme.palette.text.primary).toBe(surface.text.primary);
      expect(theme.palette.divider).toBe(surface.divider);

      expect(theme.shape.borderRadius).toBe(10);
      expect(theme.breakpoints.values.md).toBe(900);
      expect(theme.typography.button?.textTransform).toBe('none');
      expect(theme.spacing(2)).toBe('16px');
      expect(theme.shadows[1]).not.toBe('none');

      expect(theme.zIndex.appBar).toBe(1100);
      expect(theme.zIndex.drawer).toBe(1200);
      expect(theme.zIndex.modal).toBe(1300);
      expect(theme.zIndex.snackbar).toBe(1400);
      expect(theme.zIndex.tooltip).toBe(1500);

      expect(theme.components).toEqual(componentOverrides);
    },
  );
});
