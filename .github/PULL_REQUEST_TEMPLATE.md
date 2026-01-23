## Summary

<!-- Brief description of what this PR does (1-3 sentences) -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] Documentation (changes to docs only)
- [ ] Chore (build, CI, dependencies, etc.)

## Related Issues

<!-- Link to related issues: Fixes #123, Closes #456 -->

---

## Quality Checklist

### Code Quality

- [ ] TypeScript types are correct (no `any` unless justified)
- [ ] No console.log statements (use `logger` instead)
- [ ] Error handling is appropriate
- [ ] Code follows existing patterns in the codebase

### Testing

- [ ] I have tested this locally
- [ ] New/changed functionality has appropriate tests
- [ ] All existing tests still pass

### Security

- [ ] No secrets or credentials in code
- [ ] Input validation is in place
- [ ] SQL queries use parameterized values (no string concatenation)

### Multi-tenancy

- [ ] Queries include `tenant_id` where appropriate
- [ ] Tenant membership is checked for protected routes
- [ ] Audit logging is added for significant actions

### Documentation

- [ ] README updated (if needed)
- [ ] Code comments added for complex logic
- [ ] API changes documented

---

## Verification

### Build

```bash
pnpm build --filter @axis/web
```

### Type Check

```bash
pnpm tsc --noEmit
```

### Lint

```bash
pnpm lint
```

---

## Screenshots

<!-- If applicable, add screenshots to help explain your changes -->

## Additional Notes

<!-- Any additional context, edge cases, or notes for reviewers -->
