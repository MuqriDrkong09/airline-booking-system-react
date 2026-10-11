import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import { searchOneWayFlights, searchRoundTripFlights } from './helpers/booking';

test.describe('Flight search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('3. Search one-way flight', async ({ page }) => {
    const criteria = await searchOneWayFlights(page);

    await expect(page.getByRole('alert')).toContainText(criteria.from);
    await expect(page.getByRole('alert')).toContainText(criteria.to);
    await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();
  });

  test('4. Search round-trip flight', async ({ page }) => {
    const criteria = await searchRoundTripFlights(page);

    await expect(page.getByRole('alert')).toContainText(criteria.from);
    await expect(page.getByRole('alert')).toContainText(criteria.to);
    await expect(page.getByLabel(/Return date/i)).toHaveValue(criteria.returnDate);
    await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();
  });
});
