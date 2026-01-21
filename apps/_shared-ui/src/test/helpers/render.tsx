import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * 
 * @example
 * import { render } from '@/test/helpers/render';
 * 
 * test('renders component', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 */
export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, {
    ...options,
    // Add providers here if needed (Theme, Router, etc.)
    // wrapper: ({ children }) => (
    //   <ThemeProvider>
    //     {children}
    //   </ThemeProvider>
    // ),
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
