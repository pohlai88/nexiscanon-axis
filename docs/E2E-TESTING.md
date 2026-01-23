# E2E Testing Strategy

End-to-end testing approach for NexusCanon-AXIS.

## Recommended Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **Playwright** | Browser automation | Cross-browser, fast, maintained by Microsoft |
| **Neon Branching** | Test database | Instant branches, isolated data, auto-cleanup |

## Setup (Future Implementation)

### 1. Install Playwright

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### 2. Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev --filter @axis/web',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Add Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Test Scenarios

### Critical Path (P0)

Must always pass before merge:

| Test | Description | Priority |
|------|-------------|----------|
| `auth.login` | Login → redirect to dashboard | P0 |
| `auth.register` | Register → onboarding flow | P0 |
| `tenant.access` | Select tenant → load workspace | P0 |
| `tenant.create` | Create new organization | P0 |

### Core Flows (P1)

Important but non-blocking:

| Test | Description | Priority |
|------|-------------|----------|
| `settings.profile` | Update user profile | P1 |
| `settings.team` | Invite team member | P1 |
| `admin.dashboard` | Admin can view dashboard | P1 |
| `admin.tenants` | Admin can list tenants | P1 |

### Edge Cases (P2)

Nice to have:

| Test | Description | Priority |
|------|-------------|----------|
| `error.404` | Invalid route shows 404 | P2 |
| `error.unauthorized` | Non-member can't access tenant | P2 |
| `theme.toggle` | Theme persists across reload | P2 |

---

## Test Database Strategy

### Option A: Neon Branch per Test Run (Recommended)

```yaml
# .github/workflows/e2e.yml
jobs:
  e2e:
    steps:
      - name: Create Neon branch
        uses: neondatabase/create-branch-action@v4
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          branch_name: e2e-${{ github.run_id }}
          api_key: ${{ secrets.NEON_API_KEY }}

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ steps.create-branch.outputs.db_url }}

      - name: Delete Neon branch
        if: always()
        uses: neondatabase/delete-branch-action@v3
```

**Pros:**
- Isolated test data
- Instant provisioning (~1s)
- Auto-cleanup on PR close
- Matches production schema

### Option B: Seeded Local Database

```bash
# Before tests
pnpm tsx scripts/seed.ts

# Run tests
pnpm test:e2e
```

**Pros:**
- Faster (no network)
- Works offline
- Simpler setup

---

## Example Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login and see dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Fill form
    await page.fill('[name="email"]', 'demo@nexuscanon.com');
    await page.fill('[name="password"]', 'demo-password');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('user can access tenant workspace', async ({ page }) => {
    // Login first (use helper or storage state)
    await page.goto('/login');
    // ... login steps

    // Navigate to tenant
    await page.goto('/acme-corp');

    // Verify workspace loaded
    await expect(page.locator('h1')).toContainText('Acme Corporation');
  });
});
```

---

## CI Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Seed database
        run: pnpm tsx scripts/seed.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_APP_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Implementation Roadmap

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 | Document strategy (this file) | ✅ |
| 2 | Install Playwright + config | Pending |
| 3 | Create P0 test suite | Pending |
| 4 | Add to CI pipeline | Pending |
| 5 | Create P1 tests | Pending |

---

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Neon Branching for CI](https://neon.tech/docs/guides/branching-ci)
- [Testing Next.js with Playwright](https://nextjs.org/docs/pages/building-your-application/testing/playwright)
