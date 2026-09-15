import type { AppInputProps } from './AppInput';
import { AppInput } from './AppInput';

export interface AppDatePickerProps extends Omit<AppInputProps, 'type'> {
  min?: string;
  max?: string;
}

/**
 * Accessible date picker built on the native date input.
 * Avoids an extra date-picker dependency while staying keyboard-friendly.
 */
export function AppDatePicker({ label = 'Date', min, max, slotProps, ...props }: AppDatePickerProps) {
  const inputLabelSlot =
    typeof slotProps?.inputLabel === 'object' && slotProps.inputLabel !== null
      ? slotProps.inputLabel
      : undefined;
  const htmlInputSlot =
    typeof slotProps?.htmlInput === 'object' && slotProps.htmlInput !== null
      ? slotProps.htmlInput
      : undefined;

  return (
    <AppInput
      {...props}
      type="date"
      label={label}
      slotProps={{
        ...slotProps,
        inputLabel: {
          shrink: true,
          ...inputLabelSlot,
        },
        htmlInput: {
          min,
          max,
          ...htmlInputSlot,
        },
      }}
    />
  );
}
