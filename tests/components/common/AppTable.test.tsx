import { screen } from '@testing-library/react';
import { AppTable } from '@/components/common/AppTable';
import { renderWithProviders } from '@tests/utils/test-utils';

interface Row {
  id: string;
  flight: string;
  status: string;
}

const columns = [
  {
    id: 'flight',
    header: 'Flight',
    cell: (row: Row) => row.flight,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row: Row) => row.status,
  },
] as const;

describe('AppTable', () => {
  it('renders accessible column headers and rows', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={[
          { id: '1', flight: 'AB101', status: 'On time' },
          { id: '2', flight: 'AB202', status: 'Delayed' },
        ]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'Flights' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Flight' })).toBeInTheDocument();
    expect(screen.getByText('AB101')).toBeInTheDocument();
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('renders an empty message when there are no rows', () => {
    renderWithProviders(
      <AppTable
        ariaLabel="Flights"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        emptyMessage="No flights found."
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No flights found.');
  });
});
