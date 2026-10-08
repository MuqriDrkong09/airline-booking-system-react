import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface SkeletonBlockProps {
  children: ReactNode;
  label: string;
}

/** Accessible wrapper for loading placeholders (`aria-busy` + status label). */
export function SkeletonBlock({ children, label }: SkeletonBlockProps) {
  return (
    <Box
      component="section"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      role="status"
    >
      {children}
    </Box>
  );
}
