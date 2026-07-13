import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NEXT_PUBLIC_SIGNAL_API_URL: 'http://localhost:8000',
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});