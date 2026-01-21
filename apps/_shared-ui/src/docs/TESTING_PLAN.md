# Testing Plan: `@workspace/shared-ui`

**Status:** Not Started (0 tests exist)  
**Target:** Component Library Testing with Vitest + Browser Mode  
**Tools:** Vitest Extension + Vitest MCP + React Testing Library

---

## 🎯 Honest Assessment

### Current Reality
- **0** test files exist
- **56** React components in `src/blocks/`
- **7** example integration files in `src/examples/`
- **1** utility module in `src/lib/`
- **0** testing infrastructure configured

### Critical Dependencies
- Complex components depend on `@workspace/design-system` (41 packages)
- React 19.2.0 (latest)
- Next.js 16.1.0 (latest)
- Many components are "use client" with state/hooks
- Resizable panels, drawers, tables require DOM APIs

### Testing Challenges (Honest)
1. **Browser-Dependent Components**: Resizable panels, drag/drop, virtual scroll
2. **Complex State**: Multi-level filtering, sorting, pagination
3. **External Dependencies**: Design system components need proper mocking
4. **No Existing Patterns**: First test suite in monorepo
5. **Time Investment**: 56 components × ~2-4 hours each = 112-224 hours realistic estimate

---

## 📋 Testing Strategy (Rigid Plan)

### Phase 1: Infrastructure Setup (MUST DO FIRST)
**Estimated Time:** 2-3 hours

#### 1.1 Install Dependencies
```bash
pnpm add -D vitest @vitest/ui @vitest/browser happy-dom @testing-library/react @testing-library/user-event @testing-library/jest-dom -w
```

**Required Packages:**
- `vitest` - Test runner
- `@vitest/ui` - Visual test UI
- `@vitest/browser` - Browser mode for real DOM testing
- `happy-dom` - Fast DOM implementation (or `jsdom`)
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - DOM matchers

#### 1.2 Create Vitest Config
**File:** `vitest.config.ts` (workspace root)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./apps/_shared-ui/src/test/setup.ts'],
    include: ['apps/_shared-ui/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/cypress/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/_shared-ui/src/**/*.{ts,tsx}'],
      exclude: [
        'apps/_shared-ui/src/**/*.stories.tsx',
        'apps/_shared-ui/src/examples/**',
        'apps/_shared-ui/src/**/*.d.ts',
      ],
      thresholds: {
        lines: 0, // Start at 0, increase gradually
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/_shared-ui/src'),
      '@workspace/design-system': path.resolve(__dirname, './packages/design-system/src'),
    },
  },
});
```

#### 1.3 Create Test Setup File
**File:** `apps/_shared-ui/src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

#### 1.4 Add Test Scripts
**File:** `apps/_shared-ui/package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### 1.5 Update Turbo.json
**File:** `turbo.json`

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "description": "Run unit tests"
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "description": "Run unit tests with coverage"
    }
  }
}
```

---

### Phase 2: Priority Component Testing (High Value)

#### 2.1 Tier 1: Core Data Components (CRITICAL)
**Estimated Time:** 20-24 hours

These are the most complex, most used, and highest risk:

1. **`data-fortress.tsx`** (918 lines)
   - **Test Coverage Target:** 70%
   - **Test Files:** 
     - `data-fortress.test.tsx` - Core rendering, sorting, filtering
     - `data-fortress-pagination.test.tsx` - Pagination logic
     - `data-fortress-selection.test.tsx` - Row selection
     - `data-fortress-audit.test.tsx` - Audit trail drawer
   - **Key Test Cases:**
     - Column rendering with custom cells
     - Multi-column sorting
     - Filter operators (equals, contains, gt, lt, etc.)
     - Pagination state management
     - Row selection (single, bulk)
     - Export functionality (CSV, JSON)
     - Audit trail rendering
     - Empty state handling
     - Loading skeleton states
   - **Mocking Required:**
     - `toast()` from sonner
     - ResizablePanel APIs
     - Drawer open/close state

2. **`magic-approval-table.tsx`**
   - **Test Coverage Target:** 70%
   - **Test Files:**
     - `magic-approval-table.test.tsx` - Core approval flows
     - `magic-approval-table-edit.test.tsx` - Inline editing
     - `magic-approval-table-drawer.test.tsx` - Detail drawer
   - **Key Test Cases:**
     - Approve/reject actions
     - Inline editing (double-click)
     - Status badge rendering
     - Priority indicators
     - Due date warnings
     - Attachment handling
     - Comment threads
     - Task linking (tenantId + caseId)
     - Tenant grouping

3. **`comparison-cockpit.tsx`**
   - **Test Coverage Target:** 60%
   - **Test Files:**
     - `comparison-cockpit.test.tsx`
   - **Key Test Cases:**
     - Side-by-side comparison rendering
     - Diff highlighting
     - Column mapping
     - Export comparison data

4. **`excel-mode-grid.tsx`**
   - **Test Coverage Target:** 65%
   - **Test Files:**
     - `excel-mode-grid.test.tsx`
     - `excel-mode-grid-keyboard.test.tsx`
   - **Key Test Cases:**
     - Cell editing
     - Keyboard navigation (arrows, tab, enter)
     - Copy/paste simulation
     - Formula calculation (if any)
     - Virtual scrolling performance

#### 2.2 Tier 2: Workflow Components (HIGH)
**Estimated Time:** 16-20 hours

5. **`command-k-palette.tsx`**
   - **Test Coverage Target:** 65%
   - **Key Test Cases:**
     - Keyboard shortcut trigger (Cmd+K)
     - Search/filter commands
     - Command execution
     - Recent commands

6. **`multi-step-wizard.tsx`**
   - **Test Coverage Target:** 70%
   - **Key Test Cases:**
     - Step navigation (next, prev)
     - Form validation per step
     - Progress indicator
     - Final submission

7. **`document-manager.tsx`**
   - **Test Coverage Target:** 60%
   - **Key Test Cases:**
     - File upload
     - File list rendering
     - Delete actions
     - Download actions

8. **`collaborative-form-builder.tsx`**
   - **Test Coverage Target:** 55%
   - **Key Test Cases:**
     - Drag/drop field addition
     - Field configuration
     - Form preview
     - Export form schema

9. **`audit-trail-viewer.tsx`**
   - **Test Coverage Target:** 65%
   - **Key Test Cases:**
     - Timeline rendering
     - Event filtering
     - User attribution
     - Timestamp formatting

10. **`notification-center.tsx`**
    - **Test Coverage Target:** 60%
    - **Key Test Cases:**
      - Notification list
      - Mark as read
      - Delete notifications
      - Badge count

#### 2.3 Tier 3: Display Components (MEDIUM)
**Estimated Time:** 12-16 hours

11-20. **Layout & Display Components:**
- `application-shell-01.tsx`
- `dashboard-header-01.tsx`
- `dashboard-sidebar-01.tsx`
- `double-screen-layout.tsx`
- `navbar-01.tsx`
- `sidebar-01.tsx`
- `header-01.tsx`
- `footer-01.tsx`
- `hero-01.tsx`
- `features-section-01.tsx`

**Test Coverage Target:** 50-60%
**Key Test Cases:**
- Rendering with props
- Navigation links
- Responsive behavior (viewport mocks)
- Theme integration
- Click handlers

#### 2.4 Tier 4: Interactive Cards (MEDIUM)
**Estimated Time:** 10-14 hours

21-30. **Card Components:**
- `interactive-data-table.tsx`
- `interactive-metric-card.tsx`
- `animated-stat-card.tsx`
- `animated-timeline.tsx`
- `activity-feed.tsx`
- `smart-task-list.tsx`
- `smart-queue-workbench.tsx`
- `timeline-playback.tsx`
- `process-steps.tsx`
- `micro-audit-field.tsx`

**Test Coverage Target:** 55%
**Key Test Cases:**
- Data rendering
- Animations (mock timers)
- Click interactions
- State updates

#### 2.5 Tier 5: Content Components (LOW)
**Estimated Time:** 8-12 hours

31-40. **Content Components:**
- `blog-grid.tsx`
- `portfolio-grid.tsx`
- `team-grid.tsx`
- `testimonial-grid.tsx`
- `pricing-table.tsx`
- `faq-component-01.tsx`
- `newsletter-signup.tsx`
- `cta-section-01.tsx`
- `marquee.tsx`
- `bento-grid.tsx`

**Test Coverage Target:** 40-50%
**Key Test Cases:**
- Content rendering
- Grid layouts
- Form submission (newsletter)
- Accordion expand/collapse (FAQ)

#### 2.6 Tier 6: Utility Components (LOW)
**Estimated Time:** 6-10 hours

41-50. **Utility Components:**
- `file-upload-zone.tsx`
- `search-command-palette.tsx`
- `quick-action-toolbar.tsx`
- `crudsp-toolbar.tsx`
- `policy-aware-ui.tsx`
- `exception-first-mode.tsx`
- `inline-chat.tsx`
- `collaborative-canvas.tsx`
- `magic-paste.tsx`
- `template-system.tsx`

**Test Coverage Target:** 45%

41-56. **Remaining Components:**
- `team-room.tsx`
- `login-page-01.tsx`
- `global-admin-page.tsx`
- `personal-config-page.tsx`
- `navbar-component-01.tsx`
- `navbar-overlay.tsx`

**Test Coverage Target:** 40-45%

---

### Phase 3: Integration Testing
**Estimated Time:** 8-12 hours

#### 3.1 Example Integration Tests
Test files in `src/examples/`:
- `command-k-integration.test.tsx`
- `comparison-cockpit-examples.test.tsx`
- `crudsp-erp-examples.test.tsx`
- `data-fortress-examples.test.tsx`
- `excel-mode-grid-examples.test.tsx`
- `magic-approval-table-examples.test.tsx`
- `integrated-audit-system.test.tsx`

**Test Coverage Target:** 50%
**Key Test Cases:**
- Component integration
- Data flow between components
- Event propagation
- Error boundaries

#### 3.2 Utility Testing
**File:** `src/lib/navigation-config.test.ts`

**Test Coverage Target:** 80%
**Key Test Cases:**
- Navigation structure validation
- Link generation
- Active state detection

---

### Phase 4: Coverage & Quality Gates
**Estimated Time:** 4-6 hours

#### 4.1 Coverage Targets (Progressive)

**Initial Target (Phase 1 Complete):**
- Lines: 30%
- Functions: 30%
- Branches: 25%
- Statements: 30%

**3-Month Target:**
- Lines: 50%
- Functions: 50%
- Branches: 40%
- Statements: 50%

**6-Month Target:**
- Lines: 70%
- Functions: 65%
- Branches: 55%
- Statements: 70%

#### 4.2 CI Integration
**File:** `.github/workflows/test.yml` (if using GitHub Actions)

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test --filter @workspace/shared-ui
      - run: pnpm test:coverage --filter @workspace/shared-ui
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 🛠️ Vitest Extension Usage

### VSCode Integration
1. **Install Extension:** `vitest.explorer` (already added to recommendations)
2. **Reload Window:** Ctrl+Shift+P → "Reload Window"
3. **Test Explorer:** View → Testing (Ctrl+Shift+T)

### Extension Features
- ✅ **Run Single Test:** Click green play button next to test
- ✅ **Run File:** Click play button next to file
- ✅ **Debug Test:** Click bug icon to debug
- ✅ **Watch Mode:** Auto-run on file save
- ✅ **Coverage Overlay:** See untested lines in editor
- ✅ **Test Status:** Green/red indicators in gutter

### Extension Settings (Already Configured)
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm vitest",
  "vitest.rootConfig": "./vitest.config.ts"
}
```

---

## 🖥️ Vitest UI (Interactive Browser)

**Reference:** [vitest.dev/guide/ui.html](https://vitest.dev/guide/ui.html#module-graph)

### Installation & Usage
```bash
# Already included in dependencies
pnpm add -D @vitest/ui

# Run with UI
pnpm vitest --ui

# Access at: http://localhost:51204/__vitest__/
```

### Key Features

#### 1. Module Graph Tab
Visual dependency graph for each test file:
- **Entry Module:** Shows which modules your test imports
- **First 50 Modules:** Default view for performance
- **Full Graph:** Click "Show Full Graph" for complete view
- **Hide node_modules:** Toggle external dependencies visibility

#### 2. Module Info (Left-Click Node)
Performance diagnostics per module:
- **Self Time:** Time to import module (excluding static imports)
- **Total Time:** Time including all static imports
- **Transform:** Time Vite took to transform module
- **Source/Transformed/SourceMap:** View original vs transformed code

**Color Coding:**
- 🔴 Red: >500ms (performance issue)
- 🟠 Orange: >100ms (potential concern)
- ✅ Green: <100ms (healthy)

#### 3. Import Breakdown
Sorted list of slowest modules (Top 10 by default):
- Identifies import bottlenecks
- Click to see Module Info
- Yellow = external module

### Use Cases for This Project
1. **Data Fortress Analysis:** 918-line component with 15+ imports
2. **Design System Dependencies:** Track `@workspace/design-system` load times
3. **Circular Dependency Detection:** Visual graph reveals cycles
4. **Performance Profiling:** Find slow-loading modules

### HTML Report (Static)
Generate static HTML report for CI/CD:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: ['default', 'html'],  // 'default' keeps terminal output
  },
});
```

Preview report:
```bash
npx vite preview --outDir ./html
```

---

## 🤖 Vitest MCP Usage

### Available MCP Tools

#### 1. `set_project_root`
**When:** First command in every session
```typescript
await mcp.set_project_root({
  path: "c:\\AI-BOS\\NexusCanon-AXIS"
});
```

#### 2. `list_tests`
**When:** Discover test files
```typescript
await mcp.list_tests({
  path: "./apps/_shared-ui"
});
```

#### 3. `run_tests`
**When:** Execute tests programmatically
```typescript
await mcp.run_tests({
  target: "./apps/_shared-ui/src/blocks/data-fortress.test.tsx",
  format: "detailed",
  showLogs: true
});
```

#### 4. `analyze_coverage`
**When:** Check coverage gaps
```typescript
await mcp.analyze_coverage({
  target: "./apps/_shared-ui/src/blocks",
  format: "detailed",
  exclude: ["**/*.stories.tsx", "**/examples/**"]
});
```

---

## 📊 Testing Workflow (Day-to-Day)

### Workflow 1: Add Test for New Component
1. Create `component-name.test.tsx` next to component
2. Write test using template (see below)
3. Run via VSCode Extension (watch mode)
4. Fix failing tests
5. Verify coverage with MCP: `analyze_coverage`

### Workflow 2: Debug Failing Test
1. Open Test Explorer in VSCode
2. Click debug icon next to failing test
3. Set breakpoints in test or component
4. Inspect variables in Debug Console
5. Fix issue
6. Re-run via Extension

### Workflow 3: Coverage Analysis
1. Run MCP: `analyze_coverage` on target directory
2. Review "Untested Files" and "Low Coverage Files"
3. Prioritize based on criticality
4. Add tests for gaps
5. Re-run coverage analysis

### Workflow 4: Pre-Commit Check
1. Run: `pnpm test --filter @workspace/shared-ui`
2. Run: `pnpm test:coverage --filter @workspace/shared-ui`
3. Verify coverage thresholds met
4. Commit if passing

---

## 📝 Test Template

### Component Test Template
**File:** `component-name.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  const defaultProps = {
    // Define minimal required props
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ComponentName {...defaultProps} />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      render(<ComponentName {...defaultProps} customProp="value" />);
      expect(screen.getByText('value')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle click event', async () => {
      const user = userEvent.setup();
      const onClickMock = vi.fn();
      
      render(<ComponentName {...defaultProps} onClick={onClickMock} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClickMock).toHaveBeenCalledOnce();
    });
  });

  describe('State Management', () => {
    it('should update state on user action', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');
      
      expect(input).toHaveValue('test value');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<ComponentName {...defaultProps} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(<ComponentName {...defaultProps} loading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
```

---

## ⚠️ Known Issues & Mitigations

### Issue 1: Design System Dependency
**Problem:** Components import from `@workspace/design-system`
**Mitigation:** 
- Use path alias in vitest.config.ts
- Mock only specific design system components if needed
- Consider testing design system separately

### Issue 2: ResizeObserver / IntersectionObserver
**Problem:** JSDOM/happy-dom don't support these APIs
**Mitigation:** 
- Mock in setup.ts (already done)
- Use `@vitest/browser` for components that heavily rely on these

### Issue 3: Next.js 16 Features
**Problem:** Server Components, new caching
**Mitigation:** 
- All shared-ui components are "use client"
- Mock next/navigation in setup.ts

### Issue 4: React 19 Features
**Problem:** New hooks, concurrent features
**Mitigation:** 
- @testing-library/react supports React 19
- Use waitFor() for async updates

### Issue 5: Virtual Scrolling
**Problem:** Virtualized lists hard to test
**Mitigation:** 
- Test logic, not visual scrolling
- Mock scroll events
- Consider browser mode for integration tests

---

## 📈 Success Metrics

### Quantitative
- ✅ **0 → 100+ test files** (56 components + examples + utils)
- ✅ **0% → 30%** coverage in first month
- ✅ **0% → 50%** coverage in 3 months
- ✅ **0 → 500+** total test cases

### Qualitative
- ✅ **CI/CD Integration** - Tests run on every PR
- ✅ **Regression Prevention** - Catch bugs before production
- ✅ **Documentation** - Tests serve as usage examples
- ✅ **Confidence** - Safe refactoring with test coverage

---

## 🚀 Getting Started (Step-by-Step)

### Day 1: Setup Infrastructure (3-4 hours)
1. Install dependencies
2. Create vitest.config.ts
3. Create test setup file
4. Add test scripts to package.json
5. Verify setup: Create `example.test.ts` and run

### Day 2: First Real Test (4-6 hours)
1. Pick simplest component (e.g., `badge.tsx` or `button.tsx` from design-system)
2. Write comprehensive test file
3. Run via Extension + MCP
4. Fix issues
5. Document learnings

### Day 3-5: Tier 1 Component (12-16 hours)
1. Pick `data-fortress.tsx`
2. Break into 4 test files
3. Write tests incrementally
4. Run coverage analysis
5. Refactor component if needed for testability

### Week 2-3: Complete Tier 1 (40-50 hours)
1. Complete remaining Tier 1 components
2. Establish test patterns
3. Create reusable test utilities
4. Document common mocking patterns

### Month 2-3: Tier 2-3 (60-80 hours)
1. Complete workflow components
2. Complete display components
3. Increase coverage to 40-50%

### Month 4-6: Tier 4-6 + Integration (60-80 hours)
1. Complete remaining components
2. Add integration tests
3. Reach 50-70% coverage
4. CI/CD hardening

---

## 🎯 Honest Risks & Mitigation

### Risk 1: Time Overrun
**Likelihood:** High (80%)
**Impact:** Medium
**Mitigation:** 
- Start with highest-value components
- Accept lower coverage initially
- Focus on critical paths

### Risk 2: Flaky Tests
**Likelihood:** Medium (50%)
**Impact:** High
**Mitigation:** 
- Use waitFor() for async operations
- Avoid hardcoded timeouts
- Use deterministic mocks
- Document flaky test patterns

### Risk 3: Test Maintenance Burden
**Likelihood:** High (70%)
**Impact:** Medium
**Mitigation:** 
- Keep tests focused (one concept per test)
- Use test factories for fixtures
- Share common setup via helpers
- Delete obsolete tests

### Risk 4: Coverage Pressure
**Likelihood:** Medium (60%)
**Impact:** Low
**Mitigation:** 
- Start with 0% thresholds
- Increase gradually (5-10% per month)
- Focus on valuable tests, not coverage %
- Use coverage to find gaps, not as goal

### Risk 5: Component Refactoring
**Likelihood:** Medium (50%)
**Impact:** High (tests break)
**Mitigation:** 
- Test behavior, not implementation
- Minimize test-implementation coupling
- Use accessible queries (getByRole)
- Expect test updates during refactors

---

## 📚 Resources

### Documentation
- [Vitest Docs](https://vitest.dev)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)

### MCP Tools
- `user-vitest-set_project_root`
- `user-vitest-list_tests`
- `user-vitest-run_tests`
- `user-vitest-analyze_coverage`

### VSCode Extension
- `vitest.explorer` (ID: vitest.explorer)

---

## ✅ Next Steps

**IMMEDIATE (Today):**
1. Install Vitest dependencies
2. Create vitest.config.ts
3. Create test setup file
4. Add test scripts
5. Verify with simple test

**THIS WEEK:**
1. Test first Tier 1 component
2. Document patterns
3. Set up CI

**THIS MONTH:**
1. Complete Tier 1 (4-5 components)
2. Reach 30% coverage
3. Establish testing culture

**THIS QUARTER:**
1. Complete Tier 1-3
2. Reach 50% coverage
3. Full CI/CD integration

---

**Last Updated:** 2026-01-21  
**Author:** AI-BOS Testing Plan  
**Status:** Ready for Implementation
