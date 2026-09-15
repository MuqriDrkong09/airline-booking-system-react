import Button from '@mui/material/Button';
import type { ButtonTypeMap, ExtendButton } from '@mui/material/Button';
import { forwardRef, type ComponentProps, type ElementType, type ReactNode } from 'react';

type AppButtonOwnProps = {
  loadingLabel?: string;
};

export type AppButtonTypeMap<
  AdditionalProps = object,
  RootComponent extends ElementType = 'button',
> = ButtonTypeMap<AdditionalProps & AppButtonOwnProps, RootComponent>;

export const AppButton = forwardRef(function AppButton(props, ref) {
  const {
    children,
    loading = false,
    loadingLabel = 'Loading',
    ...other
  } = props as AppButtonOwnProps & {
    children?: ReactNode;
    loading?: boolean | null;
  };

  return (
    <Button {...other} ref={ref} loading={loading} aria-busy={loading || undefined}>
      {loading ? loadingLabel : children}
    </Button>
  );
}) as ExtendButton<AppButtonTypeMap>;

export type AppButtonProps = ComponentProps<typeof AppButton>;
