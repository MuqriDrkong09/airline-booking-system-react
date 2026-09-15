import type { Shadows } from '@mui/material/styles';

const none = 'none';

/**
 * Custom elevation scale. Index 0 is always "none".
 * Higher elevations stay subtle for a clean airline UI.
 */
export const shadows = [
  none,
  '0 1px 2px rgba(15, 23, 36, 0.06)',
  '0 1px 3px rgba(15, 23, 36, 0.08), 0 1px 2px rgba(15, 23, 36, 0.04)',
  '0 4px 8px rgba(15, 23, 36, 0.08)',
  '0 6px 12px rgba(15, 23, 36, 0.1)',
  '0 8px 16px rgba(15, 23, 36, 0.1)',
  '0 10px 20px rgba(15, 23, 36, 0.12)',
  '0 12px 24px rgba(15, 23, 36, 0.12)',
  '0 14px 28px rgba(15, 23, 36, 0.14)',
  '0 16px 32px rgba(15, 23, 36, 0.14)',
  '0 18px 36px rgba(15, 23, 36, 0.15)',
  '0 20px 40px rgba(15, 23, 36, 0.16)',
  '0 22px 44px rgba(15, 23, 36, 0.16)',
  '0 24px 48px rgba(15, 23, 36, 0.17)',
  '0 26px 52px rgba(15, 23, 36, 0.18)',
  '0 28px 56px rgba(15, 23, 36, 0.18)',
  '0 30px 60px rgba(15, 23, 36, 0.19)',
  '0 32px 64px rgba(15, 23, 36, 0.2)',
  '0 34px 68px rgba(15, 23, 36, 0.2)',
  '0 36px 72px rgba(15, 23, 36, 0.21)',
  '0 38px 76px rgba(15, 23, 36, 0.22)',
  '0 40px 80px rgba(15, 23, 36, 0.22)',
  '0 42px 84px rgba(15, 23, 36, 0.23)',
  '0 44px 88px rgba(15, 23, 36, 0.24)',
  '0 46px 92px rgba(15, 23, 36, 0.24)',
] as Shadows;
