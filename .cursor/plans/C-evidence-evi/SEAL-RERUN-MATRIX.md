# Backend Re-Run Matrix

Use this table to avoid invisible regressions after changes.

---

## Configuration Changes

| Change Type | Must Re-Run |
|------------|-------------|
| JWKS / Auth config | EVI005, EVI003 |
| Env var changes (OTEL, SENTRY) | EVI003 |
| Tenant logic / RLS | EVI002 |
| Evidence TTL rules | EVI010 |
| Audit wiring changes | EVI011, EVI012, EVI018 |
| Reporting contracts | EVI020 |

---

## Code Changes

| Area Modified | Must Re-Run |
|--------------|-------------|
| Kernel wrapper | EVI001, EVI003 |
| Domain services | Relevant EVI + audit checks |
| Evidence pipeline | EVI006–EVI010 |
| Approval logic | EVI010–EVI012 |
| New routes | Add new EVI or extend existing |

---

## Renderer / Phase-2 Work
- Reporting renderer does NOT affect EVI020
- Renderer failures must emit observable errors (traceId required)

---

## Rule
If unsure, rerun EVI003.
Observability is the early-warning system.

---

**Created:** 2026-01-20  
**Purpose:** Change impact analysis guide
