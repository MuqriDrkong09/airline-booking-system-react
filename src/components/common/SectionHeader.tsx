import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  component?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function SectionHeader({
  title,
  description,
  action,
  component = 'h2',
}: SectionHeaderProps) {
  const titleVariant = component === 'h1' ? 'h3' : component === 'h2' ? 'h4' : 'h5';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        mb: description ? 2 : 1.5,
      }}
    >
      <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant={titleVariant} component={component}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            {description}
          </Typography>
        ) : null}
      </Stack>
      {action ? (
        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>{action}</Box>
      ) : null}
    </Box>
  );
}
