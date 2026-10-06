import type { AxiosInstance } from 'axios';
import {
  canChangeAdminUserRole,
  canDeactivateAdminUser,
  createHttpAdminUsersApi,
  createMockAdminUsersApi,
  createSeedAdminUsers,
  EMPTY_ADMIN_USER_FILTERS,
  filterAdminUsers,
  mockAdminUsersApi,
} from '@/features/adminUsers';
import { apiClient } from '@/services/api/client';
import { UserRole } from '@/types/auth';

describe('filterAdminUsers', () => {
  const users = createSeedAdminUsers();

  it('filters by search, role, and active status', () => {
    expect(
      filterAdminUsers(users, {
        search: 'aisha',
        role: '',
        active: '',
      }).map((user) => user.email),
    ).toEqual(['aisha.rahman@example.com']);

    expect(
      filterAdminUsers(users, {
        search: '',
        role: UserRole.ADMIN,
        active: 'active',
      }).every((user) => user.role === UserRole.ADMIN && user.active),
    ).toBe(true);

    expect(
      filterAdminUsers(users, {
        search: '',
        role: '',
        active: 'inactive',
      }).every((user) => !user.active),
    ).toBe(true);
  });

  it('returns all users when filters are empty', () => {
    expect(filterAdminUsers(users, EMPTY_ADMIN_USER_FILTERS)).toHaveLength(users.length);
  });
});

describe('admin user self-protection helpers', () => {
  const users = createSeedAdminUsers();
  const admin = users.find((user) => user.id === 'admin-1')!;
  const customer = users.find((user) => user.id === 'user-1')!;

  it('blocks self-deactivation and self demotion from ADMIN', () => {
    expect(canDeactivateAdminUser(admin, 'admin-1')).toBe(false);
    expect(canDeactivateAdminUser(customer, 'admin-1')).toBe(true);
    expect(canChangeAdminUserRole(admin, UserRole.USER, 'admin-1')).toBe(false);
    expect(canChangeAdminUserRole(customer, UserRole.ADMIN, 'admin-1')).toBe(true);
  });
});

describe('mockAdminUsersApi', () => {
  beforeEach(() => {
    mockAdminUsersApi.reset();
  });

  it('lists, activates, deactivates, and changes roles', async () => {
    const api = createMockAdminUsersApi({ delayMs: 0 });

    const listed = await api.listUsers({
      search: 'Traveler',
      role: '',
      active: '',
    });
    expect(listed.map((user) => user.email)).toEqual(['user@example.com']);

    const deactivated = await api.setUserActive('user-1', false, 'admin-1');
    expect(deactivated.active).toBe(false);

    const activated = await api.setUserActive('user-1', true, 'admin-1');
    expect(activated.active).toBe(true);

    const promoted = await api.changeUserRole('user-1', UserRole.ADMIN, 'admin-1');
    expect(promoted.role).toBe(UserRole.ADMIN);
  });

  it('prevents an admin from deactivating or demoting themselves', async () => {
    const api = createMockAdminUsersApi({ delayMs: 0 });

    await expect(api.setUserActive('admin-1', false, 'admin-1')).rejects.toThrow(
      'You cannot deactivate your own account.',
    );
    await expect(api.changeUserRole('admin-1', UserRole.USER, 'admin-1')).rejects.toThrow(
      'You cannot remove your own administrator access.',
    );
  });

  it('rejects missing users', async () => {
    const api = createMockAdminUsersApi({ delayMs: 0 });
    await expect(api.getUser('missing')).rejects.toThrow('User not found');
  });
});

describe('createHttpAdminUsersApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls admin user endpoints with query params', async () => {
    const seed = createSeedAdminUsers()[0]!;
    const get = jest.fn().mockResolvedValue({ data: [seed] });
    const patch = jest.fn().mockResolvedValue({ data: seed });
    const client = { get, patch } as unknown as AxiosInstance;
    const api = createHttpAdminUsersApi(client);

    await api.listUsers({
      search: 'Jordan',
      role: UserRole.ADMIN,
      active: 'active',
    });
    expect(get).toHaveBeenCalledWith('/admin/users', {
      params: {
        search: 'Jordan',
        role: 'ADMIN',
        active: 'active',
      },
    });

    get.mockResolvedValueOnce({ data: seed });
    await api.getUser('admin/1');
    expect(get).toHaveBeenCalledWith('/admin/users/admin%2F1');

    await api.setUserActive('admin-2', false, 'admin-1');
    expect(patch).toHaveBeenCalledWith('/admin/users/admin-2/active', { active: false });

    await api.changeUserRole('user-1', UserRole.ADMIN, 'admin-1');
    expect(patch).toHaveBeenCalledWith('/admin/users/user-1/role', { role: 'ADMIN' });
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createSeedAdminUsers()[0]!;
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [seed] });
    const api = createHttpAdminUsersApi();
    const data = await api.listUsers({
      search: 'admin',
      role: '',
      active: '',
    });

    expect(get).toHaveBeenCalledWith('/admin/users', {
      params: { search: 'admin' },
    });
    expect(data).toEqual([seed]);
  });
});
