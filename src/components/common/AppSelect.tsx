import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { FormControlProps } from '@mui/material/FormControl';
import type { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import type { ReactNode } from 'react';

export interface AppSelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface AppSelectProps<T extends string | number = string>
  extends Omit<SelectProps<T>, 'onChange' | 'label'> {
  label: string;
  options: readonly AppSelectOption<T>[];
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  formControlProps?: Omit<FormControlProps, 'error' | 'fullWidth' | 'disabled' | 'required'>;
  onChange?: (value: T, event: SelectChangeEvent<T>) => void;
}

export function AppSelect<T extends string | number = string>({
  label,
  options,
  helperText,
  error = false,
  fullWidth = true,
  formControlProps,
  id,
  value,
  required,
  disabled,
  onChange,
  ...props
}: AppSelectProps<T>) {
  const selectId = id ?? `app-select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const labelId = `${selectId}-label`;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      {...formControlProps}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        {...props}
        id={selectId}
        labelId={labelId}
        label={label}
        value={value}
        required={required}
        disabled={disabled}
        aria-describedby={helperId}
        onChange={(event) => {
          onChange?.(event.target.value as T, event);
        }}
      >
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText ? <FormHelperText id={helperId}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
