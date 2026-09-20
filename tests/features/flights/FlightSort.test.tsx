import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FLIGHT_SORT_OPTIONS,
  FLIGHT_SORT_OPTION_LABELS,
  FlightSort,
} from '@/features/flights';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('FlightSort', () => {
  it('renders all type-safe sort options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <FlightSort value="recommended" onChange={onChange} />,
    );

    await user.click(screen.getByLabelText('Sort by'));

    for (const option of FLIGHT_SORT_OPTIONS) {
      expect(
        await screen.findByRole('option', { name: FLIGHT_SORT_OPTION_LABELS[option] }),
      ).toBeInTheDocument();
    }
  });

  it('notifies when the user picks another sort option', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <FlightSort value="recommended" onChange={onChange} />,
    );

    await user.click(screen.getByLabelText('Sort by'));
    await user.click(await screen.findByRole('option', { name: 'Lowest Price' }));

    expect(onChange).toHaveBeenCalledWith('lowest_price');
  });
});
