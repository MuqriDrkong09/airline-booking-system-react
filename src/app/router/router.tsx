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
import { AddonSelectionPage } from '@/pages/customer/AddonSelectionPage';
import { BaggageSelectionPage } from '@/pages/customer/BaggageSelectionPage';
import { BookingConfirmationPage } from '@/pages/customer/BookingConfirmationPage';
import { BookingDetailPage } from '@/pages/customer/BookingDetailPage';
import { BoardingPassPage } from '@/pages/customer/BoardingPassPage';
import { BookingETicketPage } from '@/pages/customer/BookingETicketPage';
import { BookingInvoicePage } from '@/pages/customer/BookingInvoicePage';
import { BookingSummaryPage } from '@/pages/customer/BookingSummaryPage';
import { CheckInPage } from '@/pages/customer/CheckInPage';
import { FlightStatusPage } from '@/pages/customer/FlightStatusPage';
import { FavouriteFlightsPage } from '@/pages/customer/FavouriteFlightsPage';
import { ManageBookingPage } from '@/pages/customer/ManageBookingPage';
import { MyBookingsPage } from '@/pages/customer/MyBookingsPage';
import { MealSelectionPage } from '@/pages/customer/MealSelectionPage';
import { NotificationPage } from '@/pages/customer/NotificationPage';
import { PaymentPage } from '@/pages/customer/PaymentPage';
import { SeatSelectionPage } from '@/pages/customer/SeatSelectionPage';
import { SearchFlightsPage } from '@/pages/customer/SearchFlightsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
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
        element: <RoleRoute allowedRoles={[UserRole.ADMIN]} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout appName={env.appName} />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
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
