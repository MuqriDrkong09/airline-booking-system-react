import type { AppBadgeTone } from '@/components/common/AppBadge';
import type { NotificationType } from '../types/notification';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  BOOKING_CONFIRMED: 'Booking confirmed',
  PAYMENT_SUCCESS: 'Payment success',
  PAYMENT_FAILED: 'Payment failed',
  FLIGHT_DELAYED: 'Flight delayed',
  FLIGHT_CANCELLED: 'Flight cancelled',
  CHECK_IN_AVAILABLE: 'Check-in available',
  BOARDING: 'Boarding',
  BOOKING_CANCELLED: 'Booking cancelled',
};

export const NOTIFICATION_TYPE_TONES: Record<NotificationType, AppBadgeTone> = {
  BOOKING_CONFIRMED: 'success',
  PAYMENT_SUCCESS: 'success',
  PAYMENT_FAILED: 'error',
  FLIGHT_DELAYED: 'warning',
  FLIGHT_CANCELLED: 'error',
  CHECK_IN_AVAILABLE: 'info',
  BOARDING: 'primary',
  BOOKING_CANCELLED: 'warning',
};

export function formatNotificationTime(isoDate: string, now = new Date()): string {
  const created = new Date(isoDate);
  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return created.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
