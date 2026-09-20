import {
  appTheme,
  breakpoints,
  colorTokens,
  createAppTheme,
  createPalette,
  radiusTokens,
  shadows,
  spacingUnit,
  typography,
  zIndexTokens,
} from '@/app/theme/theme';

describe('theme module', () => {
  it('exports a default light appTheme instance', () => {
    expect(appTheme.palette.mode).toBe('light');
    expect(appTheme.palette.primary.main).toBe(colorTokens.brand.primary.main);
    expect(appTheme.palette.background.default).toBe(colorTokens.light.background.default);
    expect(appTheme.shape.borderRadius).toBe(radiusTokens.md);
  });

  it('re-exports createAppTheme for building alternate schemes', () => {
    const darkTheme = createAppTheme('dark');

    expect(darkTheme.palette.mode).toBe('dark');
    expect(darkTheme.palette.background.default).toBe(colorTokens.dark.background.default);
  });

  it('re-exports shared theme building blocks', () => {
    expect(breakpoints.values?.md).toBe(900);
    expect(spacingUnit).toBe(8);
    expect(shadows[0]).toBe('none');

    const typographyOptions =
      typeof typography === 'function' ? typography(createAppTheme('light').palette) : typography;
    expect(typographyOptions?.fontFamily).toContain('Roboto');

    const lightPalette = createPalette('light');
    const darkPalette = createPalette('dark');
    expect(lightPalette?.primary && 'main' in lightPalette.primary ? lightPalette.primary.main : undefined).toBe(
      colorTokens.brand.primary.main,
    );
    expect(darkPalette?.background?.default).toBe(colorTokens.dark.background.default);
    expect(zIndexTokens.modal).toBe(1300);
    expect(radiusTokens.lg).toBe(16);
  });
});
