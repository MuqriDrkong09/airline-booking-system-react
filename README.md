# AeroBook

React + TypeScript frontend for the AeroBook airline booking system.

Built with Vite, MUI, React Router, TanStack Query, Zustand, React Hook Form, and Zod.

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd airline-booking-system-react
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Copy the example env file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Product name shown in the UI | `AeroBook` |
| `VITE_USE_MOCK_AUTH` | Use in-browser mock auth instead of real API | `true` |

4. **Start the development server**

```bash
npm run dev
```

Open the URL printed in the terminal (typically `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm run typecheck` | Run TypeScript in strict project mode |
| `npm test` | Run unit tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Demo accounts (mock auth)

With `VITE_USE_MOCK_AUTH=true` (default), you can sign in without a backend:

| Role | Email | Password |
|------|-------|----------|
| Customer (`USER`) | `user@example.com` | `Password123!` |
| Admin (`ADMIN`) | `admin@example.com` | `Password123!` |

Registration, email verification, and password reset also work in mock mode. Verification and reset tokens are shown in on-screen success messages (and persisted in session storage).

## Implemented features

### Application foundation

- Vite + React 19 + TypeScript (strict)
- Feature-based folder structure under `src/features/`
- Shared design system and common UI components (MUI)
- Light / dark / system theme modes
- Public, customer, and admin layouts with responsive navigation
- Route-based breadcrumbs and protected / role-based routing
- Content-shaped loading skeletons (`src/components/common/skeletons/`) for
  flight cards, booking cards, profile, tables, dashboard metrics, charts,
  flight details, and seat maps — used instead of spinners on content-heavy
  pages so layout does not jump while data loads. `PageLoader` remains for
  auth bootstrap, route guards, and Suspense

### Authentication (`src/features/auth/`)

- Register (full profile fields, terms acceptance)
- Login (email, password, remember me, password visibility toggle)
- Logout with session cleanup
- Forgot password / reset password
- Email verification
- JWT-ready token storage (localStorage vs sessionStorage via “Remember me”)
- Session restore on app load with loading state
- Roles: `USER` and `ADMIN`
- Route guards (`ProtectedRoute`, `RoleRoute`, `CustomerRoute`, `AdminRoute`):
  - unauthenticated → `/login`
  - authenticated without permission → `/forbidden` (403)
  - `USER`: customer pages (`/app`) only
  - `ADMIN`: customer pages and admin pages (`/admin`)
- Frontend RBAC is for UX/routing only; APIs must enforce authorization server-side
- Mock auth API (default) or HTTP auth when `VITE_USE_MOCK_AUTH=false`
- Forms validated with Zod + React Hook Form

### Customer home (`src/features/customerHome/`)

- Customer workspace home at `/app` with personalized welcome
- Summary stats for upcoming trips, check-in ready bookings, favourites, and unread notifications
- Quick-action cards into search, flight status, bookings, check-in, favourites, and notifications
- Upcoming trips preview (reuse My Bookings cards + cancel dialog)
- Recent flight searches section

### Customer profile (`src/features/profile/`)

- View profile
- Edit profile (title, name, phone, date of birth, nationality)
- Travel preferences (cabin, seat, meal, newsletter)
- Change password
- Shared `ProfileSkeleton` while loading, save-button state, success and error alerts
- Data fetching/mutations with TanStack Query

### Flight search (`src/features/flights/`)

- Trip types: one-way, round-trip, multi-city
- Recent flight searches on the public home page (Zustand persist, latest 10):
  origin, destination, departure / return dates, passenger count, cabin class,
  and timestamp — with search again, remove, and clear-all actions
- Airport autocomplete with origin/destination swap
- Departure / return date validation (and per-leg dates for multi-city)
- Passenger selector (adults, children, infants) and cabin class
  (`ECONOMY`, `PREMIUM_ECONOMY`, `BUSINESS`, `FIRST`)
- Zod + React Hook Form validation
- Search criteria persisted in URL query parameters for sharing/bookmarks  
  Example: `/app/flights?from=KUL&to=NRT&departure=2026-10-20&return=2026-10-27&adults=2&cabin=ECONOMY`
- Search results with airline, logo, flight number, times, duration, stops, cabin,
  baggage, price, and seats
- Reusable results UI: `FlightCard`, `FlightList`, `FlightPrice`, `FlightTimeline`,
  `FlightFilters`, `FlightSort`
- Filters: price range, airlines, stops, departure/arrival time, duration, cabin,
  refundable, baggage — synced to the URL, with clear action, active count,
  desktop sidebar, and mobile drawer
- Sort: Recommended, Lowest Price, Shortest Duration, Earliest/Latest Departure,
  Earliest Arrival — type-safe, non-mutating, synced via `sort` URL param
- Flight details at `/app/flights/:flightId` with airline, aircraft, terminals,
  schedule, segments, baggage, meals, Wi-Fi, seats, refund/change policies, and
  fare conditions — plus a **Select Flight** action that continues to passengers
- Admin flight management at `/admin/flights` (`src/features/adminFlights/`):
  list / search / filter, create & edit via `FlightDialog` + `FlightForm`
  (React Hook Form + Zod), delete with confirmation, and inline status updates;
  mock API when `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/flights`
- Admin airport management at `/admin/airports` (`src/features/adminAirports/`):
  list / search / filter, create & edit via `AirportDialog` + `AirportForm`
  (React Hook Form + Zod), activate/deactivate, and delete with confirmation;
  mock API when `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/airports`
- Admin aircraft management at `/admin/aircraft` (`src/features/adminAircraft/`):
  list / search / filter, view details, create & edit via `AircraftDialog` +
  `AircraftForm` (React Hook Form + Zod), activate/deactivate, and delete with
  confirmation; cabin seat counts hydrate a typed `seatMapConfig`
- Admin aircraft seat configuration at `/admin/aircraft/:aircraftId/seats`:
  interactive seat-map editor for rows, columns, labels, cabin class, seat type
  (`STANDARD` / `PREMIUM` / `EXTRA_LEGROOM` / `EMERGENCY_EXIT` / `UNAVAILABLE`),
  price, emergency-exit and disabled flags; Zod-validated persistence on the
  aircraft record; mock API when `VITE_USE_MOCK_AUTH=true`
- Admin booking management at `/admin/bookings` (`src/features/adminBookings/`):
  search, filter by status / departure date / flight, view details, cancel,
  refund, and modify primary contact; responsive table with server-side
  pagination and sorting via query parameters; mock API when
  `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/bookings`
- Admin user management at `/admin/users` (`src/features/adminUsers/`):
  list / search / filter by role (`USER` / `ADMIN`) and status, view details,
  activate / deactivate with confirmation, and change role with safeguards that
  prevent admins from removing their own administrator access; mock API when
  `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/users`
- Admin promo code management at `/admin/promo-codes` (`src/features/adminPromoCodes/`):
  list / search / filter by discount type and status, create & edit via
  `PromoCodeDialog` + Zod-validated form (date range and discount rules),
  activate / deactivate, and delete with confirmation; mock API when
  `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/promo-codes`
- Admin reports at `/admin/reports` (`src/features/adminReports/`): period filters
  (today / 7d / 30d / 3m / 12m / custom), KPI cards, and Recharts for revenue,
  bookings, passengers, cancellations, refunds, popular routes/destinations, and
  airline performance via reusable report chart components; mock API when
  `VITE_USE_MOCK_AUTH=true`, otherwise `/admin/reports`
- Favourite flights at `/app/favourites` (TanStack Query): save offers from


  `FlightCard` and `FlightDetailsHeader` via `FavouriteButton`, browse saved
  flights with `FavouriteFlightCard`, and remove them. Mock mode persists to
  `localStorage`; live mode uses the backend favourites API
- Flight status lookup at `/app/flight-status` (TanStack Query): search by flight
  number and date; show airline, route, scheduled/estimated departure and arrival,
  terminal, gate, and status (`SCHEDULED`, `BOARDING`, `DELAYED`, `DEPARTED`,
  `ARRIVED`, `CANCELLED`)
- Notifications at `/app/notifications` (TanStack Query) with header bell +
  dropdown: types `BOOKING_CONFIRMED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`,
  `FLIGHT_DELAYED`, `FLIGHT_CANCELLED`, `CHECK_IN_AVAILABLE`, `BOARDING`,
  `BOOKING_CANCELLED` — unread count, mark as read, mark all as read, and delete
- Passenger details at `/app/flights/:flightId/passengers` with dynamic adult /
  child / infant forms (RHF + Zod): title, name, DOB, gender, nationality,
  passport, contact — passport rules for international flights, age bands,
  infant–adult association, count match to search, draft save + error states
- Seat selection at `/app/flights/:flightId/seats` with reusable `SeatMap`,
  `Seat`, `SeatRow`, `SeatLegend`, and `SeatSelectionSummary` — economy through
  first class, seat states (available / selected / occupied / premium /
  emergency exit / unavailable), per-passenger assignment, keyboard access,
  price totals, and a mobile-friendly scrollable map
- Baggage selection at `/app/flights/:flightId/baggage` with `BaggageSelector`,
  `BaggageOption`, and `BaggageSummary` — cabin, checked, and additional bags
  (7KG / 20KG / 30KG / 40KG), fare allowance, per-passenger choices, price
  totals, validation, and booking-state updates
- Meal selection at `/app/flights/:flightId/meals` with reusable `MealOption`,
  `MealSelector`, and `MealSummary` — standard through child meals, availability,
  quantity, per-passenger assignment, remove, price totals, and booking sync
- Booking add-ons at `/app/flights/:flightId/addons` with `AddonCard`,
  `AddonSelector`, and `AddonSummary` — preferred seat, extra legroom, priority
  boarding, lounge, insurance, extra baggage, and meals — with availability,
  passenger applicability, select/remove, and booking total updates
- Booking summary at `/app/flights/:flightId/summary` with `BookingSummary`,
  `FlightSummary`, `PassengerSummary`, `SeatSummary`, `AddonSummary`, and
  `PriceBreakdown` — flight through add-ons, fare / taxes / discount / total,
  edit links back to each step, and a confirmation checkbox before payment
- Promo codes (`src/features/promo/`) with `PromoCodeInput` and `PromoCodeResult`
  — TanStack Query validation for valid / invalid / expired codes, minimum
  booking amount, percentage and fixed discounts (with max cap); example
  `FLIGHT100` applies an RM100 discount and updates the booking total
- Mock payment at `/app/flights/:flightId/payment` with `PaymentMethodSelector`,
  `CardForm`, `PaymentSummary`, and `PaymentStatus` — credit/debit card, FPX,
  and e-wallet; client-side card validation; loading / success / failure /
  retry; duplicate-submit protection; card PAN/CVV never persisted
- Booking creation after payment success: validate checkout (state, passengers,
  seats, baggage, add-ons), create a typed `Booking` (`PENDING` / `CONFIRMED` /
  `CANCELLED` / `CHECKED_IN` / `COMPLETED` / `REFUNDED`), generate reference,
  persist to the bookings store, clear temporary drafts, and redirect to
  `/app/bookings/:reference/confirmation`
- Booking confirmation page with success state, reference/status, passengers,
  flight, seats, baggage, meals, add-ons, and payment summary — plus e-ticket /
  invoice view & download, printable invoice, view booking, and add-to-calendar
- Printable e-ticket at `/app/bookings/:reference/eticket` with passenger name,
  booking reference, airline, flight number, origin / destination, departure
  date & time, arrival time, seat, boarding information, and a QR code that
  encodes only a safe booking identifier (`AEROBOOK:<reference>` — no PII)
- Digital boarding pass at `/app/bookings/:reference/boarding-pass` (after
  check-in): passenger, flight, origin / destination, date, departure and
  boarding times, gate, terminal, seat, boarding group, plus QR and barcode.
  Mobile wallet-style layout with print support (`?print=1`)
- Printable invoice at `/app/bookings/:reference/invoice` with invoice number,
  booking reference, passengers, flight, fare / baggage / meals / add-ons /
  taxes / discount / total, payment status and date. Built from a structured
  `BookingInvoice` DTO via `InvoiceProvider` so a backend PDF can replace the
  client layout later without changing call sites
- My Bookings (`/app/bookings`) with Upcoming / Past / Cancelled tabs, search and
  sort filters, pagination, and booking cards (reference, airline, flight number,
  route, date, passengers, total, status). Actions: View, Manage, Cancel, Check-in,
  Boarding pass (when checked in), E-ticket. Booking detail at `/app/bookings/:reference`
- Online check-in at `/app/check-in`: look up by booking reference + last name,
  select eligible passengers, confirm seats and baggage, then complete check-in.
  Sets status `CHECKED_IN` and tracks checked-in passenger ids. Blocked when the
  flight has departed, the booking is cancelled, passengers are already checked in,
  or the check-in window is closed (opens 48h before departure, closes 1h before).
  After check-in, open the digital boarding pass from the result step.
- Booking details page with reusable sections (booking information, flight,
  passengers, seats, baggage, meals, add-ons, payment, cancellation policy) and
  skeleton / error / not-found states
- Manage booking (`/app/bookings/:reference/manage`): change seats, baggage, meals,
  add-ons, contact details, and change flight when permitted. Flight changes show
  original fare, new fare, change fee, and amount due/refund with confirmation
  before applying
- Booking cancellation flow (view → policy → fee → refund → confirm → result) with
  statuses `CANCELLATION_REQUESTED`, `CANCELLED`, and `REFUNDED`; completed/departed
  flights cannot be cancelled
- Centralized booking store (`src/features/booking/`) with search criteria,
  selected flight, passengers, seats, baggage, meals, add-ons, promo code,
  safe payment snapshot, price breakdown, booking reference, and status —
  plus selectors for passenger/seat/baggage/meal/addon totals, subtotal,
  discount, taxes, and final total; only non-sensitive fields are persisted
- Skeleton / error / empty / results states via TanStack Query (flight results
  and details use card/detail skeletons rather than full-page spinners)

### Layouts & navigation

- **Public** — marketing shell, sign-in / create-account CTAs
- **Customer** (`/app`) — home dashboard plus sidebar navigation for flights, favourites, flight status, bookings, check-in, notifications, profile; header notification bell with unread badge
- **Admin** (`/admin`) — operations dashboard with KPI cards and Recharts; flight management at `/admin/flights`; airport management at `/admin/airports`; aircraft management at `/admin/aircraft` (CRUD, activate/deactivate) plus interactive seat-map configuration at `/admin/aircraft/:id/seats` with Zod validation; mock API when `VITE_USE_MOCK_AUTH=true`. Other admin modules remain placeholders.

Many booking/admin domains are scaffolded as placeholder pages and will be implemented in later iterations.

## Project structure (high level)

```text
src/
  app/           # Providers, router, theme, global store
  components/    # Shared UI (layout, forms, common)
  constants/     # Routes, nav, registration options
  features/      # Domain modules (auth, profile, …) — UI + React Query
  pages/         # Route-level page shells
  services/      # HTTP API layer (no Axios in components)
    api/         # client, endpoints, interceptors, errors
    authApi/ flightApi/ airportApi/ bookingApi/
    passengerApi/ paymentApi/ userApi/ adminApi/ notificationApi/
  types/         # Shared TypeScript types
tests/           # Jest unit tests mirroring src/
```

### API architecture (`src/services/`)

- Shared Axios client (`services/api/client.ts`) with `VITE_API_BASE_URL` and 15s timeout
- Request interceptor attaches bearer tokens; response interceptor retries idempotent GETs on network/5xx/429
- Standardized `ApiError` / `toApiError` (auth keeps `AuthApiError` alias)
- Global + feature error handling for network, 401, 403, 404, 409, 422, 429, 500+
  with user-friendly copy (no stack traces in UI); `logApiError` in development only
- Pages: `NotFoundPage`, `UnauthorizedPage`, `ForbiddenPage`; shared `ErrorBoundary` + `ErrorState`
- Central `API_ENDPOINTS` path map
- Domain services own HTTP calls; features/hooks consume services — never Axios in components
- Mock vs HTTP still selected with `VITE_USE_MOCK_AUTH`

## Testing

Unit tests live in `tests/` and mirror the `src/` structure  
(for example `src/components/common/AppButton.tsx` → `tests/components/common/AppButton.test.tsx`).

Shared helpers are in `tests/utils/`.

```bash
npm test
npm run test:coverage
```

Coverage output is written to `coverage/` (`text`, `lcov`, and `html`).

## Switching to a real backend

1. Set `VITE_USE_MOCK_AUTH=false` in `.env`.
2. Point `VITE_API_BASE_URL` at your API.
3. Implement the paths in `src/services/api/endpoints.ts` (auth, flights, airports, bookings, payments, notifications, admin, …).
4. Domain services under `src/services/*Api/` call those endpoints through the shared client.

## License

Private project — all rights reserved.
