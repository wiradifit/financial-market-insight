<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Financial Market Insight — Development Guide

## TDD Workflow (MANDATORY)

### Rule: Write Tests FIRST, Then Code

For EVERY feature, bug fix, or code change, follow this strict order:

1. **Write the test** — Create/update a `*.test.ts` (Vitest) or `*.test.tsx` file that:
   - Tests the expected behavior
   - Tests edge cases (null, undefined, error states, empty arrays)
   - Tests all code branches
   - Verifies component rendering for all states (loading, error, empty, data)

2. **Run the test** — Confirm it FAILS (`npm run test`)
   ```
   npm run test -- --reporter=verbose
   ```

3. **Write the code** — Implement the feature
   - Keep code minimal (YAGNI)
   - Follow existing patterns and conventions
   - Use the existing utility modules, stores, and clients

4. **Run the test** — Confirm it PASSES

5. **Run full suite** — Verify no regressions
   ```
   npm run test && npm run typecheck
   ```

6. **Check coverage** — Coverage must stay above thresholds
   ```
   npm run test:coverage
   ```

### Coverage Thresholds
- Statements: 77%
- Branches: 59%
- Functions: 78%
- Lines: 79%

## Test Commands

```bash
# Run all unit + component tests
npm run test

# Run with coverage report
npm run test:coverage

# Watch mode (TDD)
npm run test:watch

# Run E2E tests (requires dev server)
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all

# Python backend tests
cd services/signal-engine && source venv/bin/activate && python -m pytest tests/ -v

# Type checking
npx tsc --noEmit
```

## Project Structure

```
openBB/
├── src/                    # Next.js App Router source
│   ├── app/                # Pages + API routes
│   ├── components/         # React components
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── chart/          # Chart components
│   │   ├── network/        # Network monitor
│   │   └── providers/      # React context providers
│   ├── lib/
│   │   ├── data/           # API clients (signal-api, ccxt)
│   │   ├── stores/         # Zustand stores (UI, notifications)
│   │   └── utils/          # Formatting, notifications
│   └── types/              # Shared TypeScript interfaces
├── services/signal-engine/ # Python FastAPI backend
├── e2e/                    # Playwright E2E tests
├── vitest.config.ts        # Vitest configuration
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json           # TypeScript configuration
```

## Testing Architecture

| Tool | Purpose | Config |
|------|---------|--------|
| Vitest | Unit + component tests | vitest.config.ts |
| @testing-library/react | Component rendering + queries | vitest.setup.ts |
| @testing-library/user-event | User interaction simulation | - |
| Playwright | E2E browser tests | playwright.config.ts |
| pytest | Python backend tests | services/signal-engine/tests/ |

### Test Files Convention
- Colocate test files with source: `Component.tsx` → `Component.test.tsx`
- Use `describe` / `it` pattern
- Mock external dependencies (next/navigation, @tanstack/react-query, zustand stores, signal-api-client)
- Use `renderWithProviders` from `src/test-utils.tsx` for components that use React Query

## Deployment

### Vercel (Frontend)
- Next.js with App Router, deployable via Vercel dashboard or CLI
- Set env var: `NEXT_PUBLIC_SIGNAL_API_URL` = your Python engine URL
- Build command: `next build`
- Output: `.next/`

### Google Cloud Run (Python Backend)
- From `services/signal-engine/`:
  ```
  gcloud run deploy signal-engine --source . --region us-central1
  ```
- Exposes port 8000
- Requires env vars: `CORS_ORIGINS`

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.10 | Framework (App Router, Turbopack) |
| react | 19.2.4 | UI library |
| zustand | 5.0.14 | State management |
| @tanstack/react-query | 5.101.2 | Server state / caching |
| ccxt | 4.5.64 | Crypto exchange data |
| framer-motion | 12.42.2 | Animations |
| date-fns | 4.4.0 | Date utilities |
| lucide-react | 1.23.0 | Icons |