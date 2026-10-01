import { CUSTOMER_NAV_ITEMS } from '@/constants/nav';
import { APP_ROUTES } from '@/constants/routes';
import { useAuth, toUserMenuModel } from '@/features/auth';
import { NotificationBell } from '@/features/notifications';
import { DashboardShell } from './DashboardShell';

export interface CustomerLayoutProps {
  appName: string;
}

export function CustomerLayout({ appName }: CustomerLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DashboardShell
      appName={appName}
      sectionLabel="Customer"
      homeTo={APP_ROUTES.customer.home}
      profileTo={APP_ROUTES.customer.profile}
      navItems={CUSTOMER_NAV_ITEMS}
      navAriaLabel="Customer"
      user={toUserMenuModel(user)}
      headerActions={<NotificationBell />}
      onLogout={() => {
        void logout();
      }}
    />
  );
}
