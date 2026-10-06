import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminUserKeys,
  adminUsersApi,
  createSeedAdminUsers,
  mockAdminUsersApi,
} from '@/features/adminUsers';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { UserRole } from '@/types/auth';
import {
  mockAdminUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  root: HTMLElement | Document,
  comboboxName: RegExp,
  optionName: RegExp,
) {
  const scope = root === document ? screen : within(root as HTMLElement);
  await user.click(scope.getByRole('combobox', { name: comboboxName }));
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: optionName }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    mockAdminUsersApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminUserKeys.all });
    resetAuthStore();
    seedAuthenticatedUser(mockAdminUser);
    jest.restoreAllMocks();
  });

  it('lists users and filters by search', async () => {
    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'Aisha' },
    });

    await waitFor(() => {
      expect(screen.getByText('aisha.rahman@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    });
  });

  it('filters by role and status', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('user@example.com');
    await chooseSelectOption(user, document, /^Role$/i, /^Administrator$/i);

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await screen.findByText('user@example.com');

    await chooseSelectOption(user, document, /^Status$/i, /^Inactive$/i);

    await waitFor(() => {
      expect(screen.getByText('ben.tan@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    });
  });

  it('opens user details from the table', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('user@example.com');
    await user.click(screen.getByRole('button', { name: 'View user@example.com' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Alex Traveler' })).toBeInTheDocument();
    expect(within(dialog).getByText('user@example.com')).toBeInTheDocument();
  });

  it('deactivates a user after confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('user@example.com');
    await user.click(screen.getByRole('button', { name: 'Deactivate user@example.com' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Deactivate user' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    expect(await screen.findByText('Deactivated Alex Traveler.')).toBeInTheDocument();
    expect(
      mockAdminUsersApi.getState().find((item) => item.email === 'user@example.com')?.active,
    ).toBe(false);
  });

  it('activates an inactive user after confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('ben.tan@example.com');
    await user.click(screen.getByRole('button', { name: 'Activate ben.tan@example.com' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Activate user' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Activate' }));

    expect(await screen.findByText('Activated Ben Tan.')).toBeInTheDocument();
    expect(
      mockAdminUsersApi.getState().find((item) => item.email === 'ben.tan@example.com')?.active,
    ).toBe(true);
  });

  it('changes a user role through the dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('user@example.com');
    await user.click(screen.getByRole('button', { name: 'Change role for user@example.com' }));

    const dialog = await screen.findByRole('dialog');
    await chooseSelectOption(user, dialog, /^Role$/i, /^Administrator$/i);
    await user.click(within(dialog).getByRole('button', { name: 'Change role' }));

    expect(
      await screen.findByText('Updated Alex Traveler to Administrator.'),
    ).toBeInTheDocument();
    expect(
      mockAdminUsersApi.getState().find((item) => item.email === 'user@example.com')?.role,
    ).toBe(UserRole.ADMIN);
  });

  it('disables deactivating the signed-in admin account', async () => {
    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('admin@example.com');
    expect(screen.getByRole('button', { name: 'Deactivate admin@example.com' })).toBeDisabled();
  });

  it('blocks removing own administrator access in the role dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    await screen.findByText('admin@example.com');
    await user.click(screen.getByRole('button', { name: 'Change role for admin@example.com' }));

    const dialog = await screen.findByRole('dialog');
    await chooseSelectOption(user, dialog, /^Role$/i, /^Customer$/i);

    expect(
      within(dialog).getByText('You cannot remove your own administrator access.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Change role' })).toBeDisabled();
  });

  it('shows an error state and retries', async () => {
    const user = userEvent.setup({ delay: null });
    const listUsers = jest.spyOn(adminUsersApi, 'listUsers').mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminUsersPage />, {
      initialEntries: ['/admin/users'],
    });

    expect(await screen.findByText('Unable to load users', {}, { timeout: 3000 })).toBeInTheDocument();

    listUsers.mockResolvedValue(createSeedAdminUsers());
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });
});
