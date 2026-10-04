import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { AirportForm } from '@/features/adminAirports/components/AirportForm';
import { createSeedAdminAirports } from '@/features/adminAirports';
import { renderWithProviders } from '@tests/utils/test-utils';

const FORM_ID = 'test-airport-form';

function renderForm(props: Partial<ComponentProps<typeof AirportForm>> = {}) {
  const onSubmit = props.onSubmit ?? jest.fn();

  const view = renderWithProviders(
    <>
      <AirportForm formId={FORM_ID} onSubmit={onSubmit} {...props} />
      <button type="submit" form={FORM_ID}>
        Submit airport
      </button>
    </>,
  );

  return { ...view, onSubmit };
}

async function fillValidAirportForm() {
  fireEvent.change(screen.getByPlaceholderText('KUL'), {
    target: { value: 'aaa' },
  });
  fireEvent.change(screen.getByPlaceholderText('Kuala Lumpur International Airport'), {
    target: { value: 'Alpha Test Airport' },
  });
  fireEvent.change(screen.getByPlaceholderText('Kuala Lumpur'), {
    target: { value: 'Alpha City' },
  });
  fireEvent.change(screen.getByPlaceholderText('Malaysia'), {
    target: { value: 'Malaysia' },
  });
  fireEvent.change(screen.getByPlaceholderText('Asia/Kuala_Lumpur'), {
    target: { value: 'Asia/Kuala_Lumpur' },
  });
  fireEvent.change(screen.getByLabelText(/^Terminals/i), {
    target: { value: '3' },
  });
  fireEvent.change(screen.getByLabelText(/^Latitude/i), {
    target: { value: '3.1' },
  });
  fireEvent.change(screen.getByLabelText(/^Longitude/i), {
    target: { value: '101.5' },
  });
}

describe('AirportForm', () => {
  const airport = createSeedAdminAirports()[0]!;

  it('renders default empty values when no airport is provided', () => {
    renderForm();

    expect(document.getElementById(FORM_ID)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Code/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/^City/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Country/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Timezone/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Terminals/i)).toHaveValue(1);
    expect(screen.getByLabelText(/^Latitude/i)).toHaveValue(0);
    expect(screen.getByLabelText(/^Longitude/i)).toHaveValue(0);
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('prefills fields from the initial airport', () => {
    renderForm({ initialAirport: airport });

    expect(screen.getByLabelText(/^Code/i)).toHaveValue(airport.code);
    expect(screen.getByLabelText(/^Name/i)).toHaveValue(airport.name);
    expect(screen.getByLabelText(/^City/i)).toHaveValue(airport.city);
    expect(screen.getByLabelText(/^Country/i)).toHaveValue(airport.country);
    expect(screen.getByLabelText(/^Timezone/i)).toHaveValue(airport.timezone);
    expect(screen.getByLabelText(/^Terminals/i)).toHaveValue(airport.terminalCount);
    expect(screen.getByLabelText(/^Latitude/i)).toHaveValue(airport.latitude);
    expect(screen.getByLabelText(/^Longitude/i)).toHaveValue(airport.longitude);
    expect(screen.getByLabelText('Active')).toBeChecked();
  });

  it('resets when the initial airport changes', () => {
    const nextAirport = {
      ...airport,
      id: 'airport-szb',
      code: 'SZB',
      name: 'Sultan Abdul Aziz Shah Airport',
      active: false,
    };

    const { rerender } = renderForm({ initialAirport: airport });

    expect(screen.getByLabelText(/^Code/i)).toHaveValue('KUL');
    expect(screen.getByText('Active')).toBeInTheDocument();

    rerender(
      <>
        <AirportForm formId={FORM_ID} initialAirport={nextAirport} onSubmit={jest.fn()} />
        <button type="submit" form={FORM_ID}>
          Submit airport
        </button>
      </>,
    );

    expect(screen.getByLabelText(/^Code/i)).toHaveValue('SZB');
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('Sultan Abdul Aziz Shah Airport');
    expect(screen.getByLabelText('Active')).not.toBeChecked();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('resets to defaults when initial airport becomes null', () => {
    const { rerender } = renderForm({ initialAirport: airport });

    expect(screen.getByLabelText(/^Code/i)).toHaveValue('KUL');

    rerender(
      <>
        <AirportForm formId={FORM_ID} initialAirport={null} onSubmit={jest.fn()} />
        <button type="submit" form={FORM_ID}>
          Submit airport
        </button>
      </>,
    );

    expect(screen.getByLabelText(/^Code/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Submit airport' }));

    expect(await screen.findByText('Enter a 3-letter IATA code')).toBeInTheDocument();
    expect(screen.getByText('Enter an airport name')).toBeInTheDocument();
    expect(screen.getByText('Enter a city')).toBeInTheDocument();
    expect(screen.getByText('Enter a country')).toBeInTheDocument();
    expect(screen.getByText('Enter a timezone')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits parsed values and uppercases the airport code', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    await fillValidAirportForm();
    await user.click(screen.getByRole('button', { name: 'Submit airport' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      code: 'AAA',
      name: 'Alpha Test Airport',
      city: 'Alpha City',
      country: 'Malaysia',
      timezone: 'Asia/Kuala_Lumpur',
      terminals: 3,
      latitude: 3.1,
      longitude: 101.5,
      active: true,
    });
  });

  it('toggles the active switch label', async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    expect(screen.getByText('Active')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Active'));

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).not.toBeChecked();
  });
});
