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

function mergeDescribedBy(
  existing: unknown,
  helperId: string | undefined,
): string | undefined {
  const parts = [typeof existing === 'string' ? existing : undefined, helperId].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(' ') : undefined;
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
  const describedByTarget = helperText || errorMessage ? helperId : undefined;

  const control = isValidElement(children)
    ? (() => {
        const childProps = children.props as {
          error?: boolean;
          'aria-describedby'?: string;
          slotProps?: {
            htmlInput?: Record<string, unknown>;
            [key: string]: unknown;
          };
          inputProps?: Record<string, unknown>;
        };
        const describedBy = mergeDescribedBy(
          childProps['aria-describedby'] ?? childProps.slotProps?.htmlInput?.['aria-describedby'],
          describedByTarget,
        );

        return cloneElement(children, {
          id,
          required,
          disabled,
          error: hasError || Boolean(childProps.error),
          'aria-describedby': describedBy,
          'aria-invalid': hasError ? true : undefined,
          fullWidth,
          // Ensure the native input receives describedby/invalid for screen readers.
          slotProps: {
            ...childProps.slotProps,
            htmlInput: {
              ...childProps.slotProps?.htmlInput,
              'aria-describedby': describedBy,
              'aria-invalid': hasError ? true : undefined,
            },
          },
          inputProps: {
            ...childProps.inputProps,
            'aria-describedby': describedBy,
            'aria-invalid': hasError ? true : undefined,
          },
        } as Record<string, unknown>);
      })()
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
          {required ? <span aria-hidden="true"> *</span> : null}
        </FormLabel>
      ) : null}
      {control}
      {errorMessage || helperText ? (
        <FormHelperText
          id={helperId}
          role={hasError ? 'alert' : undefined}
          aria-live={hasError ? 'assertive' : undefined}
        >
          {errorMessage ?? helperText}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}
