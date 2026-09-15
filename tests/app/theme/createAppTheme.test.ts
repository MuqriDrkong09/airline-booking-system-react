import { createAppTheme } from '@/app/theme/createAppTheme';
import type { ColorScheme } from '@/app/theme/tokens';

describe('createAppTheme', () => {
  it.each(['light', 'dark'] as const)('creates a %s theme with shared tokens', (mode: ColorScheme) => {
    const theme = createAppTheme(mode);

    expect(theme.palette.mode).toBe(mode);
    expect(theme.palette.primary.main).toBe('#0B3D91');
    expect(theme.shape.borderRadius).toBe(10);
    expect(theme.breakpoints.values.md).toBe(900);
    expect(theme.typography.button?.textTransform).toBe('none');
    expect(theme.spacing(2)).toBe('16px');
    expect(theme.shadows[1]).not.toBe('none');
  });
});
