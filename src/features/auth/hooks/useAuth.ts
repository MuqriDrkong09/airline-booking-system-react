import { useAuthStore, selectIsAuthenticated } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const error = useAuthStore((state) => state.error);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const bootstrap = useAuthStore((state) => state.bootstrap);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    status,
    isBootstrapping,
    isSubmitting,
    error,
    accessToken,
    isAuthenticated,
    bootstrap,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
  };
}
