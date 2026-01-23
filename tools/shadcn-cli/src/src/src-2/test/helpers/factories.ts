/**
 * Test data factories for generating consistent test data
 *
 * @example
 * import { createMockUser, createMockUsers } from '@/test/helpers/factories';
 *
 * const user = createMockUser({ name: 'John Doe' });
 * const users = createMockUsers(10);
 */

let idCounter = 0;

const resetIdCounter = () => {
  idCounter = 0;
};

const generateId = () => {
  idCounter += 1;
  return `id-${idCounter}`;
};

// User factory
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  createdAt: Date;
}

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => ({
  id: generateId(),
  name: `User ${idCounter}`,
  email: `user${idCounter}@example.com`,
  role: 'user',
  createdAt: new Date(),
  ...overrides,
});

export const createMockUsers = (count: number): MockUser[] =>
  Array.from({ length: count }, () => createMockUser());

// DataFortress row factory
export interface MockDataRow {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockDataRow = (
  overrides?: Partial<MockDataRow>,
): MockDataRow => ({
  id: generateId(),
  name: `Item ${idCounter}`,
  email: `item${idCounter}@example.com`,
  status: idCounter % 2 === 0 ? 'active' : 'inactive',
  amount: Math.floor(Math.random() * 10000),
  createdAt: new Date(2024, 0, idCounter),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockDataRows = (count: number): MockDataRow[] =>
  Array.from({ length: count }, () => createMockDataRow());

// Approval item factory
export interface MockApprovalItem {
  id: string;
  caseId: string;
  tenantId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate: Date;
}

export const createMockApprovalItem = (
  overrides?: Partial<MockApprovalItem>,
): MockApprovalItem => ({
  id: `APR-${idCounter.toString().padStart(3, '0')}`,
  caseId: `CASE-${idCounter.toString().padStart(5, '0')}`,
  tenantId: `tenant-${idCounter}`,
  title: `Approval Request ${idCounter}`,
  description: `Description for approval ${idCounter}`,
  amount: Math.floor(Math.random() * 100000),
  currency: '$',
  requestedBy: `user${idCounter}@example.com`,
  requestedAt: new Date(),
  status: 'pending',
  priority: 'normal',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  ...overrides,
});

export const createMockApprovalItems = (count: number): MockApprovalItem[] =>
  Array.from({ length: count }, () => {
    const item = createMockApprovalItem();
    return item;
  });

// Export utility
export { resetIdCounter };
