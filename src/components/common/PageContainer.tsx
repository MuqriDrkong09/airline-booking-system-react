import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { ContainerProps } from '@mui/material/Container';
import type { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';

export interface PageContainerProps extends Omit<ContainerProps, 'children' | 'title'> {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  spacing?: number;
}

/**
 * Page shell used inside public/dashboard layouts.
 * Parent layouts own horizontal gutters + max width; this component
 * only structures title/description/action and body spacing.
 */
export function PageContainer({
  children,
  title,
  description,
  action,
  spacing = 3,
  maxWidth = false,
  disableGutters = true,
  ...props
}: PageContainerProps) {
  return (
    <Container maxWidth={maxWidth} disableGutters={disableGutters} {...props}>
      <Stack spacing={spacing}>
        {title ? (
          <SectionHeader title={title} description={description} action={action} component="h1" />
        ) : null}
        {children}
      </Stack>
    </Container>
  );
}
