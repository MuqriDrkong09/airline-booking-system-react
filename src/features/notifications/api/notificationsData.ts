import { APP_ROUTES } from '@/constants/routes';
import type { AppNotification } from '../types/notification';

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const SEED_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: 'notif-1',
    type: 'BOOKING_CONFIRMED',
    title: 'Booking confirmed',
    message: 'Your booking AB-1001 for MH123 KUL → SIN is confirmed.',
    createdAt: hoursAgo(1),
    readAt: null,
    bookingReference: 'AB-1001',
    href: APP_ROUTES.customer.bookingDetail('AB-1001'),
  },
  {
    id: 'notif-2',
    type: 'PAYMENT_SUCCESS',
    title: 'Payment successful',
    message: 'We received your payment of RM 482.00 for booking AB-1001.',
    createdAt: hoursAgo(2),
    readAt: null,
    bookingReference: 'AB-1001',
    href: APP_ROUTES.customer.bookingInvoice('AB-1001'),
  },
  {
    id: 'notif-3',
    type: 'CHECK_IN_AVAILABLE',
    title: 'Check-in is open',
    message: 'Online check-in is now available for MH456 on your upcoming trip.',
    createdAt: hoursAgo(5),
    readAt: null,
    bookingReference: 'AB-2044',
    href: APP_ROUTES.customer.checkIn,
  },
  {
    id: 'notif-4',
    type: 'FLIGHT_DELAYED',
    title: 'Flight delayed',
    message: 'Flight MH789 is delayed by 45 minutes. New departure is 14:45.',
    createdAt: hoursAgo(8),
    readAt: null,
    href: APP_ROUTES.customer.flightStatus,
  },
  {
    id: 'notif-5',
    type: 'BOARDING',
    title: 'Boarding starting soon',
    message: 'Boarding for MH123 at gate B12 begins in 20 minutes.',
    createdAt: hoursAgo(12),
    readAt: hoursAgo(10),
    bookingReference: 'AB-1001',
    href: APP_ROUTES.customer.bookingBoardingPass('AB-1001'),
  },
  {
    id: 'notif-6',
    type: 'PAYMENT_FAILED',
    title: 'Payment failed',
    message: 'Your payment for booking AB-3099 could not be processed. Please try again.',
    createdAt: hoursAgo(26),
    readAt: hoursAgo(24),
    bookingReference: 'AB-3099',
    href: APP_ROUTES.customer.bookings,
  },
  {
    id: 'notif-7',
    type: 'FLIGHT_CANCELLED',
    title: 'Flight cancelled',
    message: 'Flight AK210 has been cancelled. Review your booking for rebooking options.',
    createdAt: hoursAgo(30),
    readAt: hoursAgo(28),
    bookingReference: 'AB-4410',
    href: APP_ROUTES.customer.bookingDetail('AB-4410'),
  },
  {
    id: 'notif-8',
    type: 'BOOKING_CANCELLED',
    title: 'Booking cancelled',
    message: 'Booking AB-5520 was cancelled. A refund will be processed if applicable.',
    createdAt: hoursAgo(48),
    readAt: hoursAgo(47),
    bookingReference: 'AB-5520',
    href: APP_ROUTES.customer.bookingDetail('AB-5520'),
  },
];

export function cloneSeedNotifications(): AppNotification[] {
  return SEED_NOTIFICATIONS.map((notification) => ({ ...notification }));
}

export function sortNotificationsByNewest(notifications: AppNotification[]): AppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function countUnreadNotifications(notifications: AppNotification[]): number {
  return notifications.filter((notification) => notification.readAt === null).length;
}
