export const NOTIFICATION_TYPES = [
  'BOOKING_CONFIRMED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'FLIGHT_DELAYED',
  'FLIGHT_CANCELLED',
  'CHECK_IN_AVAILABLE',
  'BOARDING',
  'BOOKING_CANCELLED',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  href?: string;
  bookingReference?: string;
}

export function isNotificationUnread(notification: AppNotification): boolean {
  return notification.readAt === null;
}
