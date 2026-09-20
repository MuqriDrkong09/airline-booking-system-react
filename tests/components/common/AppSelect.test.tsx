import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { AppSelect } from '@/components/common/AppSelect';
import { renderWithProviders } from '@tests/utils/test-utils';

const cabinOptions = [
  { label: 'Economy', value: 'ECONOMY' },
  { label: 'Business', value: 'BUSINESS' },
  { label: 'First', value: 'FIRST', disabled: true },
] as const;

describe('AppSelect', () => {
  it('renders a labeled select with options and default full width', () => {
    renderWithProviders(
      <AppSelect label="Cabin class" options={cabinOptions} value="ECONOMY" />,
    );

    const select = screen.getByLabelText('Cabin class');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('id', 'app-select-cabin-class');
    expect(document.getElementById('app-select-cabin-class-label')).toHaveTextContent('Cabin class');
    expect(document.querySelector('.MuiFormControl-fullWidth')).toBeInTheDocument();
  });

  it('uses a provided id instead of the generated one', () => {
    renderWithProviders(
      <AppSelect
        id="flight-cabin"
        label="Cabin class"
        options={cabinOptions}
        value="ECONOMY"
      />,
    );

    expect(screen.getByLabelText('Cabin class')).toHaveAttribute('id', 'flight-cabin');
    expect(document.getElementById('flight-cabin-label')).toBeInTheDocument();
  });

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <AppSelect
        label="Cabin class"
        options={cabinOptions}
        value="ECONOMY"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Cabin class'));
    await user.click(await screen.findByRole('option', { name: 'Business' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe('BUSINESS');
  });

  it('supports selecting without an onChange handler', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AppSelect label="Cabin class" options={cabinOptions} value="ECONOMY" />,
    );

    await user.click(screen.getByLabelText('Cabin class'));
    await user.click(await screen.findByRole('option', { name: 'Business' }));

    // Controlled without onChange keeps the provided value; interaction should not throw.
    expect(screen.getByLabelText('Cabin class')).toHaveTextContent('Economy');
  });

  it('hides the floating label and exposes aria-label when hideLabel is true', () => {
    renderWithProviders(
      <AppSelect
        label="Sort by"
        hideLabel
        options={[
          { label: 'Price: low to high', value: 'price_asc' },
          { label: 'Duration: shortest', value: 'duration_asc' },
        ]}
        value="price_asc"
      />,
    );

    expect(document.querySelector('.MuiInputLabel-root')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
  });

  it('renders helper text and wires aria-describedby when provided', () => {
    renderWithProviders(
      <AppSelect
        id="seat-select"
        label="Seat preference"
        options={[{ label: 'Window', value: 'WINDOW' }]}
        value="WINDOW"
        helperText="Choose your preferred seat"
      />,
    );

    expect(screen.getByText('Choose your preferred seat')).toHaveAttribute(
      'id',
      'seat-select-helper',
    );
    expect(screen.getByLabelText('Seat preference')).toHaveAttribute(
      'aria-describedby',
      'seat-select-helper',
    );
  });

  it('omits helper text and aria-describedby when helperText is absent', () => {
    renderWithProviders(
      <AppSelect label="Cabin class" options={cabinOptions} value="ECONOMY" />,
    );

    expect(screen.queryByText(/helper/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cabin class')).not.toHaveAttribute('aria-describedby');
  });

  it('supports error, required, disabled, and non-fullWidth states', () => {
    renderWithProviders(
      <AppSelect
        label="Cabin class"
        options={cabinOptions}
        value="ECONOMY"
        error
        required
        disabled
        fullWidth={false}
        helperText="Cabin is required"
      />,
    );

    const formControl = document.querySelector('.MuiFormControl-root');
    expect(formControl).not.toHaveClass('MuiFormControl-fullWidth');
    expect(screen.getByLabelText(/Cabin class/)).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Cabin is required')).toHaveClass('Mui-error');
    expect(document.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();
  });

  it('forwards formControlProps onto the FormControl', () => {
    renderWithProviders(
      <AppSelect
        label="Cabin class"
        options={cabinOptions}
        value="ECONOMY"
        formControlProps={
          { 'data-testid': 'cabin-form-control', sx: { mt: 2 } } as NonNullable<
            ComponentProps<typeof AppSelect>['formControlProps']
          >
        }
      />,
    );

    expect(screen.getByTestId('cabin-form-control')).toBeInTheDocument();
  });

  it('renders disabled menu options and numeric values', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <AppSelect
        label="Passengers"
        options={[
          { label: '1 adult', value: 1 },
          { label: '2 adults', value: 2 },
          { label: '9 adults', value: 9, disabled: true },
        ]}
        value={1}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Passengers'));
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByRole('option', { name: '9 adults' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.click(within(listbox).getByRole('option', { name: '2 adults' }));
    expect(onChange.mock.calls[0]?.[0]).toBe(2);
  });

  it('honors displayEmpty when the floating label is visible', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AppSelect
        label="Meal preference"
        options={[
          { label: 'Standard', value: 'STANDARD' },
          { label: 'Vegetarian', value: 'VEGETARIAN' },
        ]}
        value=""
        displayEmpty
      />,
    );

    await user.click(screen.getByLabelText('Meal preference'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });
});
