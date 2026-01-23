import { describe, it, expect } from 'vitest';

import { createMockUser } from '@/test/helpers/factories';
import { render, screen } from '@/test/helpers/render';

/**
 * Example test to validate testing infrastructure
 *
 * This test demonstrates:
 * - Basic component rendering
 * - Test helpers usage
 * - Factory pattern
 */

// Simple test component
function ExampleComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>This is a test component</p>
    </div>
  );
}

describe('Example Test Suite', () => {
  it('should render component with text', () => {
    render(<ExampleComponent name="World" />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });

  it('should render component with dynamic name', () => {
    const user = createMockUser({ name: 'John Doe' });

    render(<ExampleComponent name={user.name} />);

    expect(screen.getByText('Hello, John Doe!')).toBeInTheDocument();
  });

  it('should render heading with correct role', () => {
    render(<ExampleComponent name="Test" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Hello, Test!');
  });
});

describe('Test Helpers', () => {
  it('should create mock user with factory', () => {
    const user = createMockUser();

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user.role).toBe('user');
  });

  it('should allow overriding factory defaults', () => {
    const admin = createMockUser({ role: 'admin', name: 'Admin User' });

    expect(admin.role).toBe('admin');
    expect(admin.name).toBe('Admin User');
  });
});
