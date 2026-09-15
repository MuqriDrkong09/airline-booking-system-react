import { DEMO_CUSTOMER } from '@/constants/demoUser';
import { CUSTOMER_NAV_ITEMS } from '@/constants/nav';
import { APP_ROUTES } from '@/constants/routes';
import { DashboardShell } from './DashboardShell';

export interface CustomerLayoutProps {
  appName: string;
}

export function CustomerLayout({ appName }: CustomerLayoutProps) {
  return (
    <DashboardShell
      appName={appName}
      sectionLabel="Customer"
      homeTo={APP_ROUTES.customer.home}
      profileTo={APP_ROUTES.customer.profile}
      navItems={CUSTOMER_NAV_ITEMS}
      navAriaLabel="Customer"
      user={DEMO_CUSTOMER}
    />
  );
}
