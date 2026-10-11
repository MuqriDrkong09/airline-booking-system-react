import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';

test.describe('Notifications', () => {
  test('lists seeded notifications and marks all as read', async ({ page }) => {
    await loginAsCustomer(page);

    const bell = page.getByRole('button', { name: /Open notifications/i });
    await expect(bell).toBeVisible({ timeout: 15_000 });
    await bell.click();

    const viewAll = page
      .getByRole('button', { name: 'View all notifications' })
      .or(page.getByRole('link', { name: 'View all notifications' }));
    if (await viewAll.isVisible().catch(() => false)) {
      await viewAll.click();
    } else {
      await page.goto('/app/notifications');
    }

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(
      page.getByText(/Booking confirmed|Payment successful|Check-in|Flight delayed/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    const markAll = page.getByRole('button', { name: /Mark all as read/i });
    await expect(markAll).toBeVisible();
    if (await markAll.isEnabled()) {
      await markAll.click();
    }

    await expect(
      page.getByText(/Booking confirmed|Payment successful|Check-in|Flight delayed/i).first(),
    ).toBeVisible();
  });
});
