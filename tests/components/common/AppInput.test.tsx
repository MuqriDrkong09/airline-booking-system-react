import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppInput } from '@/components/common/AppInput';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppInput', () => {
  it('renders a labeled text field with default fullWidth and outlined variant', () => {
    const { container } = renderWithProviders(<AppInput label="Email" />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(container.querySelector('.MuiFormControl-fullWidth')).toBeInTheDocument();
    expect(container.querySelector('.MuiOutlinedInput-root')).toBeInTheDocument();
  });

  it('allows overriding fullWidth and variant defaults', () => {
    const { container } = renderWithProviders(
      <AppInput label="Code" fullWidth={false} variant="filled" />,
    );

    expect(container.querySelector('.MuiFormControl-fullWidth')).not.toBeInTheDocument();
    expect(container.querySelector('.MuiFilledInput-root')).toBeInTheDocument();
    expect(container.querySelector('.MuiOutlinedInput-root')).not.toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(<AppInput label="Promo code" onChange={onChange} />);

    await user.type(screen.getByLabelText('Promo code'), 'SAVE15');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('Promo code')).toHaveValue('SAVE15');
  });

  it('supports controlled value updates', () => {
    const { rerender } = renderWithProviders(
      <AppInput label="Flight number" value="MH" onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('Flight number')).toHaveValue('MH');

    rerender(<AppInput label="Flight number" value="MH123" onChange={jest.fn()} />);
    expect(screen.getByLabelText('Flight number')).toHaveValue('MH123');
  });

  it('forwards common TextField props used across forms', () => {
    renderWithProviders(
      <AppInput
        id="login-email"
        name="email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        helperText="Use the email on your booking"
      />,
    );

    const input = screen.getByLabelText(/Email address/);
    expect(input).toHaveAttribute('id', 'login-email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toBeRequired();
    expect(screen.getByText('Use the email on your booking')).toBeInTheDocument();
  });

  it('supports password, disabled, and error states', () => {
    renderWithProviders(
      <AppInput
        label="Password"
        type="password"
        disabled
        error
        helperText="Password is required"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toBeDisabled();
    expect(screen.getByText('Password is required')).toHaveClass('Mui-error');
  });

  it('supports multiline input', () => {
    renderWithProviders(
      <AppInput label="Notes" multiline minRows={3} defaultValue="Gate notes" />,
    );

    const input = screen.getByLabelText('Notes');
    expect(input.tagName).toBe('TEXTAREA');
    expect(input).toHaveValue('Gate notes');
  });

  it('labels the underlying input via slotProps.htmlInput when no visible label is provided', () => {
    renderWithProviders(
      <AppInput
        slotProps={{
          htmlInput: { 'aria-label': 'Search bookings' },
        }}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Search bookings' })).toBeInTheDocument();
  });
});

