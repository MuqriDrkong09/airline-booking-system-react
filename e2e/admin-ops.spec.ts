import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { toIsoDate, addDays } from './helpers/dates';
test.describe('Admin operations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('creates an airport', async ({ page }) => {
    const code = `E${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    await page.goto('/admin/airports');
    await expect(page.getByRole('heading', { name: 'Airports' })).toBeVisible();

    await page.getByRole('button', { name: 'Create airport' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Create airport' })).toBeVisible();

    await dialog.locator('#airport-code').fill(code);
    await dialog.locator('#airport-name').fill(`${code} Test International`);
    await dialog.locator('#airport-city').fill('Testville');
    await dialog.locator('#airport-country').fill('Malaysia');
    await dialog.locator('#airport-timezone').fill('Asia/Kuala_Lumpur');
    await dialog.locator('#airport-terminals').fill('2');
    await dialog.locator('#airport-latitude').fill('3.139');
    await dialog.locator('#airport-longitude').fill('101.687');

    await dialog.getByRole('button', { name: 'Create airport' }).click();
    await expect(page.getByText(code, { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test('creates a promo code', async ({ page }) => {
    const code = `E2E${String(Date.now()).slice(-5)}`;
    const start = toIsoDate(new Date());
    const end = toIsoDate(addDays(new Date(), 60));

    await page.goto('/admin/promo-codes');
    await expect(page.getByRole('heading', { name: /Promo Codes|Promo codes/i })).toBeVisible();

    await page.getByRole('button', { name: 'Create promo code' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Create promo code' })).toBeVisible();

    await dialog.locator('#promo-code').fill(code);
    await dialog.getByPlaceholder('15% off bookings').fill('E2E automation discount');
    await dialog.getByLabel(/Discount value/i).fill('25');
    await dialog.getByLabel(/Start date/i).fill(start);
    await dialog.getByLabel(/End date/i).fill(end);

    await dialog.getByRole('button', { name: 'Create promo code' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(code, { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test('views a seeded admin booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();

    const viewButton = page.getByRole('button', { name: /View AB-/i }).first();
    await expect(viewButton).toBeVisible({ timeout: 15_000 });
    await viewButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/AB-/i).first()).toBeVisible();
  });

  test('opens a user details dialog', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

    const viewButton = page
      .getByRole('button', { name: /View user@example.com|View .*@example.com/i })
      .first();
    await expect(viewButton).toBeVisible({ timeout: 15_000 });
    await viewButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/@example.com/i).first()).toBeVisible();
  });
});
