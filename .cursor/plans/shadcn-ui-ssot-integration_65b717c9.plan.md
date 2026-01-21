---
name: shadcn-ui-ssot-integration
overview: Transform design system to use shadcn/ui as Single Source of Truth with auto-sync mechanism, archive current system, and add customization layer on top (Magic UI pattern).
todos:
  - id: archive-current
    content: Archive current design system components to packages/design-system-archived/
    status: pending
  - id: preserve-custom
    content: Move custom components (shimmer-button, spotlight-card, etc.) to src/components/custom/
    status: pending
  - id: setup-sync
    content: Create sync script (sync-shadcn.ts) to pull components from shadcn/ui repo
    status: pending
  - id: configure-shadcn
    content: Update components.json with correct shadcn/ui configuration
    status: pending
  - id: initial-sync
    content: Perform initial sync of shadcn/ui components to src/components/
    status: pending
  - id: preserve-theming
    content: Verify multi-dimensional theming system still works with synced components
    status: pending
  - id: update-exports
    content: Update src/index.ts to export synced + custom components
    status: pending
  - id: test-integration
    content: Run type checking, linting, and component tests
    status: pending
  - id: update-docs
    content: Update README.md and create SYNC_WORKFLOW.md documentation
    status: pending
  - id: ci-workflow
    content: Create GitHub Actions workflow for automated sync checks
    status: pending
  - id: adopt-vscode-settings
    content: Clone and adopt shadcn/ui VSCode settings.json and extensions.json
    status: pending
  - id: adopt-turbo-config
    content: Compare and merge shadcn/ui turbo.json optimizations
    status: pending
  - id: adopt-tsconfig
    content: Adopt shadcn/ui TypeScript configuration patterns
    status: pending
  - id: adopt-eslint-config
    content: Adopt shadcn/ui ESLint rules (preserve custom rules)
    status: pending
  - id: adopt-package-scripts
    content: Adopt shadcn/ui package.json scripts for component workflow
    status: pending
  - id: adopt-other-configs
    content: Review and adopt other configs (.editorconfig, .prettierrc, .npmrc, vitest configs)
    status: pending
  - id: adopt-github-workflows
    content: Clone and adapt shadcn/ui GitHub Actions workflows (release, CI, docs, registry sync)
    status: pending
  - id: adopt-testing-patterns
    content: Adopt shadcn/ui testing infrastructure (component tests, visual regression, test utilities)
    status: pending
  - id: adopt-docs-structure
    content: Adopt shadcn/ui documentation structure (component docs format, examples, API docs)
    status: pending
  - id: adopt-release-process
    content: Optimize changeset/release process based on shadcn/ui patterns (changelog, versioning)
    status: pending
  - id: adopt-code-generators
    content: Adopt shadcn/ui code generation patterns (turbo generators, templates, CLI integration)
    status: pending
  - id: adopt-registry-patterns
    content: Study and adopt shadcn/ui registry API structure and component metadata format
    status: pending
  - id: adopt-pre-commit-hooks
    content: Set up pre-commit hooks and lint-staged based on shadcn/ui patterns
    status: pending
  - id: adopt-build-tooling
    content: Optimize build scripts and tooling based on shadcn/ui patterns (bundle size, tree-shaking)
    status: pending
  - id: adopt-contributing-guidelines
    content: Create CONTRIBUTING.md and component contribution guidelines based on shadcn/ui
    status: pending
  - id: adopt-dependency-strategy
    content: Document and optimize dependency management strategy based on shadcn/ui patterns
    status: pending
---

# shadcn/ui SSOT Integration Plan

## Architecture Overview

Transform `@workspace/design-system` to use shadcn/ui as the base layer with auto-sync, preserving custom theming and components through a layered architecture.

```
┌─────────────────────────────────────────────┐
│  shadcn/ui (SSOT)                          │
│  - Auto-synced components                  │
│  - Git submodule or sync script            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  @workspace/design-system                   │
│  ├── src/                                   │
│  │   ├── components/ (synced from shadcn)  │
│  │   ├── custom/ (custom components)       │
│  │   ├── styles/ (multi-dim theming)       │
│  │   └── tokens/ (theme system)            │
│  └── scripts/                               │
│      └── sync-shadcn.ts (auto-sync)        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  @workspace/shared-ui                      │
│  (App-level blocks & templates)            │
└─────────────────────────────────────────────┘
```

## Phase 1: Archive Current Design System

### 1.1 Create Archive Structure

- Create `packages/design-system-archived/` directory
- Move current `packages/design-system/src/components/` to archive
- Preserve git history: `git mv packages/design-system packages/design-system-archived`
- Document archived components in `ARCHIVED_COMPONENTS.md`

### 1.2 Identify Custom Components to Preserve

Custom components to keep (not in shadcn/ui):

- `shimmer-button.tsx`
- `spotlight-card.tsx`
- `solaris-theme-switcher.tsx`
- `surface-noise.tsx`
- `texture-background.tsx`

Move these to `packages/design-system/src/components/custom/`

### 1.3 Preserve Theming System

Keep intact:

- `src/styles/themes/` (9 base themes)
- `src/styles/styles/` (5 style presets)
- `src/styles/accents/` (8 accent colors)
- `src/styles/fonts/` (4 font families)
- `src/styles/menu/` (menu variants)
- `src/tokens/` (theme configuration)

## Phase 2: Set Up shadcn/ui as SSOT

### 2.1 Initialize shadcn/ui Sync Mechanism

**Option A: Git Submodule (Recommended)**

```bash
cd packages/design-system
git submodule add https://github.com/shadcn-ui/ui.git .shadcn-source
```

**Option B: Sync Script (More Control)**

Create `packages/design-system/scripts/sync-shadcn.ts`:

- Clone/fetch shadcn/ui repo to `.shadcn-cache/`
- Copy components from `apps/v4/registry/new-york-v4/ui/` to `src/components/`
- Preserve custom components in `src/components/custom/`
- Update `src/index.ts` exports

### 2.2 Configure components.json

Update `packages/design-system/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york-v4",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "../../tailwind-config",
    "css": "src/styles/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@workspace/design-system/components",
    "utils": "@workspace/design-system/lib/utils",
    "ui": "@workspace/design-system/components"
  }
}
```

### 2.3 Create Sync Script

`packages/design-system/scripts/sync-shadcn.ts`:

- Fetch latest from shadcn/ui repo
- Compare component versions (use git tags/commits)
- Copy components preserving custom modifications
- Generate sync report
- Update component registry

## Phase 3: Auto-Sync Workflow

### 3.1 Sync Command

Add to `package.json`:

```json
{
  "scripts": {
    "sync:shadcn": "tsx scripts/sync-shadcn.ts",
    "sync:shadcn:check": "tsx scripts/sync-shadcn.ts --check",
    "sync:shadcn:all": "tsx scripts/sync-shadcn.ts --all --overwrite"
  }
}
```

### 3.2 Sync Strategy

1. **Check Mode**: Compare local vs upstream, show diff
2. **Selective Sync**: Sync specific components
3. **Full Sync**: Sync all components (with backup)
4. **Dry Run**: Preview changes without applying

### 3.3 Preserve Customizations

Create `packages/design-system/.shadcn-overrides/`:

- Store component-specific overrides
- Merge logic: shadcn base + overrides = final component
- Track which components have customizations

## Phase 4: Customization Layer (Magic UI Pattern)

### 4.1 Custom Components Directory

Structure:

```
packages/design-system/src/
├── components/          # Synced from shadcn/ui
├── custom/             # Custom components (shimmer-button, etc.)
├── overrides/          # Component customizations
│   ├── button.tsx     # Extended button with custom variants
│   └── card.tsx       # Extended card with spotlight effect
└── wrappers/           # Wrapper components (Magic UI pattern)
    └── magic-button.tsx
```

### 4.2 Override Pattern

Example: `src/components/overrides/button.tsx`

```tsx
// Re-export base shadcn button
export * from '../components/button';

// Add custom variants
export function Button({ ...props }) {
  // Merge shadcn base + custom variants
  return <BaseButton {...props} />;
}
```

### 4.3 Export Strategy

Update `src/index.ts`:

- Export shadcn components from `components/`
- Export custom components from `custom/`
- Export overrides (which wrap shadcn components)

## Phase 5: Integration & Testing

### 5.1 Migration Checklist

- [ ] Archive current components
- [ ] Set up sync mechanism
- [ ] Sync initial shadcn/ui components
- [ ] Preserve custom components
- [ ] Preserve theming system
- [ ] Update exports
- [ ] Update imports in apps
- [ ] Run type checking
- [ ] Run linting
- [ ] Test component rendering

### 5.2 Update Dependencies

- Ensure `@workspace/tailwind-config` still works
- Verify theme CSS variables compatibility
- Test multi-dimensional theming

### 5.3 Update Documentation

- Update `packages/design-system/README.md`
- Document sync workflow
- Document customization pattern
- Create migration guide

## Phase 6: CI/CD Integration

### 6.1 Automated Sync Check

GitHub Action: `.github/workflows/sync-shadcn-check.yml`

- Weekly check for shadcn/ui updates
- Create PR if updates available
- Run tests before merging

### 6.2 Sync Workflow

```yaml
name: Sync shadcn/ui
on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  workflow_dispatch:

jobs:
  sync:
    - Check for updates
    - Create backup branch
    - Run sync script
    - Run tests
    - Create PR if successful
```

## Phase 7: Adopt shadcn/ui Battle-Tested Configurations

### 7.1 VSCode Settings Comparison

**Current State:**

- Has Tailwind IntelliSense config (good)
- Has TypeScript workspace SDK
- Has ESLint integration
- Custom CSS validation

**shadcn/ui VSCode Settings to Adopt:**

- `.vscode/settings.json` - Optimized for monorepo + Tailwind + TypeScript
- `.vscode/extensions.json` - Recommended extensions for team consistency
- `.vscode/tasks.json` - Build/test tasks (if they have it)

**Reasoning:**

- shadcn/ui has optimized settings for their exact stack (Turborepo + pnpm + Tailwind v4)
- Their Tailwind IntelliSense config is battle-tested with their component patterns
- Team consistency: everyone uses same extensions and settings
- Reduces onboarding friction for new developers

### 7.2 Monorepo Configuration Comparison

**Current turbo.json:**

- Basic tasks (build, dev, lint, test)
- Custom tasks (validate:architecture, test:design-system-freeze)
- Good dependency management

**shadcn/ui turbo.json to Adopt:**

- More granular task definitions
- Better caching strategies
- Component-specific build tasks
- Registry sync tasks (if they have them)

**Reasoning:**

- shadcn/ui's turbo.json is optimized for component library monorepo
- Their caching strategy is proven for large component sets
- Better incremental builds = faster CI/CD
- Their task dependencies are battle-tested

### 7.3 TypeScript Configuration

**Current tsconfig.json:**

- Basic workspace paths
- Bundler module resolution
- Strict mode enabled

**shadcn/ui tsconfig.json to Adopt:**

- More comprehensive path mappings
- Better composite project setup (if they use it)
- Optimized for component library exports
- Better type checking for monorepo

**Reasoning:**

- shadcn/ui's TS config handles complex monorepo imports
- Their path mappings are optimized for component consumption
- Better IntelliSense across workspace boundaries
- Proven to work with their export structure

### 7.4 ESLint Configuration

**Current eslint.config.mjs:**

- TypeScript ESLint recommended
- Basic ignores
- Minimal rules

**shadcn/ui ESLint Config to Adopt:**

- More comprehensive rule set
- Component-specific linting rules
- Better monorepo-aware configuration
- Import ordering rules (if they have)

**Reasoning:**

- shadcn/ui enforces consistent code style across 100k+ stars
- Their rules prevent common component library mistakes
- Better import organization = cleaner codebase
- Team consistency at scale

### 7.5 Package.json Scripts

**Current package.json:**

- Good Turborepo scripts
- Custom validation scripts
- Database scripts

**shadcn/ui package.json Scripts to Adopt:**

- Component generation scripts
- Registry sync scripts
- Better dev workflow scripts
- Component testing scripts

**Reasoning:**

- shadcn/ui's scripts are optimized for component development workflow
- Their CLI integration scripts are proven
- Better developer experience
- Standardized workflows

### 7.6 Additional Config Files to Consider

**From shadcn/ui repo:**

1. `.editorconfig` - Consistent file formatting (if they have)
2. `.prettierrc` / `.prettierignore` - Code formatting (compare with ours)
3. `.npmrc` - Package manager config (pnpm settings)
4. `.gitignore` - Better ignores for monorepo
5. `vitest.config.ts` / `vitest.workspace.ts` - Test configuration
6. `tsconfig.base.json` - Base TypeScript config for monorepo
7. `.github/workflows/` - CI/CD workflows (if applicable)

**Reasoning:**

- These configs are battle-tested with millions of downloads
- Consistent formatting = easier code reviews
- Better test setup = more reliable components
- Proven CI/CD workflows = fewer deployment issues

## Implementation Files

### New Files to Create

1. `packages/design-system/scripts/sync-shadcn.ts` - Main sync script
2. `packages/design-system/.shadcn-overrides/` - Customization tracking
3. `packages/design-system-archived/` - Archived components
4. `.github/workflows/sync-shadcn-check.yml` - CI sync check
5. `packages/design-system/docs/SYNC_WORKFLOW.md` - Sync documentation
6. `.vscode/settings.json.shadcn` - Backup of current, then adopt shadcn version
7. `turbo.json.shadcn` - Compare and merge shadcn optimizations
8. `tsconfig.base.json` - Base config from shadcn (if they use it)

### Files to Modify

1. `packages/design-system/components.json` - Update shadcn config
2. `packages/design-system/package.json` - Add sync scripts + adopt shadcn scripts
3. `packages/design-system/src/index.ts` - Update exports
4. `packages/design-system/README.md` - Update documentation
5. `.vscode/settings.json` - Adopt shadcn optimizations (with comments for customizations)
6. `turbo.json` - Merge shadcn task optimizations
7. `tsconfig.json` - Adopt shadcn path mappings and settings
8. `eslint.config.mjs` - Adopt shadcn linting rules (preserve custom rules)

## Phase 8: Additional shadcn/ui Repository Patterns (NOT YET COVERED)

### 8.1 GitHub Actions Workflows

**What shadcn/ui Has:**

- Release workflow (`release.yml`) - Automated versioning and publishing
- CI workflow - Testing, linting, type checking
- Docs deployment workflow - Auto-deploy documentation
- Component sync workflow - Registry updates
- Dependency update workflows - Dependabot or Renovate integration

**What We're Missing:**

- Release automation workflow
- Component registry sync workflow
- Documentation deployment automation
- Automated dependency updates

**Reasoning:**

- shadcn/ui's release workflow handles versioning, changelog, and publishing automatically
- Their CI ensures quality before releases
- Automated docs keep documentation in sync with code
- Component registry workflows keep their registry up-to-date

### 8.2 Testing Infrastructure

**What shadcn/ui Has:**

- Component testing patterns (if they have tests)
- Visual regression testing setup
- E2E testing with Playwright (for docs/examples)
- Test utilities and helpers
- Coverage reporting

**What We're Missing:**

- Component-level test patterns
- Visual regression testing
- Test utilities specific to component library
- Coverage thresholds for components

**Reasoning:**

- Component libraries need specific testing patterns
- Visual regression catches styling regressions
- Test utilities reduce boilerplate
- Coverage ensures component quality

### 8.3 Documentation Structure

**What shadcn/ui Has:**

- Component documentation format
- Example code patterns
- API documentation generation
- Storybook or similar (if they use it)
- Interactive component playground

**What We're Missing:**

- Standardized component documentation format
- Example code generation
- API docs automation
- Component playground/visual docs

**Reasoning:**

- Good docs = easier adoption
- Examples show real usage patterns
- API docs help developers discover features
- Playground enables interactive exploration

### 8.4 Release & Versioning Process

**What shadcn/ui Has:**

- Changeset configuration (`.changeset/`)
- Semantic versioning strategy
- Changelog generation
- Release notes automation
- Version tagging strategy

**What We're Missing:**

- Changeset workflow (we have it but may not be optimized)
- Automated changelog generation
- Release notes automation
- Version strategy documentation

**Reasoning:**

- Changesets make versioning predictable
- Automated changelogs save time
- Release notes communicate changes clearly
- Version strategy prevents breaking changes

### 8.5 Code Generation & Templates

**What shadcn/ui Has:**

- Turbo generators for components
- Component template system
- CLI code generation patterns
- Scaffolding scripts

**What We're Missing:**

- Optimized component generators
- Template system for customizations
- CLI integration patterns
- Scaffolding for new components

**Reasoning:**

- Generators ensure consistency
- Templates speed up development
- CLI integration improves DX
- Scaffolding reduces setup time

### 8.6 Registry & API Structure

**What shadcn/ui Has:**

- Component registry API structure
- Metadata format for components
- Dependency tracking
- Version management in registry
- Component discovery API

**What We're Missing:**

- Registry API patterns
- Component metadata format
- Dependency resolution in registry
- Version tracking for components
- Discovery mechanisms

**Reasoning:**

- Registry enables component distribution
- Metadata powers CLI and docs
- Dependency tracking prevents conflicts
- Version management enables updates
- Discovery helps developers find components

### 8.7 Pre-commit Hooks & Quality Gates

**What shadcn/ui Has:**

- Husky or similar pre-commit setup
- Lint-staged configuration
- Type checking before commit
- Format checking
- Test running on commit (if applicable)

**What We're Missing:**

- Pre-commit hook configuration
- Lint-staged setup
- Quality gates before commit
- Automated formatting on commit

**Reasoning:**

- Pre-commit hooks catch issues early
- Lint-staged speeds up checks
- Quality gates prevent bad commits
- Auto-formatting keeps code consistent

### 8.8 Build & Tooling Scripts

**What shadcn/ui Has:**

- Build scripts optimized for components
- Bundle size optimization
- Tree-shaking configuration
- Export optimization
- Type declaration generation

**What We're Missing:**

- Component-specific build optimizations
- Bundle size tracking
- Tree-shaking verification
- Export optimization patterns
- Type declaration strategies

**Reasoning:**

- Optimized builds = smaller bundles
- Size tracking prevents bloat
- Tree-shaking reduces unused code
- Export optimization improves imports
- Type declarations improve DX

### 8.9 Contributing Guidelines

**What shadcn/ui Has:**

- CONTRIBUTING.md with clear guidelines
- Component contribution patterns
- Code style guidelines
- PR template structure
- Review process documentation

**What We're Missing:**

- Component contribution guidelines
- Code style documentation
- PR templates for components
- Review checklist

**Reasoning:**

- Guidelines help contributors
- Patterns ensure consistency
- Templates speed up PRs
- Checklists ensure quality

### 8.10 Dependency Management

**What shadcn/ui Has:**

- Dependency update strategy
- Peer dependency patterns
- Version pinning strategy
- Dependency audit process
- Security update workflow

**What We're Missing:**

- Dependency update automation
- Peer dependency documentation
- Version strategy documentation
- Security audit workflow

**Reasoning:**

- Updates keep dependencies current
- Peer deps prevent conflicts
- Version strategy prevents breakage
- Security audits prevent vulnerabilities

## Risk Mitigation

1. **Backup Strategy**: Always create git branch before sync
2. **Incremental Sync**: Sync one component at a time initially
3. **Testing**: Run full test suite after each sync
4. **Rollback Plan**: Keep archived components for rollback
5. **Customization Tracking**: Document all customizations

## Success Criteria

- [ ] All shadcn/ui components synced and working
- [ ] Custom components preserved and functional
- [ ] Theming system intact (8,640 combinations)
- [ ] Auto-sync mechanism working
- [ ] All apps using updated components
- [ ] No breaking changes
- [ ] Documentation complete
