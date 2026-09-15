import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout, CustomerLayout, PublicLayout } from '@/components/layout';
import { env } from '@/config/env';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { RouteErrorFallback } from './RouteErrorFallback';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout appName={env.appName} />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <PlaceholderPage title="Sign in" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/app',
    element: <CustomerLayout appName={env.appName} />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <PlaceholderPage title="Customer Home" /> },
      { path: 'flights', element: <PlaceholderPage title="Search Flights" /> },
      { path: 'bookings', element: <PlaceholderPage title="My Bookings" /> },
      { path: 'check-in', element: <PlaceholderPage title="Check-in" /> },
      { path: 'notifications', element: <PlaceholderPage title="Notifications" /> },
      { path: 'profile', element: <PlaceholderPage title="Profile" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout appName={env.appName} />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <PlaceholderPage title="Dashboard" /> },
      { path: 'flights', element: <PlaceholderPage title="Flights" /> },
      { path: 'airports', element: <PlaceholderPage title="Airports" /> },
      { path: 'aircraft', element: <PlaceholderPage title="Aircraft" /> },
      { path: 'bookings', element: <PlaceholderPage title="Bookings" /> },
      { path: 'users', element: <PlaceholderPage title="Users" /> },
      { path: 'promo-codes', element: <PlaceholderPage title="Promo Codes" /> },
      { path: 'reports', element: <PlaceholderPage title="Reports" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
