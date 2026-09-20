import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppDatePicker } from '@/components/common/AppDatePicker';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppDatePicker', () => {
  it('renders a native date input with the default Date label', () => {
    renderWithProviders(<AppDatePicker />);

    const input = screen.getByLabelText('Date');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('supports a custom label, value, and change handler', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <AppDatePicker label="Departure date" value="2026-10-20" onChange={onChange} />,
    );

    const input = screen.getByLabelText('Departure date');
    expect(input).toHaveValue('2026-10-20');

    await user.clear(input);
    await user.type(input, '2026-10-27');

    expect(onChange).toHaveBeenCalled();
  });

  it('applies min and max constraints on the underlying input', () => {
    renderWithProviders(
      <AppDatePicker label="Return date" min="2026-10-20" max="2026-12-31" />,
    );

    const input = screen.getByLabelText('Return date');
    expect(input).toHaveAttribute('min', '2026-10-20');
    expect(input).toHaveAttribute('max', '2026-12-31');
  });

  it('keeps the floating label shrunk for date inputs', () => {
    const { container } = renderWithProviders(<AppDatePicker label="Travel date" />);

    expect(container.querySelector('.MuiInputLabel-shrink')).toBeInTheDocument();
  });

  it('merges object slotProps for inputLabel and htmlInput', () => {
    renderWithProviders(
      <AppDatePicker
        label="Constrained date"
        min="2026-01-01"
        max="2026-12-31"
        slotProps={{
          inputLabel: { className: 'custom-date-label' },
          htmlInput: {
            'data-testid': 'date-html-input',
            min: '2026-06-01',
            step: 1,
          },
        }}
      />,
    );

    const input = screen.getByTestId('date-html-input');
    expect(input).toHaveAttribute('min', '2026-06-01');
    expect(input).toHaveAttribute('max', '2026-12-31');
    expect(input).toHaveAttribute('step', '1');
    expect(document.querySelector('.custom-date-label')).toBeInTheDocument();
  });

  it('ignores non-object slotProps values for inputLabel and htmlInput', () => {
    renderWithProviders(
      <AppDatePicker
        label="Fallback slots"
        min="2026-03-01"
        max="2026-03-31"
        slotProps={{
          // Force the non-object branches in AppDatePicker.
          inputLabel: 'not-an-object' as unknown as object,
          htmlInput: null as unknown as object,
        }}
      />,
    );

    const input = screen.getByLabelText('Fallback slots');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('min', '2026-03-01');
    expect(input).toHaveAttribute('max', '2026-03-31');
  });

  it('forwards additional TextField props', () => {
    renderWithProviders(
      <AppDatePicker
        id="flight-departure"
        data-testid="app-date-picker"
        required
        helperText="Choose a departure day"
      />,
    );

    expect(screen.getByTestId('app-date-picker')).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/)).toBeRequired();
    expect(screen.getByText('Choose a departure day')).toBeInTheDocument();
  });
});
