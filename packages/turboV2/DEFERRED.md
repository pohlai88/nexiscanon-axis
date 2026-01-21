# Deferred Tasks - Turbo 2.0 Migration

> Tasks to complete after core migration

---

## 🔴 HIGH PRIORITY

### Task 1: Verify Package-Specific Turbo Configs
**Package:** `packages/design-system/*`  
**Reason:** Some packages might have their own turbo.json  
**Estimated Effort:** 15 minutes

**Steps:**
1. Search for package-level `turbo.json` files
2. Update any found from `pipeline` → `tasks`
3. Add `persistent: true` where appropriate

**Search Command:**
```bash
Get-ChildItem -Path packages -Recurse -Filter turbo.json
```

---

## 🟡 MEDIUM PRIORITY

### Task 2: Optimize Cache Configuration
**Reason:** Turbo 2.0 has improved caching  
**Estimated Effort:** 30 minutes

**Potential Optimizations:**
- Review `outputs` patterns
- Check `inputs` configuration
- Optimize cache keys
- Consider remote caching

**Documentation:**
- [Turbo Caching](https://turbo.build/repo/docs/core-concepts/caching)

---

### Task 3: Explore New Turbo 2.0 Features
**Features to Consider:**
- Persistent tasks for watch modes
- Improved task dependencies
- Better error handling
- Enhanced logging

**Estimated Effort:** 1 hour exploration

---

## 🟢 LOW PRIORITY

### Task 4: Update CI/CD Pipeline
**Reason:** May need Turbo 2.0 specific optimizations  
**Estimated Effort:** 30 minutes

**Check:**
- GitHub Actions workflow
- Turbo cache configuration
- Remote cache setup (if applicable)

---

### Task 5: Team Training
**Reason:** New schema and features  
**Estimated Effort:** 30 minutes

**Topics:**
- `pipeline` → `tasks` change
- Persistent tasks concept
- New error messages
- Performance improvements

---

## ⏸️ WAITING FOR UPSTREAM

### Task 6: eslint-config-turbo Updates
**Plugin:** `eslint-config-turbo`  
**Current:** `^1.9.9`  
**Target:** `^2.7.5`  
**Status:** Update with Turbo itself

**Monitor:**
- Compatibility with ESLint v9
- Flat config support
- Breaking changes

---

## 📅 Review Schedule

**Q1 2026** (Jan-Mar)
- [ ] Complete HIGH priority tasks
- [ ] Test Turbo 2.0 performance
- [ ] Review cache efficiency

**Q2 2026** (Apr-Jun)
- [ ] Complete MEDIUM priority tasks
- [ ] Explore remote caching
- [ ] Optimize configurations

---

## ✅ Completion Criteria

For each task:
- [ ] Change implemented
- [ ] Tested with `turbo run`
- [ ] No performance regression
- [ ] Documentation updated
- [ ] Team notified

---

**Last Updated:** 2026-01-21  
**Next Review:** 2026-04-21
