import { expect, test } from '@playwright/test';
import { loginAs, registerCustomer } from './helpers/auth';

test.describe('Forgot / reset password', () => {
  test('resets password for a newly registered customer', async ({ page }) => {
    const account = await registerCustomer(page);
    const nextPassword = 'NewPass123!';

    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();

    await page.locator('#forgot-password-email').fill(account.email);
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByText('Request received')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Demo token:/i)).toBeVisible();
    await page
      .getByRole('link', { name: 'Continue to reset password' })
      .or(page.getByRole('button', { name: 'Continue to reset password' }))
      .click();

    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
    await expect(page.locator('#reset-password-token')).not.toHaveValue('');
    await page.locator('#reset-password').fill(nextPassword);
    await page.locator('#reset-confirm-password').fill(nextPassword);
    await page.getByRole('button', { name: 'Reset password' }).click();

    await expect(page.getByText(/Password updated|Password has been reset/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

    await loginAs(page, { email: account.email, password: nextPassword });
    await expect(page).toHaveURL(/\/app(\/|$)/);
  });
});
