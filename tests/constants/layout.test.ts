import {
  LAYOUT_CONTENT_MAX_WIDTH,
  LAYOUT_PAGE_GUTTER_X,
  LAYOUT_PAGE_GUTTER_Y,
} from '@/constants/layout';

describe('layout constants', () => {
  it('defines a content max width used by public and dashboard shells', () => {
    expect(LAYOUT_CONTENT_MAX_WIDTH).toBe(1200);
  });

  it('defines increasing horizontal gutters across breakpoints', () => {
    expect(LAYOUT_PAGE_GUTTER_X.xs).toBeLessThan(LAYOUT_PAGE_GUTTER_X.sm);
    expect(LAYOUT_PAGE_GUTTER_X.sm).toBeLessThan(LAYOUT_PAGE_GUTTER_X.md);
    expect(LAYOUT_PAGE_GUTTER_X.md).toBeLessThan(LAYOUT_PAGE_GUTTER_X.lg);
    expect(LAYOUT_PAGE_GUTTER_X.lg).toBeLessThan(LAYOUT_PAGE_GUTTER_X.xl);
  });

  it('defines vertical page padding for compact and desktop', () => {
    expect(LAYOUT_PAGE_GUTTER_Y.xs).toBeGreaterThan(0);
    expect(LAYOUT_PAGE_GUTTER_Y.md).toBeGreaterThanOrEqual(LAYOUT_PAGE_GUTTER_Y.xs);
  });
});
