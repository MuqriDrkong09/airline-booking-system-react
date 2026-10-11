import { expect, type Page } from '@playwright/test';
import { chooseSelectOption } from './forms';

export const DEMO_CUSTOMER = {
  email: 'user@example.com',
  password: 'Password123!',
} as const;

export const DEMO_ADMIN = {
  email: 'admin@example.com',
  password: 'Password123!',
} as const;

export async function loginAs(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByPlaceholder('you@example.com').fill(credentials.email);
  await page.locator('#login-password').fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function loginAsCustomer(page: Page) {
  await loginAs(page, DEMO_CUSTOMER);
  await expect(page).toHaveURL(/\/app(\/|$)/);
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, DEMO_ADMIN);
  await expect(page).toHaveURL(/\/admin(\/|$)/);
}

export async function registerCustomer(
  page: Page,
  overrides: { email?: string; lastName?: string } = {},
) {
  const email =
    overrides.email ?? `e2e.user.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
  const lastName = overrides.lastName ?? 'Traveler';

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();

  await chooseSelectOption(page, /^Title$/i, 'Mr');
  await page.locator('#register-first-name').fill('Alex');
  await page.locator('#register-last-name').fill(lastName);
  await page.locator('#register-email').fill(email);
  await page.locator('#register-phone').fill('+60 12 345 6789');
  await page.locator('#register-date-of-birth').fill('1990-06-15');
  await chooseSelectOption(page, /^Nationality$/i, 'Malaysia');
  await page.locator('#register-password').fill('Password123!');
  await page.locator('#register-confirm-password').fill('Password123!');
  await page
    .getByRole('checkbox', {
      name: /I accept the terms and conditions and privacy policy/i,
    })
    .check();

  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText(/Account created|Registration successful/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page).toHaveURL(/\/verify-email/, { timeout: 20_000 });

  await expect(page.locator('#verify-email-token')).not.toHaveValue('');
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page.getByText(/Email verified/i)).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

  return { email, password: 'Password123!', lastName };
}
