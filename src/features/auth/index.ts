export { AuthBootstrap } from './components/AuthBootstrap';
export { AuthPageShell, AuthTextLink } from './components/AuthPageShell';
export { AdminRoute } from './components/AdminRoute';
export { CustomerRoute } from './components/CustomerRoute';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { LoginForm } from './components/LoginForm';
export { ProtectedRoute } from './components/ProtectedRoute';
export { RegisterForm } from './components/RegisterForm';
export { ResetPasswordForm } from './components/ResetPasswordForm';
export { RoleRoute } from './components/RoleRoute';
export type { RoleRouteProps } from './components/RoleRoute';
export { VerifyEmailForm } from './components/VerifyEmailForm';
export { useAuth } from './hooks/useAuth';
export {
  createAuthStore,
  selectIsAuthenticated,
  useAuthStore,
} from './store/authStore';
export type { AuthStatus } from './store/authStore';
export * from './schemas';
export {
  extractDemoToken,
  getDisplayName,
  getPostLoginRedirect,
  getRoleLabel,
  toUserMenuModel,
} from './utils/authHelpers';
export {
  ADMIN_AREA_ROLES,
  CUSTOMER_AREA_ROLES,
  canAccessAdminArea,
  canAccessCustomerArea,
  getHomePathForRole,
  hasRole,
} from './utils/rbac';
export type { AdminAreaRole, CustomerAreaRole } from './utils/rbac';
