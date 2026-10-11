import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { AircraftForm, createSeedAdminAircraft } from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

const FORM_ID = 'test-aircraft-form';

function renderForm(props: Partial<ComponentProps<typeof AircraftForm>> = {}) {
  const onSubmit = props.onSubmit ?? jest.fn();

  const view = renderWithProviders(
    <>
      <AircraftForm formId={FORM_ID} onSubmit={onSubmit} {...props} />
      <button type="submit" form={FORM_ID}>
        Submit aircraft
      </button>
    </>,
  );

  return { ...view, onSubmit };
}

function fillValidAircraftForm() {
  fireEvent.change(screen.getByPlaceholderText('Airbus'), {
    target: { value: 'Embraer' },
  });
  fireEvent.change(screen.getByPlaceholderText('A320'), {
    target: { value: 'E190' },
  });
  fireEvent.change(screen.getByPlaceholderText('9M-AAA'), {
    target: { value: '9m-new' },
  });
  fireEvent.change(screen.getByLabelText(/^Total seats/i), {
    target: { value: '100' },
  });
  fireEvent.change(screen.getByLabelText(/^Economy seats/i), {
    target: { value: '96' },
  });
  fireEvent.change(screen.getByLabelText(/^Premium economy seats/i), {
    target: { value: '0' },
  });
  fireEvent.change(screen.getByLabelText(/^Business seats/i), {
    target: { value: '4' },
  });
  fireEvent.change(screen.getByLabelText(/^First class seats/i), {
    target: { value: '0' },
  });
}

describe('AircraftForm', () => {
  const aircraft = createSeedAdminAircraft()[0]!;
  const inactiveAircraft = createSeedAdminAircraft().find((item) => !item.active)!;

  it('renders default empty values when no aircraft is provided', () => {
    renderForm();

    expect(document.getElementById(FORM_ID)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Airbus')).toHaveValue('');
    expect(screen.getByPlaceholderText('A320')).toHaveValue('');
    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue('');
    expect(screen.getByLabelText(/^Total seats/i)).toHaveValue(1);
    expect(screen.getByLabelText(/^Economy seats/i)).toHaveValue(1);
    expect(screen.getByLabelText(/^Premium economy seats/i)).toHaveValue(0);
    expect(screen.getByLabelText(/^Business seats/i)).toHaveValue(0);
    expect(screen.getByLabelText(/^First class seats/i)).toHaveValue(0);
    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('prefills fields from the initial aircraft', () => {
    renderForm({ initialAircraft: aircraft });

    expect(screen.getByPlaceholderText('Airbus')).toHaveValue(aircraft.manufacturer);
    expect(screen.getByPlaceholderText('A320')).toHaveValue(aircraft.model);
    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue(aircraft.registration);
    expect(screen.getByLabelText(/^Total seats/i)).toHaveValue(aircraft.totalSeats);
    expect(screen.getByLabelText(/^Economy seats/i)).toHaveValue(aircraft.economySeats);
    expect(screen.getByLabelText(/^Premium economy seats/i)).toHaveValue(
      aircraft.premiumEconomySeats,
    );
    expect(screen.getByLabelText(/^Business seats/i)).toHaveValue(aircraft.businessSeats);
    expect(screen.getByLabelText(/^First class seats/i)).toHaveValue(aircraft.firstClassSeats);
    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
  });

  it('prefills inactive status from an inactive aircraft', () => {
    expect(inactiveAircraft).toBeDefined();

    renderForm({ initialAircraft: inactiveAircraft });

    expect(screen.getByRole('switch', { name: 'Active' })).not.toBeChecked();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('resets when the initial aircraft changes', () => {
    const nextAircraft = {
      ...aircraft,
      id: 'aircraft-next',
      manufacturer: 'Boeing',
      model: '737-800',
      registration: '9M-BAC',
      active: false,
    };

    const { rerender } = renderForm({ initialAircraft: aircraft });

    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue('9M-AAA');
    expect(screen.getByText('Active')).toBeInTheDocument();

    rerender(
      <>
        <AircraftForm formId={FORM_ID} initialAircraft={nextAircraft} onSubmit={jest.fn()} />
        <button type="submit" form={FORM_ID}>
          Submit aircraft
        </button>
      </>,
    );

    expect(screen.getByPlaceholderText('Airbus')).toHaveValue('Boeing');
    expect(screen.getByPlaceholderText('A320')).toHaveValue('737-800');
    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue('9M-BAC');
    expect(screen.getByRole('switch', { name: 'Active' })).not.toBeChecked();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('resets to defaults when initial aircraft becomes null', () => {
    const { rerender } = renderForm({ initialAircraft: aircraft });

    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue(aircraft.registration);

    rerender(
      <>
        <AircraftForm formId={FORM_ID} initialAircraft={null} onSubmit={jest.fn()} />
        <button type="submit" form={FORM_ID}>
          Submit aircraft
        </button>
      </>,
    );

    expect(screen.getByPlaceholderText('Airbus')).toHaveValue('');
    expect(screen.getByPlaceholderText('A320')).toHaveValue('');
    expect(screen.getByPlaceholderText('9M-AAA')).toHaveValue('');
    expect(screen.getByLabelText(/^Total seats/i)).toHaveValue(1);
    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(await screen.findByText('Enter a manufacturer')).toBeInTheDocument();
    expect(screen.getByText('Enter a model')).toBeInTheDocument();
    expect(screen.getByText('Enter a registration')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when total seats do not match cabin seats', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByLabelText(/^Total seats/i), {
      target: { value: '120' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(
      await screen.findByText('Total seats must equal cabin seats (100)'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error for invalid registration characters', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByPlaceholderText('9M-AAA'), {
      target: { value: '9M AAA' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(
      await screen.findByText('Use letters, numbers, and hyphens only'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when manufacturer is too short', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByPlaceholderText('Airbus'), {
      target: { value: 'A' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(await screen.findByText('Enter a manufacturer')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when registration is too long', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByPlaceholderText('9M-AAA'), {
      target: { value: '9M-ABCDEFGHIJK' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(await screen.findByText('Registration is too long')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when a cabin seat count is negative', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByLabelText(/^Economy seats/i), {
      target: { value: '-1' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(await screen.findByText('Seat count cannot be negative')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when total seats exceed the allowed maximum', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByLabelText(/^Total seats/i), {
      target: { value: '601' },
    });
    fireEvent.change(screen.getByLabelText(/^Economy seats/i), {
      target: { value: '600' },
    });
    fireEvent.change(screen.getByLabelText(/^Business seats/i), {
      target: { value: '1' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    expect(await screen.findByText('Total seats looks too high')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims manufacturer and model before submit', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    fireEvent.change(screen.getByPlaceholderText('Airbus'), {
      target: { value: '  Embraer  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('A320'), {
      target: { value: '  E190  ' },
    });

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        manufacturer: 'Embraer',
        model: 'E190',
      }),
    );
  });

  it('submits parsed values and uppercases the registration', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      manufacturer: 'Embraer',
      model: 'E190',
      registration: '9M-NEW',
      totalSeats: 100,
      economySeats: 96,
      premiumEconomySeats: 0,
      businessSeats: 4,
      firstClassSeats: 0,
      active: true,
    });
  });

  it('updates premium economy and first class seat counts on change', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fireEvent.change(screen.getByPlaceholderText('Airbus'), {
      target: { value: 'Airbus' },
    });
    fireEvent.change(screen.getByPlaceholderText('A320'), {
      target: { value: 'A350' },
    });
    fireEvent.change(screen.getByPlaceholderText('9M-AAA'), {
      target: { value: '9M-WJ' },
    });
    fireEvent.change(screen.getByLabelText(/^Total seats/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/^Economy seats/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText(/^Premium economy seats/i), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByLabelText(/^Business seats/i), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText(/^First class seats/i), {
      target: { value: '2' },
    });

    expect(screen.getByLabelText(/^Premium economy seats/i)).toHaveValue(12);
    expect(screen.getByLabelText(/^First class seats/i)).toHaveValue(2);

    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        totalSeats: 50,
        economySeats: 30,
        premiumEconomySeats: 12,
        businessSeats: 6,
        firstClassSeats: 2,
      }),
    );
  });

  it('toggles the active switch label', async () => {
    const user = userEvent.setup({ delay: null });
    renderForm();

    expect(screen.getByText('Active')).toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Active' }));

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Active' })).not.toBeChecked();
  });

  it('submits inactive status when the switch is turned off', async () => {
    const user = userEvent.setup({ delay: null });
    const { onSubmit } = renderForm();

    fillValidAircraftForm();
    await user.click(screen.getByRole('switch', { name: 'Active' }));
    await user.click(screen.getByRole('button', { name: 'Submit aircraft' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        registration: '9M-NEW',
        active: false,
      }),
    );
  });
});
