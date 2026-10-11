import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import { completeBookingThroughConfirmation } from './helpers/booking';

test.describe('Manage booking', () => {
  test('updates passenger contact details', async ({ page }) => {
    await loginAsCustomer(page);
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await page.goto(
      `/app/bookings/${encodeURIComponent(reference)}/manage?section=contact`,
    );
    await expect(page.getByRole('heading', { name: 'Manage booking' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save contact details' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByLabel(/Email/i).first().fill('updated.e2e@example.com');
    await page.getByLabel(/Phone/i).first().fill('+60 19 888 7777');
    await page.getByRole('button', { name: 'Save contact details' }).click();

    await expect(page.getByText(/Contact details were updated/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
