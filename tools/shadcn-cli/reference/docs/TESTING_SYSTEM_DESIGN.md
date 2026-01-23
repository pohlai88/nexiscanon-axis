# Testing System Design: `@workspace/shared-ui`

**Version:** 1.0  
**Date:** 2026-01-21  
**Status:** Design Phase

---

## 📐 System Overview

### Purpose

Build a comprehensive, scalable testing infrastructure for 56+ React components in a monorepo, enabling:

- Fast, reliable component testing
- Real-time feedback during development
- Coverage tracking and quality gates
- CI/CD integration
- Performance profiling

### Scope

- **In Scope:** Component testing, integration testing, coverage analysis, CI/CD
- **Out of Scope:** E2E testing (Playwright exists separately), visual regression (future)

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer IDE                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ VSCode Extension │  │   Vitest MCP     │  │  Vitest UI    │ │
│  │  (vitest.explorer)│  │   (AI Agent)     │  │  (Browser)    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Vitest Core          │
                    │  (Test Runner & Engine)   │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
    ┌────▼────┐           ┌──────▼──────┐         ┌──────▼──────┐
    │  JSDOM  │           │  Happy-DOM  │         │   Browser   │
    │  (slow) │           │   (fast)    │         │    Mode     │
    └────┬────┘           └──────┬──────┘         └──────┬──────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Test Suites Layer     │
                    ├─────────────────────────┤
                    │ • Component Tests       │
                    │ • Integration Tests     │
                    │ • Utility Tests         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Source Under Test     │
                    ├─────────────────────────┤
                    │ • 56 Block Components   │
                    │ • 7 Example Files       │
                    │ • Lib Utilities         │
                    └─────────────────────────┘
```

---

## 🔧 Component Architecture

### 1. Test Runner Core

**Technology:** Vitest v4.x (latest)

**Responsibilities:**

- Discover test files (glob patterns)
- Execute tests in parallel
- Collect results and coverage
- Report to multiple outputs

**Configuration:**

```typescript
// vitest.config.ts
{
  test: {
    globals: true,              // No imports needed
    environment: 'happy-dom',   // Fast DOM simulation
    setupFiles: ['./setup.ts'], // Bootstrap code
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**'],
    pool: 'threads',            // Parallel execution
    poolOptions: {
      threads: {
        singleThread: false,    // Use CPU cores
        isolate: true,          // Test isolation
      },
    },
  }
}
```

---

### 2. Test Environment Layer

#### Option A: Happy-DOM (Default)

**Pros:**

- 3-5x faster than JSDOM
- ESM native
- Good enough for most components

**Cons:**

- Less complete DOM API
- Some edge cases not supported

#### Option B: JSDOM (Fallback)

**Pros:**

- More complete DOM implementation
- Better browser API support

**Cons:**

- Slower (CommonJS overhead)
- Heavier dependency

#### Option C: Browser Mode (Complex Components)

**Pros:**

- Real browser (Playwright/WebDriver)
- Perfect DOM APIs
- Actual visual rendering

**Cons:**

- Slowest (1-3s per test)
- Requires browser automation
- Complex setup

**Decision Matrix:**

```
Component Type         → Environment
──────────────────────────────────────
Simple Display         → Happy-DOM
Complex Interaction    → Happy-DOM
ResizeObserver/Virtual → Browser Mode
Drag & Drop            → Browser Mode
Canvas/WebGL           → Browser Mode
```

---

### 3. Test Organization Structure

```
apps/_shared-ui/
├── src/
│   ├── blocks/
│   │   ├── data-fortress.tsx
│   │   ├── data-fortress.test.tsx              # Core tests
│   │   ├── data-fortress-pagination.test.tsx   # Feature tests
│   │   ├── data-fortress-selection.test.tsx    # Feature tests
│   │   └── magic-approval-table.tsx
│   │       └── magic-approval-table.test.tsx
│   ├── examples/
│   │   └── data-fortress-examples.test.tsx     # Integration tests
│   ├── lib/
│   │   └── navigation-config.test.ts           # Utility tests
│   └── test/
│       ├── setup.ts                            # Global setup
│       ├── helpers/                            # Test utilities
│       │   ├── render.tsx                      # Custom render
│       │   ├── factories.ts                    # Test data factories
│       │   └── mocks.ts                        # Common mocks
│       └── fixtures/                           # Shared test data
│           ├── sample-data.ts
│           └── sample-users.ts
└── vitest.config.ts (workspace root)
```

---

### 4. Test Utilities Layer

#### 4.1 Custom Render Wrapper

**Purpose:** Wrap components with providers (theme, etc.)

```typescript
// src/test/helpers/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@workspace/design-system/providers';

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme="light">
        {children}
      </ThemeProvider>
    ),
    ...options,
  });
}
```

#### 4.2 Test Data Factories

**Purpose:** Generate consistent test data

```typescript
// src/test/helpers/factories.ts
import { faker } from '@faker-js/faker';
import type { DataFortressRow } from '../blocks/data-fortress';

export const createMockRow = (overrides?: Partial<DataFortressRow>) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createMockRows = (count: number) =>
  Array.from({ length: count }, () => createMockRow());
```

#### 4.3 Common Mocks

**Purpose:** Reusable mock implementations

```typescript
// src/test/helpers/mocks.ts
import { vi } from 'vitest';

export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

export const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

---

### 5. Developer Interface Layer

#### 5.1 VSCode Extension (`vitest.explorer`)

**Interface Type:** GUI (Test Explorer)

**Features:**

- Test tree view in sidebar
- Run/debug buttons per test
- Real-time status indicators
- Coverage overlay in editor

**Workflow:**

```
Developer → VSCode Extension → Vitest API → Test Results → UI Update
```

**Configuration:**

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm vitest",
  "vitest.rootConfig": "./vitest.config.ts",
  "vitest.include": ["**/*.{test,spec}.{ts,tsx}"]
}
```

#### 5.2 Vitest MCP (`user-vitest-*`)

**Interface Type:** Programmatic (AI Agent)

**Available Tools:**

1. `set_project_root` - Initialize session
2. `list_tests` - Discover test files
3. `run_tests` - Execute with JSON output
4. `analyze_coverage` - Coverage gaps analysis

**Workflow:**

```
AI Agent → MCP Protocol → Vitest CLI → Structured JSON → Agent Decision
```

**Example Usage:**

```typescript
// AI Agent executes
await mcp.set_project_root({ path: 'C:\\AI-BOS\\NexusCanon-AXIS' });
await mcp.list_tests({ path: './apps/_shared-ui' });
await mcp.run_tests({
  target: './apps/_shared-ui/src/blocks/data-fortress.test.tsx',
  format: 'detailed',
  showLogs: true,
});
```

#### 5.3 Vitest UI (Browser)

**Interface Type:** Web UI (localhost:51204)

**Features:**

- Module graph visualization
- Import breakdown (performance)
- Interactive test runner
- Coverage heatmap

**Workflow:**

```
Developer → Browser → Vitest Dev Server → Test Execution → Live UI Update
```

**Launch:**

```bash
pnpm vitest --ui
# Opens: http://localhost:51204/__vitest__/
```

---

## 📊 Data Flow Architecture

### Test Execution Flow

```
┌──────────────┐
│ Trigger Test │ (VSCode/MCP/CLI/UI)
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│  Vitest Config      │
│  • Load setup.ts    │
│  • Set environment  │
│  • Configure pools  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Test Discovery     │
│  • Glob patterns    │
│  • Filter by path   │
│  • Sort by priority │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Test Scheduling    │
│  • Thread pool      │
│  • Parallel batches │
│  • Dependency order │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
   │ Thread │    │ Thread │    │ Thread │    │ Thread │
   │   #1   │    │   #2   │    │   #3   │    │   #4   │
   └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Aggregate     │
              │ Results       │
              └───────┬───────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
  ┌────────┐    ┌─────────┐    ┌────────┐
  │Terminal│    │Extension│    │  MCP   │
  │ Output │    │   UI    │    │  JSON  │
  └────────┘    └─────────┘    └────────┘
```

---

### Coverage Collection Flow

```
┌──────────────────┐
│  Test Execution  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│  V8 Coverage Agent   │
│  (Inline in Runtime) │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Collect Hit Counts  │
│  • Lines executed    │
│  • Branches taken    │
│  • Functions called  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Source Map Mapping  │
│  (TS → Coverage)     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Filter & Threshold  │
│  • Exclude patterns  │
│  • Check thresholds  │
└────────┬─────────────┘
         │
         ├────────────┬────────────┬────────────┐
         ▼            ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
    │  Text  │  │  JSON  │  │  HTML  │  │   UI   │
    │Reporter│  │  File  │  │ Report │  │ Overlay│
    └────────┘  └────────┘  └────────┘  └────────┘
```

---

## 🔌 Integration Points

### 1. Monorepo Integration

**Challenge:** Multiple packages with interdependencies

**Solution:**

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@workspace/design-system': path.resolve(__dirname, './packages/design-system/src'),
    '@workspace/shared-ui': path.resolve(__dirname, './apps/_shared-ui/src'),
  },
}
```

**Build Order:**

```
packages/design-system (build)
  → apps/_shared-ui (test depends on design-system)
```

---

### 2. Turbo Integration

**Challenge:** Cache test results in monorepo

**Solution:**

```json
// turbo.json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "inputs": [
        "src/**/*.{ts,tsx}",
        "src/**/*.{test,spec}.{ts,tsx}",
        "vitest.config.ts"
      ]
    }
  }
}
```

**Cache Key:**

- Source code hash
- Test file hash
- Config hash
- Dependencies hash

---

### 3. CI/CD Integration

**Pipeline Flow:**

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│  GitHub Actions │
└──────┬──────────┘
       │
       ├─────────────────┐
       ▼                 ▼
┌──────────┐      ┌─────────────┐
│ Checkout │      │ Setup Node  │
└────┬─────┘      └──────┬──────┘
     │                   │
     └─────────┬─────────┘
               ▼
       ┌───────────────┐
       │ pnpm install  │
       └───────┬───────┘
               │
               ▼
       ┌───────────────────┐
       │ pnpm test --run   │
       │ (no watch mode)   │
       └───────┬───────────┘
               │
               ├──────────────┬──────────────┐
               ▼              ▼              ▼
         ┌─────────┐    ┌─────────┐   ┌──────────┐
         │  Pass?  │    │Coverage?│   │  Upload  │
         └────┬────┘    └────┬────┘   │  HTML    │
              │              │         └──────────┘
              ▼              ▼
         ┌─────────────────────┐
         │  PR Status Check    │
         │  ✅ Pass / ❌ Fail  │
         └─────────────────────┘
```

**GitHub Action:**

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
      - run: pnpm test --filter @workspace/shared-ui -- --run
      - run: pnpm test:coverage --filter @workspace/shared-ui -- --run
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

### 4. Design System Dependency

**Challenge:** Components import from `@workspace/design-system`

**Architecture:**

```
┌─────────────────────────────────┐
│  Test File (data-fortress.test) │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Component (data-fortress.tsx)  │
└────────────┬────────────────────┘
             │
             ├───────────────────┬────────────────┬─────────────────┐
             ▼                   ▼                ▼                 ▼
      ┌──────────┐        ┌──────────┐    ┌──────────┐      ┌──────────┐
      │  Table   │        │  Drawer  │    │ Resizable│      │  Button  │
      └────┬─────┘        └────┬─────┘    └────┬─────┘      └────┬─────┘
           │                   │               │                  │
           └───────────────────┴───────────────┴──────────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │  @workspace/design-system   │
                     │  (Real, Not Mocked)         │
                     └─────────────────────────────┘
```

**Strategy:** Import real design system components (not mocked)

- **Pros:** Tests real integration, catches breaking changes
- **Cons:** Slower tests, design system bugs affect all tests

**Alternative (if too slow):** Shallow mock design system

```typescript
// src/test/helpers/mocks.ts
vi.mock('@workspace/design-system/components/table', () => ({
  Table: ({ children }: any) => <div data-testid="mock-table">{children}</div>,
  TableBody: ({ children }: any) => <div>{children}</div>,
  // ... etc
}));
```

---

## 🚀 Performance Architecture

### Optimization Strategy

#### 1. Parallel Execution

```typescript
// vitest.config.ts
poolOptions: {
  threads: {
    singleThread: false,     // Use all CPU cores
    isolate: true,           // Prevent test pollution
    maxThreads: os.cpus().length,
  },
}
```

**Expected Performance:**

- 56 components × 5 tests/component = 280 tests
- 4 CPU cores = ~70 tests per core
- ~30ms per test = 2,100ms per core
- **Total: ~2.1s for full suite** (with parallelism)

#### 2. Test Sharding (CI)

For CI with multiple runners:

```bash
# Runner 1
vitest --shard=1/4

# Runner 2
vitest --shard=2/4

# Runner 3
vitest --shard=3/4

# Runner 4
vitest --shard=4/4
```

**CI Time Reduction:**

- Single runner: ~5-10s
- 4 shards: ~1.5-3s

#### 3. Watch Mode Optimization

```typescript
// vitest.config.ts
watch: {
  ignored: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
}
```

**File Change → Test Re-run:**

- Only affected tests run (Vitest dependency graph)
- Typically <500ms for single component

#### 4. Coverage Performance

```typescript
coverage: {
  provider: 'v8',           // Faster than istanbul
  skipFull: true,           // Skip 100% covered files
  perFile: true,            // Parallel per-file coverage
}
```

---

## 🔒 Quality Gates Architecture

### Multi-Level Quality Enforcement

```
┌────────────────────────────────────────────────────────────┐
│                    Quality Gate Pyramid                     │
├────────────────────────────────────────────────────────────┤
│  Level 4: PR Merge         │  Coverage: 50%+              │
│                             │  All tests pass               │
│                             │  No new warnings              │
├─────────────────────────────┼───────────────────────────────┤
│  Level 3: PR Creation       │  Coverage: 40%+              │
│                             │  Changed files tested         │
│                             │  No test failures             │
├─────────────────────────────┼───────────────────────────────┤
│  Level 2: Pre-Commit        │  Affected tests pass         │
│  (Git Hook)                 │  Linting pass                 │
├─────────────────────────────┼───────────────────────────────┤
│  Level 1: File Save         │  Watch mode tests pass       │
│  (Editor)                   │  No syntax errors             │
└─────────────────────────────┴───────────────────────────────┘
```

### Implementation

#### Level 1: Editor (Real-Time)

**Tool:** Vitest Extension Watch Mode
**Trigger:** File save
**Action:** Run affected tests (<1s)

#### Level 2: Pre-Commit Hook

**Tool:** Husky + lint-staged

```bash
# .husky/pre-commit
pnpm lint-staged

# .lintstagedrc
{
  "apps/_shared-ui/src/**/*.{ts,tsx}": [
    "eslint --fix",
    "vitest related --run"  # Only run tests for changed files
  ]
}
```

#### Level 3: PR Creation (CI)

**Tool:** GitHub Actions
**Trigger:** PR opened/updated
**Requirements:**

- All tests pass
- Coverage ≥40% for new/changed files
- No TypeScript errors

#### Level 4: PR Merge (Branch Protection)

**Tool:** GitHub Branch Protection
**Requirements:**

- PR approved
- All CI checks pass
- Coverage ≥50% overall
- No conflicts

---

## 📈 Monitoring & Observability

### Test Performance Monitoring

```
┌─────────────────────────────────────────────┐
│          Test Execution Timeline            │
├─────────────────────────────────────────────┤
│  Metric                  │  Target  │ Alert │
├──────────────────────────┼──────────┼───────┤
│  Single test duration    │  <50ms   │ >200ms│
│  File suite duration     │  <500ms  │ >2s   │
│  Full suite duration     │  <5s     │ >15s  │
│  Watch mode reaction     │  <1s     │ >3s   │
│  Coverage generation     │  <10s    │ >30s  │
└──────────────────────────┴──────────┴───────┘
```

**Monitoring Tools:**

1. **Vitest Reporter:** `vitest --reporter=json` → Store metrics
2. **Vitest UI:** Module graph → Identify slow imports
3. **GitHub Actions:** Timing in workflow logs

**Example Slow Test Detection:**

```typescript
// vitest.config.ts
test: {
  slowTestThreshold: 200, // Warn if test >200ms
}
```

---

## 🔐 Security & Isolation

### Test Isolation Strategy

#### 1. Process Isolation

```typescript
poolOptions: {
  threads: {
    isolate: true,  // Each test file in separate context
  },
}
```

**Prevents:**

- Global state pollution
- Module cache pollution
- Memory leaks between tests

#### 2. State Reset

```typescript
// setup.ts
afterEach(() => {
  cleanup(); // Unmount React components
  vi.clearAllMocks(); // Reset all mocks
  vi.restoreAllMocks(); // Restore original implementations
});
```

#### 3. Fake Timers (Deterministic)

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

**Use Case:** Test animations, debounce, throttle

---

## 🛡️ Error Handling & Debugging

### Error Flow Architecture

```
┌────────────────┐
│  Test Fails    │
└────────┬───────┘
         │
         ▼
┌──────────────────────┐
│  Error Classification│
│  • Assertion Fail    │
│  • Runtime Error     │
│  • Timeout           │
└────────┬─────────────┘
         │
         ├─────────────┬─────────────┬─────────────┐
         ▼             ▼             ▼             ▼
    ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
    │Terminal│   │Extension   │  MCP   │   │   UI   │
    │ Stack  │   │ Inline  │   │  JSON  │   │ Visual │
    └────┬───┘   └────┬───┘   └────┬───┘   └────┬───┘
         │            │            │            │
         └────────────┴────────────┴────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Debug Actions   │
            │  • Re-run        │
            │  • Debug mode    │
            │  • Check logs    │
            └──────────────────┘
```

### Debugging Tools

#### 1. VSCode Debugger

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

#### 2. Console Logs (showLogs)

```typescript
// MCP
await mcp.run_tests({
  target: '...',
  showLogs: true, // Capture console.log in output
});
```

#### 3. DOM Snapshot (debug)

```typescript
import { screen, debug } from '@testing-library/react';

test('debug example', () => {
  render(<Component />);
  screen.debug(); // Print DOM tree

  const element = screen.getByRole('button');
  screen.debug(element); // Print specific element
});
```

---

## 📦 Deployment Architecture

### Package Distribution

```
┌──────────────────────────────────────────────────────┐
│              @workspace/shared-ui Package             │
├──────────────────────────────────────────────────────┤
│  Exported                 │  Not Exported            │
├───────────────────────────┼──────────────────────────┤
│  src/blocks/*.tsx         │  **/*.test.tsx           │
│  src/lib/*.ts             │  src/test/**             │
│  src/examples/*.tsx       │  vitest.config.ts        │
│  src/styles/*.css         │  coverage/**             │
│                           │  node_modules/           │
└───────────────────────────┴──────────────────────────┘
```

**package.json exports:**

```json
{
  "exports": {
    "./blocks": "./src/blocks/index.ts",
    "./blocks/*": "./src/blocks/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*.css"
  },
  "files": ["src/**/*.{ts,tsx,css}", "!src/**/*.test.{ts,tsx}", "!src/test/**"]
}
```

**Tests are development-only, never shipped to consumers**

---

## 📊 Metrics & KPIs

### Success Metrics

#### Code Coverage

```
Target Progression:
Month 1:  30% →  50%
Month 3:  50% →  70%
Month 6:  70% →  85%
```

#### Test Execution Speed

```
Target:
Full Suite:     <5s  (currently N/A)
Watch Mode:     <1s  (currently N/A)
Single Test:   <50ms (currently N/A)
```

#### Test Reliability (Flakiness)

```
Target: <1% flaky tests
Measurement: Same test, 100 runs, count failures
```

#### Developer Experience

```
Metric:                    Target:
Time to run single test    <3 clicks (VSCode)
Time to debug failure      <2 minutes
Coverage feedback delay    <5 seconds (watch mode)
```

---

## 🔄 Maintenance & Evolution

### Version Upgrade Strategy

#### Vitest Upgrades

```
Cadence: Every 2-3 months
Process:
1. Check CHANGELOG for breaking changes
2. Update vitest + @vitest/* packages
3. Run full test suite
4. Fix breaking changes
5. Update TESTING_PLAN.md if needed
```

#### React Upgrades

```
Impact: High (currently React 19)
Testing:
1. Update @testing-library/react
2. Run tests with --no-coverage (faster)
3. Fix any warnings/errors
4. Run with coverage
```

#### Design System Breaking Changes

```
Risk: Medium-High (56 components depend on it)
Mitigation:
1. Tests will catch breaking changes immediately
2. Version pin design-system in CI
3. Gradual rollout with feature flags
```

---

## 🎯 Design Decisions & Trade-offs

### Decision Log

#### 1. Happy-DOM vs JSDOM

**Decision:** Happy-DOM (default), JSDOM (fallback), Browser Mode (complex)
**Rationale:** 3-5x speed improvement, good enough for 90% of tests
**Trade-off:** Some edge cases need browser mode

#### 2. Real vs Mocked Design System

**Decision:** Import real design system components
**Rationale:** Catch integration bugs, tests are documentation
**Trade-off:** Slower tests, design system bugs affect all tests

#### 3. Inline Tests vs Separate Directory

**Decision:** Co-located (component.test.tsx next to component.tsx)
**Rationale:** Easier to find, better DX, clear ownership
**Trade-off:** More files in src/ directory

#### 4. Coverage Thresholds (Start at 0%)

**Decision:** Start at 0%, increase gradually
**Rationale:** Avoid paralysis, focus on valuable tests first
**Trade-off:** No immediate gate on low coverage

#### 5. Test Factories vs Inline Data

**Decision:** Use factories for complex data, inline for simple
**Rationale:** Balance DRY vs test readability
**Trade-off:** Learning curve for new contributors

---

## 📚 Reference Architecture Patterns

### Pattern 1: Arrange-Act-Assert (AAA)

```typescript
test('should filter data by search term', async () => {
  // Arrange
  const mockData = createMockRows(10);
  const user = userEvent.setup();
  render(<DataFortress data={mockData} />);

  // Act
  const searchInput = screen.getByRole('searchbox');
  await user.type(searchInput, 'John');

  // Assert
  expect(screen.getAllByRole('row')).toHaveLength(2);
});
```

### Pattern 2: Test Fixtures (Shared Data)

```typescript
// src/test/fixtures/sample-data.ts
export const SAMPLE_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// In test
import { SAMPLE_USERS } from '@/test/fixtures/sample-data';
```

### Pattern 3: Custom Matchers

```typescript
// src/test/helpers/matchers.ts
expect.extend({
  toBeVisible(element: HTMLElement) {
    const pass = element.style.display !== 'none';
    return { pass, message: () => `expected ${element} to be visible` };
  },
});

// In test
expect(element).toBeVisible();
```

---

## 🚦 Rollout Plan

### Phase 1: Infrastructure (Week 1)

- ✅ Install dependencies
- ✅ Configure Vitest
- ✅ Set up CI/CD
- ✅ Document patterns

### Phase 2: Pilot (Week 2-3)

- ⬜ Test 1 simple component (button)
- ⬜ Test 1 complex component (data-fortress)
- ⬜ Validate tooling works
- ⬜ Gather feedback

### Phase 3: Scale (Month 2-3)

- ⬜ Test Tier 1 components (5 critical)
- ⬜ Reach 30% coverage
- ⬜ Establish patterns
- ⬜ Train team

### Phase 4: Maturity (Month 4-6)

- ⬜ Test all components
- ⬜ Reach 50-70% coverage
- ⬜ Optimize performance
- ⬜ Full CI/CD integration

---

## ✅ Acceptance Criteria (System Ready)

### Must Have (P0)

- [x] Vitest installed and configured
- [x] VSCode extension installed
- [ ] Can run single test via extension
- [ ] Can debug test with breakpoints
- [ ] Coverage report generated
- [ ] CI pipeline runs tests

### Should Have (P1)

- [ ] Watch mode works
- [ ] Vitest UI accessible
- [ ] MCP tools functional
- [ ] Test utilities (render, factories)
- [ ] ≥1 component fully tested

### Nice to Have (P2)

- [ ] HTML coverage report
- [ ] Pre-commit hooks
- [ ] Performance monitoring
- [ ] Test sharding (CI)

---

**Last Updated:** 2026-01-21  
**Version:** 1.0  
**Status:** Design Complete, Implementation Pending
