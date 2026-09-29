/**
 * Shared page layout metrics for public and dashboard shells.
 * Use these so gutters stay consistent across breakpoints and pages.
 */
export const LAYOUT_CONTENT_MAX_WIDTH = 1200;

/** Horizontal page gutters in MUI spacing units (×8px). */
export const LAYOUT_PAGE_GUTTER_X = {
  xs: 2.5,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
} as const;

/** Vertical page padding in MUI spacing units. */
export const LAYOUT_PAGE_GUTTER_Y = {
  xs: 2.5,
  md: 3,
} as const;
