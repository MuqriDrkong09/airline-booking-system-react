import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SkeletonBlock } from './SkeletonBlock';

export interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  /** Show a toolbar/filter placeholder above the table. */
  showToolbar?: boolean;
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 6,
  showToolbar = true,
}: TableSkeletonProps) {
  return (
    <SkeletonBlock label="Loading table">
      <Stack spacing={2}>
        {showToolbar ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <Skeleton width={220} height={40} sx={{ flex: 1, maxWidth: 360 }} />
            <Skeleton width={140} height={40} />
            <Skeleton width={140} height={40} />
          </Stack>
        ) : null}

        <TableContainer component={Paper} variant="outlined" sx={{ minWidth: 560 }}>
          <Table size="medium" aria-hidden="true">
            <TableHead>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton width="70%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columnCount }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton width={cellIndex === 0 ? '55%' : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Skeleton width={120} height={32} />
          <Skeleton width={80} height={32} />
        </Stack>
      </Stack>
    </SkeletonBlock>
  );
}
