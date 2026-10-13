import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout, CustomerLayout, PublicLayout } from '@/components/layout';
import { env } from '@/config/env';
import { AdminRoute, CustomerRoute, ProtectedRoute } from '@/features/auth';
import { RouteErrorFallback } from './RouteErrorFallback';

/** Lazy-load a named page export for route-level code splitting. */
function lazyPage<TProps extends object = object>(
  loader: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string,
): LazyExoticComponent<ComponentType<TProps>> {
  return lazy(async () => {
    const module = await loader();
    const Page = module[exportName];
    if (!Page) {
      throw new Error(`Page export "${exportName}" was not found`);
    }
    return { default: Page };
  });
}

const HomePage = lazyPage(() => import('@/pages/HomePage'), 'HomePage');
const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(
  () => import('@/pages/auth/ForgotPasswordPage'),
  'ForgotPasswordPage',
);
const ResetPasswordPage = lazyPage(
  () => import('@/pages/auth/ResetPasswordPage'),
  'ResetPasswordPage',
);
const VerifyEmailPage = lazyPage(
  () => import('@/pages/auth/VerifyEmailPage'),
  'VerifyEmailPage',
);
const ForbiddenPage = lazyPage(() => import('@/pages/ForbiddenPage'), 'ForbiddenPage');
const UnauthorizedPage = lazyPage(
  () => import('@/pages/UnauthorizedPage'),
  'UnauthorizedPage',
);
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'), 'NotFoundPage');

const CustomerHomePage = lazyPage(
  () => import('@/pages/customer/CustomerHomePage'),
  'CustomerHomePage',
);
const SearchFlightsPage = lazyPage(
  () => import('@/pages/customer/SearchFlightsPage'),
  'SearchFlightsPage',
);
const FlightDetailsPage = lazyPage(
  () => import('@/pages/customer/FlightDetailsPage'),
  'FlightDetailsPage',
);
const PassengerDetailsPage = lazyPage(
  () => import('@/pages/customer/PassengerDetailsPage'),
  'PassengerDetailsPage',
);
const SeatSelectionPage = lazyPage(
  () => import('@/pages/customer/SeatSelectionPage'),
  'SeatSelectionPage',
);
const BaggageSelectionPage = lazyPage(
  () => import('@/pages/customer/BaggageSelectionPage'),
  'BaggageSelectionPage',
);
const MealSelectionPage = lazyPage(
  () => import('@/pages/customer/MealSelectionPage'),
  'MealSelectionPage',
);
const AddonSelectionPage = lazyPage(
  () => import('@/pages/customer/AddonSelectionPage'),
  'AddonSelectionPage',
);
const BookingSummaryPage = lazyPage(
  () => import('@/pages/customer/BookingSummaryPage'),
  'BookingSummaryPage',
);
const PaymentPage = lazyPage(() => import('@/pages/customer/PaymentPage'), 'PaymentPage');
const BookingConfirmationPage = lazyPage(
  () => import('@/pages/customer/BookingConfirmationPage'),
  'BookingConfirmationPage',
);
const ManageBookingPage = lazyPage(
  () => import('@/pages/customer/ManageBookingPage'),
  'ManageBookingPage',
);
const BookingInvoicePage = lazyPage(
  () => import('@/pages/customer/BookingInvoicePage'),
  'BookingInvoicePage',
);
const BookingETicketPage = lazyPage(
  () => import('@/pages/customer/BookingETicketPage'),
  'BookingETicketPage',
);
const BoardingPassPage = lazyPage(
  () => import('@/pages/customer/BoardingPassPage'),
  'BoardingPassPage',
);
const BookingDetailPage = lazyPage(
  () => import('@/pages/customer/BookingDetailPage'),
  'BookingDetailPage',
);
const MyBookingsPage = lazyPage(
  () => import('@/pages/customer/MyBookingsPage'),
  'MyBookingsPage',
);
const CheckInPage = lazyPage(() => import('@/pages/customer/CheckInPage'), 'CheckInPage');
const FlightStatusPage = lazyPage(
  () => import('@/pages/customer/FlightStatusPage'),
  'FlightStatusPage',
);
const FavouriteFlightsPage = lazyPage(
  () => import('@/pages/customer/FavouriteFlightsPage'),
  'FavouriteFlightsPage',
);
const NotificationPage = lazyPage(
  () => import('@/pages/customer/NotificationPage'),
  'NotificationPage',
);
const ProfilePage = lazyPage(() => import('@/pages/customer/ProfilePage'), 'ProfilePage');

const AdminDashboardPage = lazyPage(
  () => import('@/pages/admin/AdminDashboardPage'),
  'AdminDashboardPage',
);
const AdminFlightsPage = lazyPage(
  () => import('@/pages/admin/AdminFlightsPage'),
  'AdminFlightsPage',
);
const AdminAirportsPage = lazyPage(
  () => import('@/pages/admin/AdminAirportsPage'),
  'AdminAirportsPage',
);
const AdminAircraftPage = lazyPage(
  () => import('@/pages/admin/AdminAircraftPage'),
  'AdminAircraftPage',
);
const AdminAircraftSeatConfigPage = lazyPage(
  () => import('@/pages/admin/AdminAircraftSeatConfigPage'),
  'AdminAircraftSeatConfigPage',
);
const AdminBookingsPage = lazyPage(
  () => import('@/pages/admin/AdminBookingsPage'),
  'AdminBookingsPage',
);
const AdminUsersPage = lazyPage(
  () => import('@/pages/admin/AdminUsersPage'),
  'AdminUsersPage',
);
const AdminPromoCodesPage = lazyPage(
  () => import('@/pages/admin/AdminPromoCodesPage'),
  'AdminPromoCodesPage',
);
const AdminReportsPage = lazyPage(
  () => import('@/pages/admin/AdminReportsPage'),
  'AdminReportsPage',
);

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
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        // USER + ADMIN — customer booking flows
        element: <CustomerRoute />,
        children: [
          {
            path: '/app',
            element: <CustomerLayout appName={env.appName} />,
            children: [
              { index: true, element: <CustomerHomePage /> },
              { path: 'flights', element: <SearchFlightsPage /> },
              { path: 'flights/:flightId', element: <FlightDetailsPage /> },
              { path: 'flights/:flightId/passengers', element: <PassengerDetailsPage /> },
              { path: 'flights/:flightId/seats', element: <SeatSelectionPage /> },
              { path: 'flights/:flightId/baggage', element: <BaggageSelectionPage /> },
              { path: 'flights/:flightId/meals', element: <MealSelectionPage /> },
              { path: 'flights/:flightId/addons', element: <AddonSelectionPage /> },
              { path: 'flights/:flightId/summary', element: <BookingSummaryPage /> },
              { path: 'flights/:flightId/payment', element: <PaymentPage /> },
              {
                path: 'bookings/:bookingReference/confirmation',
                element: <BookingConfirmationPage />,
              },
              {
                path: 'bookings/:bookingReference/manage',
                element: <ManageBookingPage />,
              },
              {
                path: 'bookings/:bookingReference/invoice',
                element: <BookingInvoicePage />,
              },
              {
                path: 'bookings/:bookingReference/eticket',
                element: <BookingETicketPage />,
              },
              {
                path: 'bookings/:bookingReference/boarding-pass',
                element: <BoardingPassPage />,
              },
              {
                path: 'bookings/:bookingReference',
                element: <BookingDetailPage />,
              },
              { path: 'bookings', element: <MyBookingsPage /> },
              { path: 'check-in', element: <CheckInPage /> },
              { path: 'flight-status', element: <FlightStatusPage /> },
              { path: 'favourites', element: <FavouriteFlightsPage /> },
              { path: 'notifications', element: <NotificationPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
      {
        // ADMIN only — management console (backend must also enforce)
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout appName={env.appName} />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'flights', element: <AdminFlightsPage /> },
              { path: 'airports', element: <AdminAirportsPage /> },
              { path: 'aircraft', element: <AdminAircraftPage /> },
              {
                path: 'aircraft/:aircraftId/seats',
                element: <AdminAircraftSeatConfigPage />,
              },
              { path: 'bookings', element: <AdminBookingsPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'promo-codes', element: <AdminPromoCodesPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
