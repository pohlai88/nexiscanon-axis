# Development Tools & CLI Utilities

This directory contains internal development tools, CLI utilities, migration scripts, and upgrade tooling used during the development lifecycle of NexusCanon-AXIS. **These are NOT production packages** and are not published to npm.

## Directory Structure

```
tools/
├── eslint-v9/          # ESLint v9 migration guides & configs
├── framework-template/ # Project scaffolding templates
├── next-16/            # Next.js 16 upgrade documentation
├── shadcn-cli/         # shadcn/ui CLI registry and components
├── tailwind-v4/        # Tailwind CSS v4 upgrade tooling
├── turbo-v2/           # Turborepo v2 migration guides
└── typescript-v5/      # TypeScript 5 + React 19 upgrade docs
```

---

## Tools Overview

### 🎨 **shadcn-cli/**
**Purpose:** Official shadcn/ui CLI component registry

**Contents:**
- shadcn component library source
- CLI tooling for component installation
- Component documentation and examples

**Usage:**
```bash
# Install components from registry
npx shadcn@latest add button

# Browse components
cd tools/shadcn-cli
```

**Note:** Used by `packages/design-system` for component sourcing. Do not modify directly unless contributing upstream.

---

### 🎨 **tailwind-v4/**
**Purpose:** Tailwind CSS v4 migration and upgrade tooling

**Contents:**
- Tailwind v4 registry examples
- Migration scripts and codemods
- v3 → v4 compatibility layers
- CSS variable mappings

**Status:** Migration complete. Kept for reference and future upgrades.

---

### 📦 **eslint-v9/**
**Purpose:** ESLint v9 migration documentation

**Contents:**
- Migration guides
- Breaking changes documentation
- Config examples (flat config format)

**Status:** Completed. Reference for maintaining ESLint configurations.

---

### 🏗️ **framework-template/**
**Purpose:** Project scaffolding and boilerplate templates

**Contents:**
- Starter templates (Next.js, Vite, etc.)
- Pre-configured project structures
- Common configuration files

**Usage:**
```bash
# Use template to bootstrap new app
cp -r tools/framework-template/start-app apps/new-app
```

---

### 🚀 **next-16/**
**Purpose:** Next.js 16 upgrade tracking

**Contents:**
- `COMPLETE.md` - Migration completion checklist
- Breaking changes documentation
- Upgrade notes

**Status:** ✅ Migration complete. Kept for reference.

---

### ⚡ **turbo-v2/**
**Purpose:** Turborepo v2 upgrade and optimization

**Contents:**
- `DEFERRED.md` - Deferred migration notes
- `VALIDATION.md` - Validation checklist
- Performance benchmarks

**Status:** ⏸️ Deferred. Using Turbo v1 (stable).

---

### 📘 **typescript-v5/**
**Purpose:** TypeScript 5 + React 19 migration

**Contents:**
- `IMPLEMENTATION-COMPLETE.md` - Migration summary
- `MIGRATION-PLAN.md` - Original migration strategy
- `QUICK-REFERENCE.md` - Common patterns
- `TYPESCRIPT-CLI-REFERENCE.md` - CLI commands
- `VERBATIM-MODULE-SYNTAX.md` - Module syntax changes
- `VALIDATION.md` - Type-checking validation

**Status:** ✅ Migration complete.

---

## Tool Categories

### 🔧 Active Development Tools
Tools actively used during development:
- `shadcn-cli/` - Component registry
- `framework-template/` - Scaffolding

### 📚 Migration References
Completed migrations kept for reference:
- `eslint-v9/`
- `next-16/`
- `tailwind-v4/`
- `typescript-v5/`

### ⏸️ Deferred/Future
Tools for future consideration:
- `turbo-v2/`

---

## Guidelines

### When to Add a Tool

Add to `tools/` when:
- ✅ It's a **development-time** utility (not runtime)
- ✅ It's **not published** to npm
- ✅ It's a **CLI, migration script, or documentation**
- ✅ It's **temporary** (upgrade/migration) or **reference material**

### When NOT to Add a Tool

Do NOT add to `tools/` if:
- ❌ It's a **production package** (use `packages/` instead)
- ❌ It's **shipped to end-users**
- ❌ It has **runtime dependencies** in apps
- ❌ It's a **shared library** (use `packages/` instead)

---

## Usage Patterns

### Referencing Tools in Documentation

```markdown
See [Next.js 16 Migration](../tools/next-16/COMPLETE.md) for upgrade details.
```

### Using CLI Tools

```bash
# From repo root
cd tools/shadcn-cli
pnpm install
pnpm run build
```

### Ignoring from IDE Indexing

Add to `.cursorignore` or `.gitignore`:
```
tools/shadcn-cli
tools/tailwind-v4
```

---

## Maintenance

### Cleanup Policy

**Keep:**
- Tools actively used in development
- Migration docs for recent major upgrades (< 1 year)
- CLI utilities with ongoing usage

**Archive/Remove:**
- Migration docs older than 2 years
- Obsolete tooling replaced by official solutions
- Unused templates superseded by newer patterns

### Review Schedule

- **Quarterly:** Review active tools for relevance
- **Yearly:** Archive/remove outdated migration docs
- **As needed:** Update CLI tools when upstream changes occur

---

## Contributing

When adding a new tool:

1. **Create directory** with clear, kebab-case name
2. **Add README.md** explaining purpose, usage, status
3. **Update this index** with tool description
4. **Add to `.cursorignore`** if large or noisy
5. **Document in migration docs** if upgrade-related

---

## Related Documentation

- [Main README](../README.md) - Repository overview
- [Contributing Guide](../CONTRIBUTING.md) - Development workflow
- [Architecture Docs](../docs/explanation/architecture.md) - System design
- [Package Structure](../packages/README.md) - Production packages

---

## Questions?

- **Production packages?** → See `packages/`
- **App-specific code?** → See `apps/`
- **General documentation?** → See `docs/`
- **Build/deployment?** → See `.github/workflows/`

---

**Last Updated:** 2026-01-23
**Maintained By:** NexusCanon-AXIS Team
