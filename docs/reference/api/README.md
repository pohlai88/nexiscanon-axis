# API Reference

> **Reference**: Complete documentation for all API endpoints.

## Base URL

```
Production: https://nexuscanon-axis.vercel.app/api
Local:      http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via session cookie. The session is set after login via `/api/auth`.

---

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| [`/api/health`](./health.md) | GET | No | Health check |
| [`/api/auth/[...all]`](./auth.md) | * | No | Neon Auth proxy |
| [`/api/tenants`](./tenants.md) | GET | No | Tenant discovery |
| [`/api/validate-key`](./validate-key.md) | POST | API Key | Validate API key |
| [`/api/upload`](./upload.md) | POST | Yes | R2 presigned URLs |
| [`/api/webhooks/stripe`](./webhooks-stripe.md) | POST | Stripe Sig | Stripe webhooks |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Some endpoints are rate-limited to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 requests/minute |
| `/api/validate-key` | 100 requests/minute |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```
