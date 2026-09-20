import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMockFlightsApi,
  findMockFlightOfferById,
  generateMockFlightOffers,
  getFlightById,
} from '@/features/flights';
import { FlightDetails } from '@/features/flights/components/details/FlightDetails';
import { FlightDetailsPage } from '@/pages/customer/FlightDetailsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

const baseRequest = {
  from: 'KUL',
  to: 'NRT',
  departure: '2026-10-20',
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'ECONOMY' as const,
};

describe('flight details data', () => {
  it('includes aircraft, terminals, amenities, policies, and segments on offers', () => {
    const [offer] = generateMockFlightOffers(baseRequest);

    expect(offer?.aircraft.model).toBeTruthy();
    expect(offer?.origin.terminal).toBeTruthy();
    expect(offer?.destination.terminal).toBeTruthy();
    expect(offer?.amenities.meals).toBeTruthy();
    expect(typeof offer?.amenities.wifi).toBe('boolean');
    expect(offer?.amenities.seatInformation).toBeTruthy();
    expect(offer?.policies.refundPolicy).toBeTruthy();
    expect(offer?.policies.changePolicy).toBeTruthy();
    expect(offer?.policies.fareConditions.length).toBeGreaterThan(0);
    expect(offer?.segments.length).toBeGreaterThan(0);
    expect(offer?.baggage.allowanceSummary).toBeTruthy();
  });

  it('resolves an offer by id through the mock API', async () => {
    const [offer] = generateMockFlightOffers(baseRequest);
    expect(offer).toBeTruthy();

    const found = findMockFlightOfferById(offer!.id, baseRequest);
    expect(found?.id).toBe(offer!.id);

    const viaApi = await getFlightById(offer!.id, baseRequest);
    expect(viaApi?.flightNumber).toBe(offer!.flightNumber);
  });

  it('throws for the ERR details fixture', async () => {
    const api = createMockFlightsApi({ delayMs: 0 });
    await expect(api.getFlightById('ERR')).rejects.toThrow(/Unable to load flight details/i);
  });
});

describe('FlightDetails', () => {
  it('renders key details and selects the flight', async () => {
    const user = userEvent.setup();
    const onSelectFlight = jest.fn();
    const [offer] = generateMockFlightOffers(baseRequest);

    renderWithProviders(<FlightDetails flight={offer!} onSelectFlight={onSelectFlight} />);

    expect(screen.getByRole('heading', { name: offer!.airline.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Itinerary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Baggage allowance/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Policies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Fare details/i })).toBeInTheDocument();
    expect(screen.getByText(/Seat information/i)).toBeInTheDocument();
    expect(screen.getByText(/Meals/i)).toBeInTheDocument();
    expect(screen.getByText(offer!.amenities.seatInformation)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Select Flight/i }));
    expect(onSelectFlight).toHaveBeenCalledWith(offer);
  });
});

describe('FlightDetailsPage', () => {
  it('loads flight details from the route and search context', async () => {
    const [offer] = generateMockFlightOffers(baseRequest);

    renderWithProviders(
      <Routes>
        <Route path="/app/flights/:flightId" element={<FlightDetailsPage />} />
      </Routes>,
      {
        initialEntries: [
          `/app/flights/${offer!.id}?from=KUL&to=NRT&departure=2026-10-20&adults=1&cabin=ECONOMY`,
        ],
      },
    );

    expect(await screen.findByRole('heading', { name: 'Flight details' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: offer!.airline.name })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Select Flight/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to results/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/app/flights?'),
    );
  }, 15000);
});
