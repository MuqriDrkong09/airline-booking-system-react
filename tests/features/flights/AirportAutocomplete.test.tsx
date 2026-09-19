import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { AirportAutocomplete, type Airport } from '@/features/flights';
import { renderWithProviders } from '@tests/utils/test-utils';

function AutocompleteHarness({ excludeAirportCode }: { excludeAirportCode?: string }) {
  const [value, setValue] = useState<Airport | null>(null);

  return (
    <AirportAutocomplete
      id="origin-airport"
      label="From"
      value={value}
      onChange={setValue}
      excludeAirportCode={excludeAirportCode}
    />
  );
}

describe('AirportAutocomplete', () => {
  it('searches airports and selects a result', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AutocompleteHarness />);

    const input = screen.getByLabelText(/^From/i);
    await user.type(input, 'Kuala');

    const option = await screen.findByRole('option', {
      name: /KUL — Kuala Lumpur International Airport/i,
    });
    await user.click(option);

    await waitFor(() => {
      expect(input).toHaveValue('KUL — Kuala Lumpur');
    });
  });

  it('excludes a configured airport code from options', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AutocompleteHarness excludeAirportCode="KUL" />);

    const input = screen.getByLabelText(/^From/i);
    await user.type(input, 'Malaysia');

    expect(
      await screen.findByRole('option', { name: /PEN — Penang International Airport/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /KUL — Kuala Lumpur International Airport/i }),
    ).not.toBeInTheDocument();
  });
});
