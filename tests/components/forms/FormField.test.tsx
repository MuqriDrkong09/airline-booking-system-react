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
    expect(screen.getByText('Email is required')).toHaveAttribute('id', 'email-helper');
    expect(document.querySelector('#email')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toHaveClass('Mui-error');
  });

  it('shows helper text when there is no error', () => {
    renderWithProviders(
      <FormField id="phone" label="Phone" helperText="Include country code">
        <AppInput />
      </FormField>,
    );

    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByText('Include country code')).toHaveAttribute('id', 'phone-helper');
    expect(document.querySelector('.MuiFormControl-root')).not.toHaveClass('Mui-error');
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
        <AppInput aria-label="Code" />
      </FormField>,
    );

    expect(screen.queryByText('Code', { selector: 'label' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Code')).toBeInTheDocument();
    expect(document.getElementById('code-helper')).not.toBeInTheDocument();
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
