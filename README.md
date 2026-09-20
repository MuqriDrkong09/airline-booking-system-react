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

### Authentication (`src/features/auth/`)

- Register (full profile fields, terms acceptance)
- Login (email, password, remember me, password visibility toggle)
- Logout with session cleanup
- Forgot password / reset password
- Email verification
- JWT-ready token storage (localStorage vs sessionStorage via “Remember me”)
- Session restore on app load with loading state
- Roles: `USER` and `ADMIN`
- Mock auth API (default) or HTTP auth when `VITE_USE_MOCK_AUTH=false`
- Forms validated with Zod + React Hook Form

### Customer profile (`src/features/profile/`)

- View profile
- Edit profile (title, name, phone, date of birth, nationality)
- Travel preferences (cabin, seat, meal, newsletter)
- Change password
- Loading skeleton, save-button state, success and error alerts
- Data fetching/mutations with TanStack Query

### Flight search (`src/features/flights/`)

- Trip types: one-way, round-trip, multi-city
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
  fare conditions — plus a **Select Flight** action
- Loading / error / empty / results states via TanStack Query

### Layouts & navigation

- **Public** — marketing shell, sign-in / create-account CTAs
- **Customer** (`/app`) — sidebar navigation for flights, bookings, check-in, notifications, profile
- **Admin** (`/admin`) — admin dashboard navigation (placeholder pages for upcoming modules)

Many booking/admin domains are scaffolded as placeholder pages and will be implemented in later iterations.

## Project structure (high level)

```text
src/
  app/           # Providers, router, theme, global store
  components/    # Shared UI (layout, forms, common)
  constants/     # Routes, nav, registration options
  features/      # Domain modules (auth, profile, …)
  pages/         # Route-level page shells
  services/      # API clients (auth, etc.)
  types/         # Shared TypeScript types
tests/           # Jest unit tests mirroring src/
```

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
3. Ensure the backend exposes the auth/profile endpoints used by `src/services/auth/` (login, register, me, password flows, etc.).

## License

Private project — all rights reserved.
