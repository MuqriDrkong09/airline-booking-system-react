import { expect, test } from '@playwright/test';
import { loginAs, loginAsAdmin, loginAsCustomer, registerCustomer } from './helpers/auth';

test.describe('Authentication', () => {
  test('1. User registration (with email verification)', async ({ page }) => {
    const account = await registerCustomer(page);

    await loginAs(page, account);
    await expect(page).toHaveURL(/\/app(\/|$)/);
  });

  test('2. User login', async ({ page }) => {
    await loginAsCustomer(page);
    await expect(page).toHaveURL(/\/app(\/|$)/);
    await expect(
      page.getByRole('link', { name: /Search Flights|My Bookings/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('16. Admin login', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin(\/|$)/);
    await expect(page.getByRole('link', { name: 'Flights' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
