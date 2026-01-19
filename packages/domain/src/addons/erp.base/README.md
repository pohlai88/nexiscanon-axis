// packages/domain/src/addons/erp.base/README.md
# erp.base Domain Services

## Transaction Capability (Neon HTTP Driver)

**CRITICAL:** The Neon HTTP driver has **limited transaction support**.

### What Works
- Single-statement atomic operations (`UPDATE...RETURNING`)
- `.transaction()` API exists but may not provide full ACID guarantees

### What Doesn't Work Reliably
- `SELECT...FOR UPDATE` row locking
- Multi-statement transactions with durability guarantees
- Long-lived transaction scopes

### Implications for Services

#### SequenceService
✅ **Uses atomic UPDATE...RETURNING** - No reliance on locks or multi-statement tx

#### Audit Strategy
⚠️ **Current limitation:** `db.transaction()` is used but may not guarantee audit durability on Neon HTTP

**Mitigation options (choose one):**

1. **Accept eventual consistency** - Audit events may be lost on rollback (NOT recommended for compliance)

2. **CTE-based atomic write** - Write entity + audit in single SQL via CTE:
   ```sql
   WITH inserted AS (
     INSERT INTO erp_partners (...) RETURNING *
   )
   INSERT INTO erp_audit_events (...)
   SELECT ... FROM inserted;
   ```

3. **Outbox pattern** - Write entity + outbox entry atomically, async forward to audit

4. **Upgrade to Neon Pooled (WebSocket)** - Full transaction support

### Current Implementation Status

- ✅ SequenceService: Atomic (no transaction required)
- ⚠️ Other services: Use `.transaction()` with known limitation
- 📋 TODO: Implement CTE-based audit or upgrade driver

### Recommendation

For **production ERP compliance**, either:
1. Implement CTE-based audit writes (complex but correct)
2. Migrate to Neon Pooled driver (simplest path to full ACID)
