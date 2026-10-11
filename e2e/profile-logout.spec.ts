import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';

test.describe('Profile and logout', () => {
  test('edits profile details and logs out', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();

    await page.getByRole('button', { name: 'Edit profile' }).click();
    await expect(page.getByText('Edit profile').first()).toBeVisible();

    await page.locator('#profile-phone').fill('+60 12 999 8888');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByText(/Saved|Personal details/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('+60 12 999 8888')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();

    // Logout returns to the public home page with auth CTAs (not the logged-in user menu).
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open user menu' })).toHaveCount(0);
  });
});


