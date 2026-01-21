# Backend Seal — 2026-01-20

## Status

SEALED (NOT FROZEN)

This seal indicates the backend is stable, governed, and observable,
but remains intentionally adjustable. No freeze is declared.

---

## Sealed Capabilities

### Kernel & Governance

- Canonical response envelope with `meta.traceId`
- Kernel-wrapped routes only
- Leak-safe tenant isolation (404 indistinguishable)
- Structured error normalization

### Evidence Pipeline

- Upload → convert → view → attach
- Evidence TTL enforcement
- Approval locks on missing/stale evidence

### Audit Trail

- Template lifecycle audited
- Request creation audited
- Approval attempts, blocks, and success audited
- Audit rows correlated via `traceId`

### Observability

- Logs ↔ traces ↔ errors stitched via `traceId`
- Env-gated exporters (Tempo, GlitchTip)
- Kernel-level error capture

### Reporting (Contracts Only)

- Report generation contracts (receipt-based)
- Artifact descriptors (no renderer)
- Audit event: `report.generate.requested`

---

## Sealed Evidence References

- EVI003 — Observability Stitch
- EVI005 — Auth Integration
- EVI006-EVI010 — Evidence Pipeline
- EVI011-EVI012 — Approval Audit
- EVI013-EVI016 — Template System
- EVI018 — Request Creation Audit
- EVI020 — Reporting Contracts (V0)

---

## Explicit Non-Freeze Notes

The following may change without violating the seal:

- Environment configuration (JWKS endpoints, exporters, credentials)
- Reporting renderers (Phase-2)
- Error code expansion or normalization
- Additional audit events
- Performance optimizations

Any breaking contract change must:

1. Be versioned OR explicitly documented
2. Update the relevant EVI evidence doc
3. Note the delta in a follow-up seal or revision

---

## Intent

This seal prevents silent regressions while allowing deliberate evolution.

---

**Sealed:** 2026-01-20  
**Commits:** a95773b4, 5b9ff474  
**Evidence Count:** 14 EVIs certified
