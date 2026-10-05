import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface AppTableColumn<T> {
  id: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  sortable?: boolean;
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
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (columnId: string) => void;
  /** 0-based page index when paginated. */
  page?: number;
  pageSize?: number;
  totalCount?: number;
  pageSizeOptions?: readonly number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  sortBy,
  sortDirection = 'asc',
  onSortChange,
  page,
  pageSize,
  totalCount,
  pageSizeOptions = [5, 10, 25],
  onPageChange,
  onPageSizeChange,
}: AppTableProps<T>) {
  const showPagination =
    typeof page === 'number' &&
    typeof pageSize === 'number' &&
    typeof totalCount === 'number' &&
    Boolean(onPageChange);

  if (rows.length === 0 && !showPagination) {
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
            {columns.map((column) => {
              const active = sortBy === column.id;
              const canSort = Boolean(column.sortable && onSortChange);

              return (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sortDirection={active ? sortDirection : false}
                  sx={{ width: column.width }}
                >
                  {canSort ? (
                    <TableSortLabel
                      active={active}
                      direction={active ? sortDirection : 'asc'}
                      onClick={() => onSortChange?.(column.id)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {showPagination ? (
        <TablePagination
          component="div"
          count={totalCount!}
          page={page!}
          onPageChange={(_event, nextPage) => onPageChange?.(nextPage)}
          rowsPerPage={pageSize!}
          onRowsPerPageChange={(event) => {
            onPageSizeChange?.(Number.parseInt(event.target.value, 10));
          }}
          rowsPerPageOptions={[...pageSizeOptions]}
        />
      ) : null}
    </TableContainer>
  );
}
