# Northstar Dashboard

A responsive React + TypeScript analytics dashboard built with Vite. It includes KPI cards, accessible navigation, order search and status filters, loading/error/empty states, and a validated new-order dialog.

## Setup

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Vercel deployment

Import the repository root (the folder containing `package.json`, `src/`, and `vite.config.ts`) as the Vercel project root. The included `vercel.json` uses the Vite framework, runs `npm run build`, and serves the generated `dist` directory. Do not set `src` or another subfolder as the Vercel Root Directory.

If Vercel reports `TS18003: No inputs were found` for `tsconfig.app.json`, the deployed commit does not contain the `src/` directory or Vercel is connected to the wrong repository/root. Push the complete project commit and redeploy with the correct repository and root directory.

## Testing

This project uses **Vitest** because it integrates directly with Vite and provides a fast, TypeScript-friendly test runner. **React Testing Library** tests the dashboard through the same accessible interface a user sees, rather than relying on component internals. `@testing-library/user-event` drives realistic typing, clicking, and selection interactions, while `@testing-library/jest-dom` provides readable DOM assertions.

The order service is isolated in `src/services/orders.ts`. Component tests mock that service at the module boundary, so no real network requests are made. Tests cover loading, successful data rendering, request failures and retry, empty results, filtering, navigation, accessible dialogs, required form validation, invalid input, and valid submission. Async behavior is synchronized with `findBy*` and `waitFor` assertions that observe UI state changes; there are no fixed delays.

Queries prioritize accessible roles, labels, and visible text. This also verifies that buttons, form controls, status messages, tables, and dialogs remain usable with assistive technology.

```bash
# Watch tests while developing
npm run test

# Run the suite once (CI-friendly)
npm run test:run

# Generate text and HTML coverage reports
npm run test:coverage
```

Tests use the `jsdom` environment and are initialized by `src/test/setup.ts`. Vitest is configured in `vite.config.ts`, including the `@` path alias and V8 coverage.

## Project structure

```text
src/
  services/orders.ts
  test/setup.ts
  App.tsx
  App.test.tsx
  types.ts
```

## Skills demonstrated

- React, TypeScript, and Vite.
- Accessible dashboard navigation, KPI presentation, search, and status filtering.
- Form validation and loading, error, and empty UI states.
- Vitest, React Testing Library, user-event, and V8 coverage.
- TypeScript production builds and Vercel deployment configuration.

## Repository

- Source code: https://github.com/ADAMDEV01/northstar-dashboard
