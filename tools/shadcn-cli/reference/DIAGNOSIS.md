# Design System Diagnosis Report

**Date:** 2026-01-23  
**Package:** `@workspace/design-system`  
**Status:** ⚠️ **Multiple TypeScript Errors Detected**

---

## Executive Summary

The design system has **95+ TypeScript errors** across multiple categories. The system is functional but requires fixes for type safety and build compliance.

### Error Categories

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Missing imports (Next.js) | 7 | High | 🔴 Blocking |
| Missing imports (react-router-dom) | 1 | Medium | 🟡 Non-blocking |
| Type safety (undefined checks) | 60+ | High | 🔴 Blocking |
| Missing component imports | 5 | Medium | 🟡 Non-blocking |
| Export conflicts | 7 | High | 🔴 Blocking |
| Type mismatches | 15+ | Medium | 🟡 Non-blocking |

---

## Critical Issues

### 1. Next.js Peer Dependency Imports (7 files)

**Problem:** Files import `next/link` and `next/navigation` but Next.js is only a peer dependency. Type stubs exist but may not be sufficient.

**Affected Files:**
- `src/blocks/header-01.tsx`
- `src/blocks/hero-01.tsx`
- `src/blocks/navbar-01.tsx`
- `src/blocks/sidebar-01.tsx`
- `src/blocks/footer-01.tsx`
- `src/templates/auth/login-page-01.tsx`
- `src/templates/auth/signup-page-01.tsx`

**Solution:**
- Type stubs exist in `src/types/next-stubs.d.ts` ✅
- Verify stubs are comprehensive
- Consider making Next.js imports conditional or using a router abstraction

---

### 2. React Router DOM Import (1 file)

**Problem:** `src/blocks/examples/command-k-integration.tsx` imports `react-router-dom` which is not installed.

**Solution:**
- Add type stub similar to Next.js stubs
- OR remove the import if not needed
- OR add `react-router-dom` to peerDependencies

---

### 3. Type Safety: Undefined Checks (60+ errors)

**Problem:** TypeScript strict null checks flagging potentially undefined values.

**Common Patterns:**
- Array access without bounds checking
- Optional chaining needed
- State initialization issues

**Affected Files:**
- `src/blocks/excel-mode-grid.tsx` (15+ errors)
- `src/blocks/multi-step-wizard.tsx` (10+ errors)
- `src/blocks/smart-queue-workbench.tsx` (8+ errors)
- `src/blocks/activity-feed.tsx` (2 errors)
- `src/blocks/magic-approval-table.tsx` (1 error)
- `src/blocks/timeline-playback.tsx` (2 errors)
- `src/blocks/exception-first-mode.tsx` (1 error)
- `src/blocks/interactive-metric-card.tsx` (1 error)
- `src/blocks/global-admin-page.tsx` (1 error)
- `src/blocks/comparison-cockpit.tsx` (1 error)
- `src/blocks/inline-chat.tsx` (1 error)
- `src/blocks/magic-paste.tsx` (1 error)
- `src/blocks/collaborative-canvas.tsx` (1 error)
- `scripts/analyze-overrides.ts` (7 errors)

**Solution:**
- Add null/undefined guards
- Use optional chaining (`?.`)
- Provide default values
- Use non-null assertions (`!`) only when safe

---

### 4. Missing Component Imports (5 errors)

**Problem:** Components referenced but not imported.

**Issues:**
1. **Badge component** - `src/blocks/examples/magic-approval-table-examples.tsx` imports from wrong path:
   ```tsx
   // ❌ Wrong
   import { Badge } from '@workspace/design-system/components/badge';
   
   // ✅ Correct
   import { Badge } from '@workspace/design-system';
   ```

2. **Missing icons** - `X` and `Edit` from lucide-react not imported:
   - `src/blocks/collaborative-canvas.tsx` (line 600) - missing `X`
   - `src/blocks/team-room.tsx` (line 624, 899) - missing `X` and `Edit`

**Solution:**
- Fix import paths
- Add missing icon imports from `lucide-react`

---

### 5. Export Conflicts (7 errors)

**Problem:** `src/blocks/magic-approval-table.tsx` has duplicate type exports at end of file.

**Conflicting Exports:**
- `MagicApprovalTableProps`
- `MagicApprovalColumn`
- `MagicApprovalItem`
- `Attachment`
- `Comment`
- `ApprovalStatus`
- `ApprovalPriority`

**Solution:**
- Remove duplicate exports at end of file (lines 968-974)
- Types are already exported at top of file (lines 63-121)

---

### 6. Type Mismatches (15+ errors)

**Problem:** Various type assignment issues.

**Examples:**
- `src/blocks/comparison-cockpit.tsx` (line 480): `string | false | undefined` not assignable to `string | undefined`
- `src/blocks/marquee.tsx` (line 115): Invalid `jsx` property on style element
- `src/blocks/exception-first-mode.tsx` (line 562): `indeterminate` prop not on Checkbox
- `src/templates/dashboard/dashboard-02.tsx`: Missing `id` property in column definitions
- `src/blocks/index.ts` (line 227): `DEFAULT_CATEGORIES` not exported from template-system

**Solution:**
- Fix type definitions
- Add missing properties
- Correct prop types

---

## Script Issues

### `scripts/analyze-overrides.ts` (7 errors)

**Problems:**
- Object possibly undefined (line 66, 116)
- String | undefined not assignable to string (line 99)
- Type undefined cannot be used as index (line 117, 119)
- VariantBlock possibly undefined (line 113)

**Solution:**
- Add null checks
- Provide default values
- Use optional chaining

---

## Recommendations

### Priority 1 (Critical - Blocking Build)
1. ✅ Fix export conflicts in `magic-approval-table.tsx`
2. ✅ Fix missing icon imports (`X`, `Edit`)
3. ✅ Fix Badge import path in examples
4. ✅ Add undefined guards in critical blocks (excel-mode-grid, multi-step-wizard)

### Priority 2 (High - Type Safety)
1. ✅ Fix undefined checks in all blocks
2. ✅ Fix type mismatches
3. ✅ Fix script errors

### Priority 3 (Medium - Code Quality)
1. ✅ Verify Next.js type stubs are sufficient
2. ✅ Add react-router-dom type stub
3. ✅ Review and fix remaining type mismatches

---

## Files Requiring Immediate Attention

### High Priority
1. `src/blocks/magic-approval-table.tsx` - Export conflicts
2. `src/blocks/excel-mode-grid.tsx` - 15+ undefined errors
3. `src/blocks/multi-step-wizard.tsx` - 10+ undefined errors
4. `src/blocks/examples/magic-approval-table-examples.tsx` - Wrong import path

### Medium Priority
5. `src/blocks/smart-queue-workbench.tsx` - 8 undefined errors
6. `src/blocks/collaborative-canvas.tsx` - Missing `X` import
7. `src/blocks/team-room.tsx` - Missing `X` and `Edit` imports
8. `scripts/analyze-overrides.ts` - 7 script errors

---

## Verification Commands

```bash
# Check TypeScript errors
cd packages/design-system
pnpm check-types

# Check linting
pnpm lint

# Build (if configured)
pnpm build
```

---

## Next Steps

1. **Create todo list** for fixing errors systematically
2. **Start with Priority 1** issues (export conflicts, missing imports)
3. **Fix undefined checks** in batches (by file)
4. **Verify** after each batch with `pnpm check-types`
5. **Update** this diagnosis as issues are resolved

---

**Status:** 🔴 **Needs Immediate Attention**  
**Estimated Fix Time:** 4-6 hours for all issues  
**Risk Level:** Medium (errors don't prevent runtime, but block type checking)
