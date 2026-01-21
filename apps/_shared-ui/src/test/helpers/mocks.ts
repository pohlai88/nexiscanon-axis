import { vi } from 'vitest';

/**
 * Mock implementations for common dependencies
 */

// Toast mock (sonner)
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  promise: vi.fn(),
  custom: vi.fn(),
  message: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
};

// Router mock (Next.js)
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

// File mock for drag & drop tests
export const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
};

// Mock data for tables/grids
export const createMockTableData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'inactive',
    value: Math.floor(Math.random() * 1000),
    createdAt: new Date(2024, 0, i + 1).toISOString(),
  }));
};

// Mock event handlers
export const createMockHandlers = () => ({
  onClick: vi.fn(),
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
});
