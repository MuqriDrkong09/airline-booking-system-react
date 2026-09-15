import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { env } from '@/config/env';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { RouteErrorFallback } from './RouteErrorFallback';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell appName={env.appName} />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'flights', element: <PlaceholderPage title="Flights" /> },
      { path: 'bookings', element: <PlaceholderPage title="My Bookings" /> },
      { path: 'check-in', element: <PlaceholderPage title="Check-in" /> },
      { path: 'profile', element: <PlaceholderPage title="Profile" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
