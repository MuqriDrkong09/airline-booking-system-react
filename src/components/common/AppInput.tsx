import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';

export type AppInputProps = TextFieldProps;

export function AppInput({ fullWidth = true, variant = 'outlined', ...props }: AppInputProps) {
  return <TextField fullWidth={fullWidth} variant={variant} {...props} />;
}
