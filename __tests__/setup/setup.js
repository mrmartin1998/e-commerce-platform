import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'q') return null;
      if (key === 'category') return null;
      return null;
    }),
    toString: () => '',
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => {
    if (key === 'token') return null;
    if (key === 'ecommerce_cart') return null;
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch API
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
});
