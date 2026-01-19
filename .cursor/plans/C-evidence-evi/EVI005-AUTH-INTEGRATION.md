# EVI005 — Auth Integration Phase 1 (Neon Auth, Kernel-Owned)

**Status:** ✅ IMPLEMENTED / ⏳ EVIDENCE DEFERRED  
**Goal:** Replace dev-only auth with real Neon Auth JWT validation  
**Date Started:** 2026-01-20  
**Date Implemented:** 2026-01-20  

**Implementation:** ✅ Complete (Neon JWKS verification + `whoami` endpoint + `auth: required` ready)  
**Evidence:** ⏳ Deferred (requires interactive Neon Auth session to obtain JWT)

**Deferral Reason:** JWT requires browser-based authentication flow first (authClient.signIn), then authClient.token() to extract JWT. No "test token generator" in console. Evidence will be captured when auth UI is deployed or when manually testing in browser.

---

## Goal

Replace dev-only auth with **real Neon Auth JWT validation** so routes can run `auth: { mode: "required" }` **without** `Authorization: Bearer dev` / `X-Actor-ID`.

## Non-goals

* No RBAC/permissions matrix yet
* No refresh token complexity beyond what Neon Auth provides
* No UI polish; just "real auth works end-to-end"
* No tenant membership enforcement beyond "actor is authenticated" (tenant enforcement can stay header-based for now)

---

## Canon constraints

* **Routes remain spec-only**; they do not parse/verify JWTs.
* **Kernel owns auth extraction** (`actorId`, optional claims).
* **No direct DB import in routes**.
* Everything is evidence-backed; no "complete" claims without outputs.

---

## Phase 1 Implementation Checklist

### 1) `@workspace/auth` provider adapter (Neon Auth)

**Deliverable:** a thin module that gives the kernel everything it needs, nothing more.

* [x] `packages/auth/src/neon/config.ts` ✅
  * reads env: `NEON_AUTH_BASE_URL`, `JWKS_URL`
* [x] `packages/auth/src/neon/jwks.ts` ✅
  * fetch + cache JWKS (in-memory cache with 1-hour TTL)
* [x] `packages/auth/src/neon/verify.ts` ✅
  * verify JWT signature against JWKS using `jose` library
  * validate standard claims: `exp` (expiration)
  * return minimal "principal" shape

**Principal shape (canon-minimal):**

```ts
type AuthPrincipal = {
  actorId: string;          // stable subject/user id (from JWT sub claim)
  email?: string;
  claims: Record<string, unknown>; // keep raw claims if needed later
};
```

### 2) Kernel auth mode: `required`

**Deliverable:** kernel can run with `auth: { mode: "required" }` and produces `ctx.actorId` from real JWT.

* [x] `packages/api-kernel/src/auth.ts` ✅
  * `mode: "required"` path:
    * read token from `Authorization: Bearer <jwt>` (Phase 1)
    * verify via `@workspace/auth` (Neon adapter using jose)
    * set `ctx.actorId = principal.actorId`
  * `mode: "dev"` stays for local fallback but EVI005 proves required mode
  * Dev fallback: accepts `Authorization: Bearer dev` + `X-Actor-ID` header when JWKS_URL not set

**Failure mapping (Phase 1):**

* Missing token → `401 UNAUTHORIZED`
* Invalid/expired token → `401 UNAUTHORIZED`
* Verified but no subject → `401 UNAUTHORIZED`

### 3) Auth routes (minimal)

**Deliverable:** a way to obtain a real JWT to call protected APIs.

Phase 1 implements **Option A** (minimal instructions):

* [x] `apps/web/app/api/auth/login/route.ts` ✅ (Phase 1: returns Neon Auth URL + instructions)
* [x] `apps/web/app/api/auth/whoami/route.ts` ✅ (test endpoint to verify JWT extraction)
* [ ] `apps/web/app/api/auth/signup/route.ts` (optional - existing stub)
* [ ] `apps/web/app/api/auth/logout/route.ts` (optional - existing stub)

**Phase 1 Note:** Login endpoint provides instructions for obtaining JWT from Neon Auth. Phase 2 will implement direct Neon Auth API calls.

### 4) Upgrade one real route to required auth

**Deliverable:** at least one domain route enforces real auth and uses `ctx.actorId`.

* [x] `apps/web/app/api/requests/route.ts` ✅ (already using `auth: { mode: "required" }`)
* [x] Confirms create request uses `ctx.actorId` (no manual headers) ✅

---

## ✅ Implementation Summary

**What was built:**

1. **@workspace/auth Neon adapter** (4 files):
   - `config.ts` - Environment config reader
   - `jwks.ts` - JWKS fetch with 1-hour cache
   - `verify.ts` - JWT verification using `jose` library
   - `index.ts` - Clean exports

2. **Kernel JWT verification**:
   - Updated `extractAuth()` to verify JWT via JWKS
   - Graceful fallback to dev mode when JWKS_URL not set
   - Proper error handling (401 on invalid/expired tokens)

3. **Test endpoints**:
   - `GET /api/auth/whoami` - Test JWT extraction (optional auth)
   - `POST /api/auth/login` - Phase 1 instructions endpoint

4. **Production route**:
   - `POST /api/requests` already using `auth: { mode: "required" }`
   - Uses `ctx.actorId` from JWT (no manual headers)

**Dependencies installed:**
- `jose@5.10.0` in `@workspace/auth` for JWT verification

**Quality gates:**
- ✅ TypeScript compilation: `pnpm -w typecheck:core` passed
- ✅ API kernel compliance: `pnpm -w check:api-kernel` passed (11 routes checked)
- ✅ Allowlist updated to include `@workspace/jobs`

---

## 📋 Evidence Capture Runbook (REQUIRED TO CLOSE EVI005)

**Prerequisites:**
1. Obtain JWT from Neon Auth (see instructions below)
2. Have a tenant ID ready (can query from DB or use existing)
3. Dev server running with JWKS_URL set

### How to Obtain JWT from Neon Auth

Based on [Neon Auth JWT documentation](https://neon.tech/docs/guides/neon-auth-jwt):

**Method 1: Via Neon SDK (after sign-in)**
```typescript
import { authClient } from './auth';

// After user signs in via browser
const { data, error } = await authClient.token();
if (!error) {
  console.log('JWT:', data.token);
}
```

**Method 2: From session headers**
```typescript
await authClient.getSession({
  fetchOptions: {
    onSuccess: (ctx) => {
      const jwt = ctx.response.headers.get('set-auth-jwt');
      console.log('JWT:', jwt);
    },
  },
});
```

**Practical Steps for Evidence Capture:**

1. **Create a test user** (if not already done):
   - Sign up via your app's UI (if auth UI is deployed)
   - OR use Neon Console Auth tab to create test user

2. **Sign in and get JWT**:
   - Sign in via your app
   - Use browser DevTools → Console:
     ```javascript
     authClient.token().then(r => console.log(r.data.token))
     ```
   - Copy the JWT (starts with `eyJ...`)

3. **JWT expires in 15 minutes** - capture evidence quickly!

**NOT VALID for EVI005:**
```bash
# Dev mode fallback does NOT prove JWT verification
Authorization: Bearer dev
X-Actor-ID: <uuid>
# ❌ This bypasses JWKS verification
```

### Evidence Capture Commands

Once you have a JWT token, capture these 4 items:

### [A] Startup (no crash)

```powershell
# Set environment
$env:DATABASE_URL = "<from env.localCopy>"
$env:JWKS_URL = "https://.../.well-known/jwks.json"
$env:NEON_AUTH_BASE_URL = "https://...neonauth.../auth"

# Start server
pnpm --filter web dev:webpack
```

**Capture:** Startup logs showing server starts without JWKS errors

---

### [B] WhoAmI proves JWT verification works

```powershell
curl.exe -s "http://localhost:3000/api/auth/whoami" `
  -H "Authorization: Bearer <YOUR_JWT>"
```

**Expected:**
```json
{
  "data": {
    "authenticated": true,
    "actorId": "<uuid-from-jwt-sub>",
    "roles": [],
    "email": "user@example.com"
  },
  "meta": {
    "traceId": "..."
  }
}
```

**Capture:** Full JSON response showing actorId extracted from JWT

---

### [C] Missing token rejects (401)

```powershell
curl.exe -i -X POST "http://localhost:3000/api/requests" `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: <tenant-id>" `
  -d "{}"
```

**Expected:**
```
HTTP/1.1 401 Unauthorized

{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required",
    "traceId": "..."
  }
}
```

**Capture:** HTTP status line + JSON body

---

### [D] Valid token succeeds (200) + requesterId matches JWT sub

```powershell
curl.exe -s -X POST "http://localhost:3000/api/requests" `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: <tenant-id>" `
  -H "Authorization: Bearer <YOUR_JWT>" `
  -d "{}"
```

**Expected:**
```json
{
  "data": {
    "id": "<uuid>",
    "tenantId": "<tenant-id>",
    "requesterId": "<same-as-jwt-sub>",
    "status": "SUBMITTED",
    "createdAt": "2026-01-20T..."
  },
  "meta": {
    "traceId": "..."
  }
}
```

**Capture:** Full JSON response showing requesterId matches JWT sub claim

---

## ✅ Completion Checklist

To certify **EVI005 = COMPLETE**, paste these 4 items:

1. [ ] Startup snippet (no JWKS crash)
2. [ ] `whoami` response JSON (actorId present)
3. [ ] 401 response (status + body)
4. [ ] 200 create response JSON (requesterId matches JWT)

**When all 4 are pasted below → EVI005 = COMPLETE ✅**

---

## Evidence Template (EVI005-AUTH-INTEGRATION.md)

### [1] Startup (auth required path doesn't crash)

**Command:**

```bash
pnpm --filter web dev:webpack
```

**Capture:**

* startup logs showing server runs
* no "JWKS crash-loop" errors

**Status:** ⏳ Pending execution

**Output:**
```
<paste startup logs showing clean start>
```

---

### [2] Signup or Login produces a real JWT

**Action:** call login/signup and obtain token.

**Status:** ⏳ Pending execution

**Capture (paste JSON):**

```json
{
  "data": {
    "accessToken": "<redacted>",
    "actorId": "<uuid-or-sub>",
    "email": "..."
  }
}
```

*(Redact token body; keep first ~16 chars + last ~8 chars if needed.)*

---

### [3] Protected route rejects missing/invalid token (401)

**Test:**

```bash
curl.exe -i -X POST "http://localhost:3000/api/requests" ^
  -H "Content-Type: application/json" ^
  -H "X-Tenant-ID: <tenant-id>" ^
  -d "{}"
```

**Status:** ⏳ Pending execution

**Capture:**

* HTTP status line showing **401**
* response body

**Output:**
```
<paste response>
```

---

### [4] Protected route succeeds with real token (200) and actorId is real

**Test:**

```bash
curl.exe -s -X POST "http://localhost:3000/api/requests" ^
  -H "Content-Type: application/json" ^
  -H "X-Tenant-ID: <tenant-id>" ^
  -H "Authorization: Bearer <YOUR_JWT>" ^
  -d "{}"
```

**Status:** ⏳ Pending execution

**Capture (paste JSON):**

* response includes `requesterId` / `actorId` derived from JWT (not dev header)
* includes `traceId` in meta/error envelope (as per kernel)

**Output:**
```json
<paste response>
```

---

### [5] Verify actorId in DB matches JWT (OPTIONAL - bonus proof)

**Query:**

```sql
SELECT id, requester_id, tenant_id, status, created_at 
FROM requests 
ORDER BY created_at DESC 
LIMIT 1;
```

**Status:** ⏳ Optional (only if requesterId is persisted)

**Expected:**
* `requester_id` matches JWT `sub` claim (not dev header value)

**Output:**
```
<paste query result>
```

---

## Acceptance Criteria

**Implementation:**
* [x] Kernel verifies JWT via Neon Auth JWKS (not stubbed) ✅
* [x] At least one route uses `auth: { mode: "required" }` ✅
* [x] Auth code returns 401 on missing/invalid token ✅
* [x] Auth code extracts actorId from JWT sub (no X-Actor-ID) ✅

**Evidence (REQUIRED for completion):**
* [ ] Evidence block [1]: Startup (no crash)
* [ ] Evidence block [2]: whoami with JWT (actorId extracted)
* [ ] Evidence block [3]: Protected route rejects 401 (no token)
* [ ] Evidence block [4]: Protected route succeeds 200 (with JWT)
* [ ] (Optional) Evidence block [5]: DB proof (requesterId matches JWT)

**CRITICAL:** Implementation ≠ Complete. EVI005 = COMPLETE **only when evidence [1]-[4] are captured.**

---

## "Don't get stuck" guardrails

* If JWKS fetch fails: return `503 AUTH_UNAVAILABLE` (optional) or `401` with clear code — but **do not crash**.
* Cache JWKS with TTL to avoid rate limits.
* Keep token extraction to **Authorization header only** in Phase 1. Cookies/session can be Phase 2.

---

## Implementation Notes

**Current kernel auth contract:**

Location: `packages/api-kernel/src/auth.ts`

```typescript
// Current modes:
auth: { mode: "public" | "optional" | "required" | "dev" }

// Dev mode (current EVI001-004):
// - Accepts any Bearer token
// - Reads X-Actor-ID header
// - Reads X-Actor-Roles header

// Required mode (EVI005 target):
// - Extracts JWT from Authorization: Bearer <jwt>
// - Verifies signature via JWKS
// - Extracts actorId from sub claim
// - Extracts roles from claims (if present)
// - Returns 401 if missing/invalid
```

**Environment variables needed:**

```bash
NEON_AUTH_BASE_URL=https://...neonauth.../auth  # Already in env.localCopy
JWKS_URL=https://...neonauth.../.well-known/jwks.json  # Already in env.localCopy
```

---

## Files to Modify

**New files:**
```
packages/auth/src/
├── neon/
│   ├── config.ts       # Env config reader
│   ├── jwks.ts         # JWKS fetch + cache
│   └── verify.ts       # JWT verification
└── index.ts            # Export verifyJWT function
```

**Modified files:**
```
packages/api-kernel/src/auth.ts           # Add JWT verification path
apps/web/app/api/requests/route.ts        # Change to auth: { mode: "required" }
apps/web/app/api/auth/login/route.ts      # Call Neon Auth (if implementing login)
apps/web/app/api/auth/signup/route.ts     # Call Neon Auth (if implementing signup)
```

---

**End of EVI005 Plan**
