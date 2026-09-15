# AeroBook

Production-ready React + TypeScript foundation for the airline booking system.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — typecheck and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — format files with Prettier
- `npm run typecheck` — run TypeScript in strict project mode
- `npm test` — run unit tests with Jest
- `npm run test:coverage` — run unit tests with coverage report

## Tests

Unit tests live in `tests/` and mirror the `src/` folder structure
(for example `src/components/common/AppButton.tsx` → `tests/components/common/AppButton.test.tsx`).
Shared helpers are in `tests/utils/`.

Coverage output is written to `coverage/` (`text`, `lcov`, and `html`).
You can also run `npm test -- --coverage`.

## Environment

Copy `.env.example` to `.env` and adjust values as needed:

- `VITE_API_BASE_URL` — backend API base URL
- `VITE_APP_NAME` — product name shown in the application shell
