import { ADMIN_NAV_ITEMS } from '@/constants/nav';
import { APP_ROUTES } from '@/constants/routes';
import { useAuth, toUserMenuModel } from '@/features/auth';
import { DashboardShell } from './DashboardShell';

export interface AdminLayoutProps {
  appName: string;
}

export function AdminLayout({ appName }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DashboardShell
      appName={appName}
      sectionLabel="Admin"
      homeTo={APP_ROUTES.admin.dashboard}
      profileTo={APP_ROUTES.admin.dashboard}
      navItems={ADMIN_NAV_ITEMS}
      navAriaLabel="Admin"
      user={toUserMenuModel(user)}
      onLogout={() => {
        void logout();
      }}
    />
  );
}
