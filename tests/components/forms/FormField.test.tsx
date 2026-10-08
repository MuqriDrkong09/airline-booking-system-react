import { screen } from '@testing-library/react';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('FormField', () => {
  it('associates the label and shows validation errors', () => {
    renderWithProviders(
      <FormField id="email" label="Email" errorMessage="Email is required">
        <AppInput />
      </FormField>,
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email is required');
    expect(error).toHaveAttribute('id', 'email-helper');
    expect(error).toHaveAttribute('aria-live', 'assertive');
    expect(document.querySelector('#email')).toBeInTheDocument();
    expect(error).toHaveClass('Mui-error');
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('shows helper text when there is no error without alert semantics', () => {
    renderWithProviders(
      <FormField id="phone" label="Phone" helperText="Include country code">
        <AppInput />
      </FormField>,
    );

    const helper = screen.getByText('Include country code');
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(helper).toHaveAttribute('id', 'phone-helper');
    expect(helper).not.toHaveAttribute('role', 'alert');
    expect(helper).not.toHaveAttribute('aria-live');
    expect(document.querySelector('.MuiFormControl-root')).not.toHaveClass('Mui-error');
    expect(screen.getByLabelText(/Phone/i)).toHaveAttribute('aria-describedby', 'phone-helper');
  });

  it('prefers errorMessage over helperText in the helper slot', () => {
    renderWithProviders(
      <FormField
        id="name"
        label="Name"
        helperText="As on passport"
        errorMessage="Name is required"
      >
        <AppInput />
      </FormField>,
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('As on passport')).not.toBeInTheDocument();
  });

  it('hides the label and omits helper text when neither is provided', () => {
    renderWithProviders(
      <FormField id="code" label="Code" hideLabel>
        <AppInput
          slotProps={{
            htmlInput: { 'aria-label': 'Code' },
          }}
        />
      </FormField>,
    );

    expect(screen.queryByText('Code', { selector: 'label' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Code')).toBeInTheDocument();
    expect(document.getElementById('code-helper')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Code')).not.toHaveAttribute('aria-describedby');
  });

  it('forwards required, disabled, and non-fullWidth props onto the control', () => {
    renderWithProviders(
      <FormField id="seat" label="Seat" required disabled fullWidth={false}>
        <AppInput />
      </FormField>,
    );

    const input = screen.getByLabelText(/Seat/i);
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(document.querySelector('.MuiFormControl-fullWidth')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiFormLabel-root')).toHaveTextContent('Seat *');
    expect(document.querySelector('span[aria-hidden="true"]')).toHaveTextContent('*');
  });

  it('defaults to full width and wires the label htmlFor to the control id', () => {
    renderWithProviders(
      <FormField id="passport" label="Passport number">
        <AppInput />
      </FormField>,
    );

    expect(document.querySelector('.MuiFormControl-fullWidth')).toBeInTheDocument();
    expect(document.querySelector('label')).toHaveAttribute('for', 'passport');
    expect(screen.getByLabelText('Passport number')).toHaveAttribute('id', 'passport');
  });

  it('keeps an existing error prop on the child control', () => {
    renderWithProviders(
      <FormField id="cabin" label="Cabin">
        <AppInput error />
      </FormField>,
    );

    expect(document.querySelector('.MuiFormControl-root')).not.toHaveClass('Mui-error');
    expect(document.querySelector('.MuiOutlinedInput-root')).toHaveClass('Mui-error');
  });

  it('merges an existing aria-describedby with the helper id', () => {
    renderWithProviders(
      <FormField id="promo" label="Promo code" helperText="Optional discount code">
        <AppInput aria-describedby="promo-hint" />
      </FormField>,
    );

    expect(screen.getByLabelText(/Promo code/i)).toHaveAttribute(
      'aria-describedby',
      'promo-hint promo-helper',
    );
  });

  it('merges describedby and invalid state through slotProps.htmlInput', () => {
    renderWithProviders(
      <FormField id="token" label="Token" errorMessage="Token is invalid">
        <AppInput
          slotProps={{
            htmlInput: {
              'data-testid': 'token-input',
              'aria-describedby': 'token-extra',
              maxLength: 8,
            },
          }}
        />
      </FormField>,
    );

    const input = screen.getByTestId('token-input');
    expect(input).toHaveAttribute('aria-describedby', 'token-extra token-helper');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('maxLength', '8');
  });

  it('renders non-element children without cloning props', () => {
    renderWithProviders(
      <FormField id="note" label="Note">
        {'Plain note' as unknown as React.ReactElement}
      </FormField>,
    );

    expect(screen.getByText('Plain note')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });
});
