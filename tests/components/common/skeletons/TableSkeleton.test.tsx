import { screen } from '@testing-library/react';
import { TableSkeleton } from '@/components/common/skeletons/TableSkeleton';
import { renderWithProviders } from '@tests/utils/test-utils';

const TOOLBAR_SKELETONS = 3;
const PAGINATION_SKELETONS = 2;

describe('TableSkeleton', () => {
  it('renders an accessible busy status labeled for tables', () => {
    renderWithProviders(<TableSkeleton />);

    const status = screen.getByRole('status', { name: 'Loading table' });
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('defaults to five columns, six body rows, and a toolbar', () => {
    renderWithProviders(<TableSkeleton />);

    expect(document.querySelectorAll('thead .MuiSkeleton-root')).toHaveLength(5);
    expect(document.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(document.querySelectorAll('tbody .MuiSkeleton-root')).toHaveLength(30);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      TOOLBAR_SKELETONS + 5 + 30 + PAGINATION_SKELETONS,
    );
  });

  it('honors custom columnCount and rowCount', () => {
    renderWithProviders(
      <TableSkeleton columnCount={4} rowCount={3} showToolbar={false} />,
    );

    expect(document.querySelectorAll('thead .MuiSkeleton-root')).toHaveLength(4);
    expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(document.querySelectorAll('tbody .MuiSkeleton-root')).toHaveLength(12);
  });

  it('hides the toolbar placeholders when showToolbar is false', () => {
    renderWithProviders(
      <TableSkeleton columnCount={3} rowCount={2} showToolbar={false} />,
    );

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      3 + 6 + PAGINATION_SKELETONS,
    );
  });

  it('always renders pagination placeholders below the table', () => {
    const { unmount } = renderWithProviders(
      <TableSkeleton columnCount={2} rowCount={1} showToolbar={false} />,
    );

    const withoutToolbar = document.querySelectorAll('.MuiSkeleton-root').length;
    unmount();

    renderWithProviders(<TableSkeleton columnCount={2} rowCount={1} showToolbar />);

    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBe(
      withoutToolbar + TOOLBAR_SKELETONS,
    );
  });

  it('renders an outlined paper table container with an aria-hidden table', () => {
    renderWithProviders(<TableSkeleton showToolbar={false} />);

    expect(document.querySelector('.MuiTableContainer-root')).toBeInTheDocument();
    expect(document.querySelector('.MuiPaper-outlined')).toBeInTheDocument();

    const table = document.querySelector('table');
    expect(table).toBeTruthy();
    expect(table).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders zero header and body cells when columnCount and rowCount are zero', () => {
    renderWithProviders(
      <TableSkeleton columnCount={0} rowCount={0} showToolbar={false} />,
    );

    expect(document.querySelectorAll('thead .MuiSkeleton-root')).toHaveLength(0);
    expect(document.querySelectorAll('tbody tr')).toHaveLength(0);
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(PAGINATION_SKELETONS);
  });
});
