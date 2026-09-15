import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import type { FormControlProps } from '@mui/material/FormControl';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

export interface FormFieldProps extends Omit<FormControlProps, 'error'> {
  id: string;
  label: string;
  children: ReactElement;
  helperText?: ReactNode;
  errorMessage?: string;
  hideLabel?: boolean;
}

export function FormField({
  id,
  label,
  children,
  helperText,
  errorMessage,
  required,
  disabled,
  fullWidth = true,
  hideLabel = false,
  ...props
}: FormFieldProps) {
  const helperId = `${id}-helper`;
  const hasError = Boolean(errorMessage);
  const describedBy = helperText || errorMessage ? helperId : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        required,
        disabled,
        error: hasError || Boolean((children.props as { error?: boolean }).error),
        'aria-describedby': describedBy,
        'aria-invalid': hasError || undefined,
        fullWidth,
      } as Record<string, unknown>)
    : children;

  return (
    <FormControl
      {...props}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={hasError}
    >
      {!hideLabel ? (
        <FormLabel htmlFor={id} sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </FormLabel>
      ) : null}
      {control}
      {errorMessage || helperText ? (
        <FormHelperText id={helperId}>{errorMessage ?? helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
