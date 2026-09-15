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

export function PageContainer({
  children,
  title,
  description,
  action,
  spacing = 3,
  maxWidth = 'lg',
  disableGutters = false,
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
