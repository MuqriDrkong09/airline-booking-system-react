/**
 * @deprecated Prefer `setupApiInterceptors` from `@/services/api`.
 * Kept so existing imports continue to work.
 */
export {
  attachAuthInterceptors,
  setupApiInterceptors,
  resetApiInterceptorsForTests,
} from '@/services/api/interceptors';
