import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import { futureDepartureDate } from './helpers/dates';

test.describe('Flight status', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/app/flight-status');
    await expect(page.getByRole('heading', { name: 'Flight status' })).toBeVisible();
  });

  test('looks up demo operational status', async ({ page }) => {
    await page.getByLabel(/Flight number/i).fill('MH123');
    await page.getByLabel(/Departure date/i).fill(futureDepartureDate(3));
    await page.getByRole('button', { name: 'Check status' }).click();

    await expect(page.getByText(/Demo operational data|Status/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/MH123/i).first()).toBeVisible();
  });

  test('shows empty state for ZZ000 fixture', async ({ page }) => {
    await page.getByLabel(/Flight number/i).fill('ZZ000');
    await page.getByLabel(/Departure date/i).fill(futureDepartureDate(3));
    await page.getByRole('button', { name: 'Check status' }).click();

    await expect(page.getByText(/No flight found/i)).toBeVisible({ timeout: 15_000 });
  });
});
