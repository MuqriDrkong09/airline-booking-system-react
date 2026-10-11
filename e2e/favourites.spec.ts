import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import { openSearchResults } from './helpers/booking';

test.describe('Favourite flights', () => {
  test('adds and removes a favourite from search results', async ({ page }) => {
    await loginAsCustomer(page);
    await openSearchResults(page);

    const addButton = page.getByRole('button', { name: 'Add to favourites' }).first();
    await expect(addButton).toBeVisible({ timeout: 15_000 });
    await addButton.click();
    await expect(
      page.getByRole('button', { name: 'Remove from favourites' }).first(),
    ).toBeVisible();

    await page.goto('/app/favourites');
    await expect(page.getByRole('heading', { name: 'Favourite flights' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' }).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText(/No favourite flights yet/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
