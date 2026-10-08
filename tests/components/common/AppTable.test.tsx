import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppTable, type AppTableColumn } from '@/components/common/AppTable';
import { renderWithProviders } from '@tests/utils/test-utils';

interface Row {
  id: string;
  flight: string;
  status: string;
  seats: number;
}

const columns: readonly AppTableColumn<Row>[] = [
  {
    id: 'flight',
    header: 'Flight',
    align: 'left',
    width: 160,
    cell: (row) => row.flight,
  },
  {
    id: 'status',
    header: 'Status',
    align: 'center',
    cell: (row) => row.status,
  },
  {
    id: 'seats',
    header: 'Seats',
    align: 'right',
    width: '20%',
    cell: (row) => row.seats,
  },
];

const sortableColumns: readonly AppTableColumn<Row>[] = [
  {
    id: 'flight',
    header: 'Flight',
    sortable: true,
    cell: (row) => row.flight,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => row.status,
  },
  {
    id: 'seats',
    header: 'Seats',
    sortable: true,
    cell: (row) => row.seats,
  },
];

const sampleRows: Row[] = [
  { id: '1', flight: 'AB101', status: 'On time', seats: 12 },
  { id: '2', flight: 'AB202', status: 'Delayed', seats: 3 },
];

describe('AppTable', () => {
  it('renders an accessible table with headers and row cells', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
      />,
    );

    const table = screen.getByRole('table', { name: 'Flights' });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Flight' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Seats' })).toBeInTheDocument();
    expect(screen.getByText('AB101')).toBeInTheDocument();
    expect(screen.getByText('Delayed')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 body rows
  });

  it('uses getRowId for stable body row keys', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => `flight-${row.id}`}
      />,
    );

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(2);
    expect(within(bodyRows[0]!).getByText('AB101')).toBeInTheDocument();
    expect(within(bodyRows[1]!).getByText('AB202')).toBeInTheDocument();
  });

  it('applies column alignment and width styles', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
      />,
    );

    const flightHeader = screen.getByRole('columnheader', { name: 'Flight' });
    const statusHeader = screen.getByRole('columnheader', { name: 'Status' });
    const seatsHeader = screen.getByRole('columnheader', { name: 'Seats' });

    expect(flightHeader).toHaveClass('MuiTableCell-alignLeft');
    expect(statusHeader).toHaveClass('MuiTableCell-alignCenter');
    expect(seatsHeader).toHaveClass('MuiTableCell-alignRight');
    expect(flightHeader).toHaveStyle({ width: '160px' });
    expect(seatsHeader).toHaveStyle({ width: '20%' });

    const firstBodyRow = screen.getAllByRole('row')[1]!;
    const cells = within(firstBodyRow).getAllByRole('cell');
    expect(cells[0]).toHaveClass('MuiTableCell-alignLeft');
    expect(cells[1]).toHaveClass('MuiTableCell-alignCenter');
    expect(cells[2]).toHaveClass('MuiTableCell-alignRight');
  });

  it('renders inside an outlined paper table container by default', () => {
    const { container } = renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
      />,
    );

    expect(container.querySelector('.MuiTableContainer-root')).toBeInTheDocument();
    expect(container.querySelector('.MuiPaper-outlined')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Flights' })).toHaveClass('MuiTable-root');
  });

  it('defaults to medium size when dense is false', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'Flights' })).toBeInTheDocument();
    const header = screen.getByRole('columnheader', { name: 'Flight' });
    // Medium cells use the theme's default (non-small) vertical padding.
    expect(Number.parseFloat(getComputedStyle(header).paddingTop)).toBeGreaterThan(8);
  });

  it('honors an explicit small size with denser cell padding', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        size="small"
      />,
    );

    const header = screen.getByRole('columnheader', { name: 'Flight' });
    expect(Number.parseFloat(getComputedStyle(header).paddingTop)).toBeLessThanOrEqual(8);
  });

  it('forces small sizing when dense is true even if size is medium', () => {
    const { unmount } = renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        size="medium"
      />,
    );

    const mediumPadding = Number.parseFloat(
      getComputedStyle(screen.getByRole('columnheader', { name: 'Flight' })).paddingTop,
    );
    unmount();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        size="medium"
        dense
      />,
    );

    const densePadding = Number.parseFloat(
      getComputedStyle(screen.getByRole('columnheader', { name: 'Flight' })).paddingTop,
    );
    expect(densePadding).toBeLessThan(mediumPadding);
  });

  it('enables sticky header when requested', () => {
    const { container } = renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        stickyHeader
      />,
    );

    expect(container.querySelector('.MuiTable-stickyHeader')).toBeInTheDocument();
  });

  it('renders the default empty message when there are no rows', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No data available.');
  });

  it('renders a custom empty message when there are no rows', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        emptyMessage="No flights found."
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No flights found.');
  });

  it('supports columns without align or width', () => {
    const simpleColumns: readonly AppTableColumn<Row>[] = [
      { id: 'flight', header: 'Flight', cell: (row) => row.flight },
      { id: 'status', header: 'Status', cell: (row) => <strong>{row.status}</strong> },
    ];

    renderWithProviders(
      <AppTable
        ariaLabel="Simple flights"
        columns={simpleColumns}
        rows={[sampleRows[0]!]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'Simple flights' })).toBeInTheDocument();
    expect(screen.getByText('AB101')).toBeInTheDocument();
    expect(screen.getByText('On time').tagName).toBe('STRONG');
  });

  it('does not render sort controls when onSortChange is omitted', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={sortableColumns}
        rows={sampleRows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.queryByRole('button', { name: /Flight/i })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Flight' })).toHaveTextContent('Flight');
  });

  it('renders sort labels only for sortable columns when onSortChange is provided', () => {
    const onSortChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={sortableColumns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('button', { name: /Flight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seats/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Status/i })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toHaveTextContent('Status');
  });

  it('calls onSortChange with the column id when a sort label is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={sortableColumns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Flight/i }));
    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith('flight');

    await user.click(screen.getByRole('button', { name: /Seats/i }));
    expect(onSortChange).toHaveBeenCalledWith('seats');
  });

  it('marks the active sort column and direction on the header', () => {
    const onSortChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={sortableColumns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        sortBy="seats"
        sortDirection="desc"
        onSortChange={onSortChange}
      />,
    );

    const seatsHeader = screen.getByRole('columnheader', { name: /Seats/i });
    expect(seatsHeader).toHaveAttribute('aria-sort', 'descending');

    const flightHeader = screen.getByRole('columnheader', { name: /Flight/i });
    expect(flightHeader).not.toHaveAttribute('aria-sort');
  });

  it('hides pagination when required pagination props are incomplete', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        page={0}
        pageSize={10}
        totalCount={20}
      />,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();
  });

  it('renders pagination controls when page, pageSize, totalCount, and onPageChange are set', () => {
    const onPageChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        page={0}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to next page/i })).toBeInTheDocument();
  });

  it('calls onPageChange when navigating to the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        page={0}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /go to next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange when rows-per-page changes', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        page={0}
        pageSize={10}
        totalCount={25}
        pageSizeOptions={[5, 10, 25]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('uses custom pageSizeOptions in the rows-per-page menu', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={sampleRows}
        getRowId={(row) => row.id}
        page={0}
        pageSize={15}
        totalCount={40}
        pageSizeOptions={[15, 30]}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: '15' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '30' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '10' })).not.toBeInTheDocument();
  });

  it('keeps the table shell and empty message when paginated with zero rows', () => {
    const onPageChange = jest.fn();

    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        emptyMessage="No flights on this page."
        page={0}
        pageSize={10}
        totalCount={0}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Flights' })).toBeInTheDocument();
    expect(screen.getByText('No flights on this page.')).toBeInTheDocument();
    expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
  });
});
