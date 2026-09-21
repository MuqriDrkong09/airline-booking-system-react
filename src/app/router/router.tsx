import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout, CustomerLayout, PublicLayout } from '@/components/layout';
import { env } from '@/config/env';
import { ProtectedRoute, RoleRoute } from '@/features/auth';
import { UserRole } from '@/types/auth';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';
import { FlightDetailsPage } from '@/pages/customer/FlightDetailsPage';
import { PassengerDetailsPage } from '@/pages/customer/PassengerDetailsPage';
import { SeatSelectionPage } from '@/pages/customer/SeatSelectionPage';
import { SearchFlightsPage } from '@/pages/customer/SearchFlightsPage';
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
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        element: <RoleRoute allowedRoles={[UserRole.USER]} />,
        children: [
          {
            path: '/app',
            element: <CustomerLayout appName={env.appName} />,
            children: [
              { index: true, element: <PlaceholderPage title="Customer Home" /> },
              { path: 'flights', element: <SearchFlightsPage /> },
              { path: 'flights/:flightId', element: <FlightDetailsPage /> },
              { path: 'flights/:flightId/passengers', element: <PassengerDetailsPage /> },
              { path: 'flights/:flightId/seats', element: <SeatSelectionPage /> },
              { path: 'bookings', element: <PlaceholderPage title="My Bookings" /> },
              { path: 'check-in', element: <PlaceholderPage title="Check-in" /> },
              { path: 'notifications', element: <PlaceholderPage title="Notifications" /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={[UserRole.ADMIN]} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout appName={env.appName} />,
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
        ],
      },
    ],
  },
]);
