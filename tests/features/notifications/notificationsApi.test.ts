import {
  cloneSeedNotifications,
  countUnreadNotifications,
  createMockNotificationsApi,
  formatNotificationTime,
  isNotificationType,
  isNotificationUnread,
  mockNotificationsApi,
  NOTIFICATION_TYPES,
  sortNotificationsByNewest,
} from '@/features/notifications';

describe('notification helpers', () => {
  it('recognizes every supported notification type', () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(isNotificationType(type)).toBe(true);
    }

    expect(isNotificationType('UNKNOWN')).toBe(false);
  });

  it('sorts notifications newest first and counts unread items', () => {
    const notifications = cloneSeedNotifications();
    const sorted = sortNotificationsByNewest(notifications);

    expect(sorted[0]?.id).toBe('notif-1');
    expect(countUnreadNotifications(sorted)).toBeGreaterThan(0);
    expect(isNotificationUnread(sorted[0]!)).toBe(true);
  });

  it('formats relative notification timestamps', () => {
    const now = new Date('2026-10-01T12:00:00.000Z');

    expect(formatNotificationTime(now.toISOString(), now)).toBe('Just now');
    expect(
      formatNotificationTime(new Date(now.getTime() - 5 * 60_000).toISOString(), now),
    ).toBe('5m ago');
    expect(
      formatNotificationTime(new Date(now.getTime() - 3 * 3_600_000).toISOString(), now),
    ).toBe('3h ago');
    expect(
      formatNotificationTime(new Date(now.getTime() - 2 * 86_400_000).toISOString(), now),
    ).toBe('2d ago');
  });
});

describe('mockNotificationsApi', () => {
  beforeEach(() => {
    mockNotificationsApi.reset();
  });

  it('lists seed notifications and returns an unread count', async () => {
    const api = createMockNotificationsApi({ delayMs: 0 });
    const list = await api.listNotifications();
    const unread = await api.getUnreadCount();

    expect(list.length).toBeGreaterThan(0);
    expect(unread).toBe(countUnreadNotifications(list));
    expect(list.map((item) => item.type)).toEqual(
      expect.arrayContaining([...NOTIFICATION_TYPES]),
    );
  });

  it('marks one notification as read', async () => {
    const api = createMockNotificationsApi({ delayMs: 0 });
    const before = await api.getUnreadCount();
    const updated = await api.markAsRead('notif-1');

    expect(updated.readAt).not.toBeNull();
    expect(await api.getUnreadCount()).toBe(before - 1);
  });

  it('marks all notifications as read', async () => {
    const api = createMockNotificationsApi({ delayMs: 0 });
    const list = await api.markAllAsRead();

    expect(countUnreadNotifications(list)).toBe(0);
    expect(await api.getUnreadCount()).toBe(0);
  });

  it('deletes a notification', async () => {
    const api = createMockNotificationsApi({ delayMs: 0 });
    await api.deleteNotification('notif-1');
    const list = await api.listNotifications();

    expect(list.find((item) => item.id === 'notif-1')).toBeUndefined();
  });

  it('throws when marking or deleting a missing notification', async () => {
    const api = createMockNotificationsApi({ delayMs: 0 });

    await expect(api.markAsRead('missing')).rejects.toThrow(/not found/i);
    await expect(api.deleteNotification('missing')).rejects.toThrow(/not found/i);
  });
});
