import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface AppTableColumn<T> {
  id: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  cell: (row: T) => ReactNode;
}

export interface AppTableProps<T> {
  columns: readonly AppTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  ariaLabel: string;
  emptyMessage?: string;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  dense?: boolean;
}

export function AppTable<T>({
  columns,
  rows,
  getRowId,
  ariaLabel,
  emptyMessage = 'No data available.',
  stickyHeader = false,
  size = 'medium',
  dense = false,
}: AppTableProps<T>) {
  if (rows.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table
        aria-label={ariaLabel}
        stickyHeader={stickyHeader}
        size={dense ? 'small' : size}
        sx={{ minWidth: 560 }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align} sx={{ width: column.width }}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)} hover>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
