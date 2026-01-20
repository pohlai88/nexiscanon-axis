## Design System Change (Frozen Package)

> ⚠️ **This package is FROZEN as of 2026-01-20.**
> Only bug fixes, security fixes, and performance fixes are allowed.

### Freeze Justification (Required)

**Change Category** (check one):
- [ ] 🐛 Bug fix (runtime, variants, broken exports)
- [ ] 🔒 Security fix
- [ ] ⚡ Performance fix
- [ ] 📝 Documentation update only

**Why this change is allowed under freeze policy:**
<!-- Explain why this is a fix, not a feature or redesign -->

**What would break without this fix:**
<!-- Describe the broken behavior this fixes -->

---

### Proof Outputs (Required)

**TypeScript Check:**
```
pnpm --filter @workspace/design-system check-types
```
<!-- Paste output below -->
```

```

**Lint Check:**
```
pnpm --filter @workspace/design-system lint
```
<!-- Paste output below -->
```

```

**Architecture Validation:**
```
pnpm validate:architecture
```
<!-- Paste output below -->
```

```

---

### Checklist

- [ ] This is NOT a token rename
- [ ] This is NOT a theme variable meaning change
- [ ] This is NOT a new styling system or architecture pattern
- [ ] This does NOT allow apps to import DS internals
- [ ] This does NOT add "blocks" (blocks belong in apps)
- [ ] All three proof outputs above show PASS (exit code 0)

---

### Summary

<!-- Brief description of the fix -->

### Test Plan

<!-- How was this fix verified? -->
