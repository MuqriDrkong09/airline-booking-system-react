import { createJSONStorage } from 'zustand/middleware';

/**
 * Session-scoped Zustand storage for drafts / booking PII.
 * Cleared when the browser session ends — avoids long-lived localStorage copies
 * of passport numbers, emails, and booking payloads on shared machines.
 *
 * Access tokens still use the dedicated tokenStorage (remember-me aware).
 * Frontend storage is not a substitute for server-side authorization or encryption.
 */
export const sessionPersistStorage = createJSONStorage(() => sessionStorage);

/** Legacy localStorage keys that previously held passenger / booking PII. */
const LEGACY_PII_LOCAL_KEYS = [
  'aerobook-booking',
  'aerobook-bookings',
  'aerobook-passenger-draft',
  'aerobook-seat-selection',
] as const;

/** Removes leftover PII from localStorage after migrating stores to sessionStorage. */
export function clearLegacyPiiLocalStorage(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  for (const key of LEGACY_PII_LOCAL_KEYS) {
    localStorage.removeItem(key);
  }
}
