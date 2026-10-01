import { Route, Routes } from 'react-router-dom';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useRecentSearchesStore,
  type Airport,
  type FlightSearchFormValues,
} from '@/features/flights';
import { HomePage } from '@/pages/HomePage';
import { renderWithProviders } from '@tests/utils/test-utils';

const kul = {
  id: 'kul',
  code: 'KUL',
  name: 'Kuala Lumpur International',
  city: 'Kuala Lumpur',
  country: 'Malaysia',
  timezone: 'Asia/Kuala_Lumpur',
  terminalCount: 2,
  latitude: 2.7456,
  longitude: 101.7072,
  active: true,
} as Airport;

const nrt = {
  id: 'nrt',
  code: 'NRT',
  name: 'Narita International',
  city: 'Tokyo',
  country: 'Japan',
  timezone: 'Asia/Tokyo',
  terminalCount: 3,
  latitude: 35.772,
  longitude: 140.3929,
  active: true,
} as Airport;

const searchValues: FlightSearchFormValues = {
  tripType: 'ONE_WAY',
  origin: kul,
  destination: nrt,
  departureDate: '2026-10-20',
  returnDate: '',
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'ECONOMY',
  legs: [],
};

describe('recent searches store and home page', () => {
  beforeEach(() => {
    act(() => {
      useRecentSearchesStore.getState().clearHistory();
      void useRecentSearchesStore.persist.clearStorage();
    });
  });

  it('hides the recent searches section when history is empty', () => {
    renderWithProviders(<HomePage />);
    expect(screen.queryByRole('heading', { name: 'Recent searches' })).not.toBeInTheDocument();
  });

  it('shows recent searches and supports remove and clear all', async () => {
    const user = userEvent.setup();

    act(() => {
      useRecentSearchesStore.getState().addSearch(searchValues);
      useRecentSearchesStore.getState().addSearch({
        ...searchValues,
        destination: {
          ...nrt,
          id: 'sin',
          code: 'SIN',
          name: 'Changi',
          city: 'Singapore',
          country: 'Singapore',
        },
        departureDate: '2026-11-01',
      });
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Recent searches' })).toBeInTheDocument();
    expect(screen.getByText('KUL → SIN')).toBeInTheDocument();
    expect(screen.getByText('KUL → NRT')).toBeInTheDocument();

    const nrtCardTitle = screen.getByText('KUL → NRT');
    const nrtCard = nrtCardTitle.closest('.MuiCard-root') as HTMLElement;
    await user.click(
      within(nrtCard).getByRole('button', { name: /Remove search KUL → NRT/i }),
    );

    expect(screen.queryByText('KUL → NRT')).not.toBeInTheDocument();
    expect(screen.getByText('KUL → SIN')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Clear all/i }));
    expect(screen.queryByRole('heading', { name: 'Recent searches' })).not.toBeInTheDocument();
  });

  it('repeats a recent search by navigating to the flights page', async () => {
    const user = userEvent.setup();

    act(() => {
      useRecentSearchesStore.getState().addSearch(searchValues);
    });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app/flights" element={<p>Flights search page</p>} />
      </Routes>,
      { initialEntries: ['/'] },
    );

    await user.click(screen.getByRole('button', { name: /Search again/i }));

    expect(await screen.findByText('Flights search page')).toBeInTheDocument();
  });
});
