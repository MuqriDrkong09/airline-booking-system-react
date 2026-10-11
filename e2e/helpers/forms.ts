import type { Page } from '@playwright/test';

export async function chooseSelectOption(
  page: Page,
  comboboxName: string | RegExp,
  optionName: string | RegExp,
) {
  await page.getByRole('combobox', { name: comboboxName }).click();
  const option =
    typeof optionName === 'string'
      ? page.getByRole('option', { name: optionName, exact: true })
      : page.getByRole('option', { name: optionName });
  await option.click();
}

export async function pickAirport(
  page: Page,
  label: string | RegExp,
  query: string,
  optionName: string | RegExp,
) {
  const input = page.getByLabel(label);
  await input.fill('');
  await input.fill(query);
  await page.getByRole('option', { name: optionName }).click();
}

/** Prefer when multiple From/To fields exist (e.g. multi-city legs). */
export async function pickAirportById(
  page: Page,
  inputId: string,
  query: string,
  optionName: string | RegExp,
) {
  const input = page.locator(`#${inputId}`);
  await input.fill('');
  await input.fill(query);
  await page.getByRole('option', { name: optionName }).click();
}

export async function fillLabeledInput(
  page: Page,
  label: string | RegExp,
  value: string,
) {
  // FormField required markers make the accessible name "Email *" (not exact "Email").
  await page.getByLabel(label).fill(value);
}
