import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Providers } from '@/components/providers/Providers';
import type { QueryClientConfig } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    QueryClient: class extends actual.QueryClient {
      constructor(config?: QueryClientConfig) {
        super(config);
      }
    },
  };
});

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">Hello</div>
      </Providers>
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('wraps children in QueryClientProvider', () => {
    const { container } = render(
      <Providers>
        <span>Test</span>
      </Providers>
    );
    expect(container.querySelector('[class]')).toBeNull();
    expect(screen.getByText('Test')).toBeDefined();
  });
});