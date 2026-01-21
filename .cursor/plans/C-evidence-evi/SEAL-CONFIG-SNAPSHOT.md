# Backend Configuration Snapshot (Non-Secret)

Purpose: prevent configuration blackholes during post-seal changes.

---

## Runtime

- Node.js: v22.x
- Package Manager: pnpm
- OS: Windows (primary dev)

---

## Auth

- Provider: Neon Auth
- Algorithm: EdDSA (Ed25519)
- JWKS Endpoint: <configured>
- Verification Library: jose
- Dev headers: DISABLED in production mode

---

## Observability

- Logger: Pino
- Tracing: OpenTelemetry → Tempo
- Error Tracking: GlitchTip (Sentry-compatible)
- Correlation Key: traceId

---

## Storage

- Database: PostgreSQL (Neon)
- Object Storage: R2-compatible
- Evidence conversion: Worker-based (Office → PDF)

---

## Known Tooling Landmines

- NODE_OPTIONS must NOT include `--loader tsx`
- Use `tsx` CLI directly
- Global Node hooks can break EVI scripts

---

## Notes

This snapshot is informational only.
Secrets and values are intentionally omitted.

---

**Snapshot Date:** 2026-01-20  
**Purpose:** Anti-blackhole reference for future configuration changes
