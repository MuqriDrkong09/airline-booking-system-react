import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  NotificationBell,
  NotificationCard,
  notificationKeys,
  mockNotificationsApi,
} from '@/features/notifications';
import { NotificationPage } from '@/pages/customer/NotificationPage';
import { renderWithProviders } from '@tests/utils/test-utils';

function resetNotificationsTestState() {
  mockNotificationsApi.reset();
  queryClient.removeQueries({ queryKey: notificationKeys.all });
}

describe('NotificationPage', () => {
  beforeEach(() => {
    resetNotificationsTestState();
  });

  it('lists notifications with unread badges', async () => {
    renderWithProviders(<NotificationPage />, {
      initialEntries: ['/app/notifications'],
    });

    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();
    expect(screen.getAllByText('Unread').length).toBeGreaterThan(0);
  });

  it('marks a notification as read', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationPage />, {
      initialEntries: ['/app/notifications'],
    });

    const title = await screen.findByRole('heading', { name: 'Booking confirmed' });
    const card = title.closest('[class*="MuiPaper-root"]') as HTMLElement;

    await user.click(
      within(card).getByRole('button', {
        name: /Mark "Booking confirmed" as read/i,
      }),
    );

    await waitFor(() => {
      expect(within(card).queryByText('Unread')).not.toBeInTheDocument();
    });
  });

  it('marks all notifications as read', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationPage />, {
      initialEntries: ['/app/notifications'],
    });

    await screen.findByRole('heading', { name: 'Booking confirmed' });
    await user.click(screen.getByRole('button', { name: /Mark all as read/i }));

    await waitFor(() => {
      expect(screen.queryByText('Unread')).not.toBeInTheDocument();
    });
  });

  it('deletes a notification', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationPage />, {
      initialEntries: ['/app/notifications'],
    });

    expect(await screen.findByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Delete "Booking confirmed"/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Booking confirmed' })).not.toBeInTheDocument();
    });
  });
});

describe('NotificationCard', () => {
  beforeEach(() => {
    resetNotificationsTestState();
  });

  it('renders type label and action callbacks', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = jest.fn();
    const onDelete = jest.fn();
    const [notification] = mockNotificationsApi.getState();

    renderWithProviders(
      <NotificationCard
        notification={notification!}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View details' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mark "Booking confirmed" as read/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Booking confirmed"/i }));

    expect(onMarkAsRead).toHaveBeenCalledWith(notification!.id);
    expect(onDelete).toHaveBeenCalledWith(notification!.id);
  });
});

describe('NotificationBell', () => {
  beforeEach(() => {
    resetNotificationsTestState();
  });

  it('shows unread count and opens the dropdown', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationBell />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Open notifications, \d+ unread/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Open notifications/i }));

    expect(await screen.findByRole('menu', { name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View all notifications/i })).toHaveAttribute(
      'href',
      '/app/notifications',
    );
  });

  it('marks all as read from the dropdown', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationBell />);

    await user.click(await screen.findByRole('button', { name: /Open notifications/i }));
    expect(await screen.findByRole('heading', { name: 'Booking confirmed' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mark all read/i }));

    await waitFor(() => {
      expect(screen.queryByText('Unread')).not.toBeInTheDocument();
    });
  });
});
